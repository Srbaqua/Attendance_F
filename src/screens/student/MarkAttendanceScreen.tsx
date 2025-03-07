import React, { useState, useRef } from 'react';
import { View, StyleSheet, Alert, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { RNCamera } from 'react-native-camera';
import axios from 'axios';
import { useAuth } from '../../../contexts/AuthContext';
import { API_URL } from '../../../config';
import BluetoothService, { TeacherBeacon } from '../../services/native-bluetooth';

const MarkAttendanceScreen = () => {
  const { token } = useAuth();
  const [faceDetected, setFaceDetected] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [nearbyTeachers, setNearbyTeachers] = useState<TeacherBeacon[]>([]);
  const [scanningBluetooth, setScanningBluetooth] = useState(false);
  const [attendanceStatus, setAttendanceStatus] = useState<string | null>(null);
  const cameraRef = useRef(null);

  const scanForTeachers = async () => {
    setScanningBluetooth(true);
    try {
      const stopScanning = await BluetoothService.startScanning(setNearbyTeachers);
      setTimeout(() => {
        if (stopScanning) stopScanning();
        setScanningBluetooth(false);
      }, 10000);
    } catch (error) {
      console.error('Failed to scan for teachers:', error);
      Alert.alert('Error', 'Failed to scan for Bluetooth devices.');
      setScanningBluetooth(false);
    }
  };

  const handleFacesDetected = ({ faces }) => {
    setFaceDetected(faces.length > 0);
  };

  const markAttendance = async () => {
    if (cameraRef.current && faceDetected && !processing) {
      if (nearbyTeachers.length === 0) {
        Alert.alert('No Teachers Found', 'Please scan for nearby teachers first.');
        return;
      }
      try {
        setProcessing(true);
        const options = { quality: 0.8, base64: true, width: 720 };
        const photo = await cameraRef.current.takePictureAsync(options);
        const closestTeacher = nearbyTeachers.reduce((prev, current) => (prev.rssi > current.rssi ? prev : current));
        await axios.post(
          `${API_URL}/api/attendance/mark`,
          { faceImage: photo.base64, teacherId: closestTeacher.deviceId, verificationMethod: 'face+proximity' },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setAttendanceStatus('present');
        Alert.alert('Success', 'Your attendance has been marked successfully!');
      } catch (error) {
        console.error(error);
        setAttendanceStatus('failed');
        Alert.alert('Error', 'Failed to mark attendance. Please try again.');
      } finally {
        setProcessing(false);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mark Attendance</Text>
      <Text style={styles.status}>{nearbyTeachers.length > 0 ? `${nearbyTeachers.length} Teachers Nearby` : 'No Teachers Detected'}</Text>
      <Text style={styles.status}>{faceDetected ? 'Face Detected' : 'No Face Detected'}</Text>
      <View style={styles.cameraContainer}>
        <RNCamera
          ref={cameraRef}
          style={styles.camera}
          type={RNCamera.Constants.Type.front}
          captureAudio={false}
          onFacesDetected={handleFacesDetected}
        />
      </View>
      {attendanceStatus && (
        <Text style={[styles.attendanceText, { color: attendanceStatus === 'present' ? 'green' : 'red' }]}>
          {attendanceStatus === 'present' ? 'Attendance Marked' : 'Verification Failed'}
        </Text>
      )}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={scanForTeachers} disabled={processing}>
          {scanningBluetooth ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Scan for Teachers</Text>}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, (!faceDetected || nearbyTeachers.length === 0 || processing) && styles.disabledButton]}
          onPress={markAttendance}
          disabled={!faceDetected || nearbyTeachers.length === 0 || processing}
        >
          {processing ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Mark Attendance</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f5f5f5', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  status: { fontSize: 16, marginBottom: 8 },
  cameraContainer: { aspectRatio: 3 / 4, width: '100%', borderRadius: 12, overflow: 'hidden', marginBottom: 16 },
  camera: { flex: 1 },
  attendanceText: { fontSize: 18, fontWeight: 'bold', marginTop: 10 },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 16 },
  button: { flex: 1, backgroundColor: '#007bff', padding: 10, borderRadius: 5, marginHorizontal: 5, alignItems: 'center' },
  disabledButton: { backgroundColor: '#cccccc' },
  buttonText: { color: 'white', fontWeight: 'bold' }
});

export default MarkAttendanceScreen;