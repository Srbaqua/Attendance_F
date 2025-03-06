// src/screens/student/MarkAttendanceScreen.tsx
import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Camera } from 'expo-camera';
import { Button, Text, ActivityIndicator, Chip } from 'react-native-paper';
import * as FaceDetector from 'expo-face-detector';
import axios from 'axios';
import { useAuth } from '../../../contexts/AuthContext';
import { API_URL } from '../../../config';
import BluetoothService, { TeacherBeacon } from '../../services/native-bluetooth';

const MarkAttendanceScreen = () => {
  const { token, user } = useAuth();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [faceDetected, setFaceDetected] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [nearbyTeachers, setNearbyTeachers] = useState<TeacherBeacon[]>([]);
  const [scanningBluetooth, setScanningBluetooth] = useState(false);
  const [attendanceStatus, setAttendanceStatus] = useState<string | null>(null);
  const cameraRef = useRef<Camera>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const scanForTeachers = async () => {
    setScanningBluetooth(true);
    try {
      await BluetoothService.startScanning((teachers) => {
        setNearbyTeachers(teachers);
      });
    } catch (error) {
      console.error('Failed to scan for teachers:', error);
      Alert.alert('Error', 'Failed to scan for Bluetooth devices.');
    } finally {
      setTimeout(() => {
        setScanningBluetooth(false);
      }, 10000);
    }
  };

  const handleFacesDetected = ({ faces }) => {
    if (faces.length > 0) {
      setFaceDetected(true);
    } else {
      setFaceDetected(false);
    }
  };

  const markAttendance = async () => {
    if (cameraRef.current && faceDetected && !processing) {
      if (nearbyTeachers.length === 0) {
        Alert.alert('No Teachers Found', 'Please scan for nearby teachers first.');
        return;
      }

      try {
        setProcessing(true);
        const photo = await c
        // Continued from previous code...
                const photo = await cameraRef.current.takePictureAsync({
                  quality: 0.8,
                  base64: true,
                });

                // Get closest teacher from bluetooth scan
                const closestTeacher = nearbyTeachers.reduce((prev, current) =>
                  (prev.rssi > current.rssi) ? prev : current
                );

                // Send to server for authentication and attendance marking
                const response = await axios.post(
                  `${API_URL}/api/attendance/mark`,
                  {
                    faceImage: photo.base64,
                    teacherId: closestTeacher.deviceId,
                    courseId: 'CURRENT_COURSE', // This should be selected by the student or determined by context
                    location: 'CLASSROOM', // Can be enhanced with geolocation
                    verificationMethod: 'face+proximity'
                  },
                  { headers: { Authorization: `Bearer ${token}` } }
                );

                setAttendanceStatus('present');
                Alert.alert(
                  "Success",
                  "Your attendance has been marked successfully!",
                );
              } catch (error) {
                console.error(error);
                setAttendanceStatus('failed');
                Alert.alert(
                  "Error",
                  "Failed to mark attendance. Please try again."
                );
              } finally {
                setProcessing(false);
              }
            }
          };

          if (hasPermission === null) {
            return <View style={styles.container}><Text>Requesting camera permission...</Text></View>;
          }

          if (hasPermission === false) {
            return <View style={styles.container}><Text>No access to camera. Please enable camera permissions.</Text></View>;
          }

          return (
            <View style={styles.container}>
              <Text style={styles.title}>Mark Attendance</Text>

              <View style={styles.statusContainer}>
                <Chip
                  icon="bluetooth"
                  style={styles.statusChip}
                  mode="outlined"
                >
                  {nearbyTeachers.length > 0
                    ? `${nearbyTeachers.length} Teachers Nearby`
                    : 'No Teachers Detected'}
                </Chip>

                <Chip
                  icon="face-recognition"
                  style={styles.statusChip}
                  mode="outlined"
                >
                  {faceDetected ? 'Face Detected' : 'No Face Detected'}
                </Chip>
              </View>

              <View style={styles.cameraContainer}>
                <Camera
                  ref={cameraRef}
                  style={styles.camera}
                  type={Camera.Constants.Type.front}
                  onFacesDetected={handleFacesDetected}
                  faceDetectorSettings={{
                    mode: FaceDetector.FaceDetectorMode.fast,
                    detectLandmarks: FaceDetector.FaceDetectorLandmarks.none,
                    runClassifications: FaceDetector.FaceDetectorClassifications.none,
                    minDetectionInterval: 100,
                    tracking: true,
                  }}
                />

                {attendanceStatus && (
                  <View style={[
                    styles.attendanceIndicator,
                    { backgroundColor: attendanceStatus === 'present' ? '#4CAF50' : '#F44336' }
                  ]}>
                    <Text style={styles.attendanceText}>
                      {attendanceStatus === 'present' ? 'Attendance Marked' : 'Verification Failed'}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.buttonContainer}>
                <Button
                  mode="outlined"
                  icon="bluetooth-search"
                  onPress={scanForTeachers}
                  style={styles.button}
                  loading={scanningBluetooth}
                  disabled={processing}
                >
                  {scanningBluetooth ? 'Scanning...' : 'Scan for Teachers'}
                </Button>

                <Button
                  mode="contained"
                  icon="camera"
                  disabled={!faceDetected || nearbyTeachers.length === 0 || processing}
                  onPress={markAttendance}
                  style={styles.button}
                  loading={processing}
                >
                  {processing ? 'Verifying...' : 'Mark Attendance'}
                </Button>
              </View>

              {nearbyTeachers.length > 0 && (
                <View style={styles.teachersList}>
                  <Text style={styles.teachersTitle}>Detected Teachers:</Text>
                  {nearbyTeachers.map((teacher, index) => (
                    <Chip
                      key={teacher.deviceId}
                      style={styles.teacherChip}
                      icon="account"
                    >
                      {teacher.name} (Signal: {teacher.rssi})
                    </Chip>
                  ))}
                </View>
              )}
            </View>
          );
        };

        const styles = StyleSheet.create({
          container: {
            flex: 1,
            padding: 16,
            backgroundColor: '#f5f5f5',
          },
          title: {
            fontSize: 24,
            fontWeight: 'bold',
            marginBottom: 16,
            textAlign: 'center',
          },
          statusContainer: {
            flexDirection: 'row',
            justifyContent: 'space-around',
            marginBottom: 16,
          },
          statusChip: {
            marginHorizontal: 4,
          },
          cameraContainer: {
            aspectRatio: 3/4,
            width: '100%',
            borderRadius: 12,
            overflow: 'hidden',
            marginBottom: 16,
            position: 'relative',
          },
          camera: {
            flex: 1,
          },
          attendanceIndicator: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: 12,
            alignItems: 'center',
          },
          attendanceText: {
            color: 'white',
            fontWeight: 'bold',
            fontSize: 16,
          },
          buttonContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 16,
          },
          button: {
            flex: 1,
            marginHorizontal: 4,
          },
          teachersList: {
            marginTop: 16,
          },
          teachersTitle: {
            fontSize: 16,
            fontWeight: 'bold',
            marginBottom: 8,
          },
          teacherChip: {
            marginVertical: 4,
          },
        });

        export default MarkAttendanceScreen;