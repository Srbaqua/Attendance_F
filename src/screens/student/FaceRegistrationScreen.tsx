import React, { useState, useRef } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { RNCamera } from 'react-native-camera';
import { Button, Text } from 'react-native-elements';
import { useAuth } from '../../../contexts/AuthContext';
import { API_URL } from '../../../config';
import axios from 'axios';

const FaceRegistrationScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { token } = useAuth();
  const [faceDetected, setFaceDetected] = useState(false);
  const [processing, setProcessing] = useState(false);
  const cameraRef = useRef<RNCamera | null>(null);

  const handleFaceDetected = ({ faces }: { faces: any[] }) => {
    setFaceDetected(faces.length > 0);
  };

  const takePicture = async () => {
    if (cameraRef.current && faceDetected && !processing) {
      try {
        setProcessing(true);
        const data = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: true,
        });

        await axios.post(`${API_URL}/api/students/register-face`, { faceData: data.base64 }, { headers: { Authorization: `Bearer ${token}` } });

        Alert.alert('Success', 'Your face has been registered successfully!', [{ text: 'OK', onPress: () => navigation.goBack() }]);
      } catch (error) {
        Alert.alert('Error', 'Failed to register face. Please try again.');
      } finally {
        setProcessing(false);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text h4 style={styles.title}>Face Registration</Text>
      <Text style={styles.instructions}>Position your face in the frame and ensure good lighting.</Text>

      <View style={styles.cameraContainer}>
        <RNCamera ref={cameraRef} style={styles.camera} type={RNCamera.Constants.Type.front} captureAudio={false} onFacesDetected={handleFaceDetected} />
        <Text style={[styles.faceIndicator, { color: faceDetected ? 'green' : 'red' }]}>{faceDetected ? 'Face Detected' : 'No Face Detected'}</Text>
      </View>

      <Button title="Register My Face" disabled={!faceDetected || processing} onPress={takePicture} loading={processing} containerStyle={{ marginTop: 20 }} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f5f5f5' },
  title: { textAlign: 'center', marginBottom: 16 },
  instructions: { textAlign: 'center', marginBottom: 24 },
  cameraContainer: { aspectRatio: 3 / 4, width: '100%', borderRadius: 12, overflow: 'hidden', marginBottom: 24 },
  camera: { flex: 1 },
  faceIndicator: { textAlign: 'center', marginTop: 10, fontWeight: 'bold' },
});

export default FaceRegistrationScreen;
