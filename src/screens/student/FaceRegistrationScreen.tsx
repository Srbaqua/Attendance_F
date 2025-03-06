// src/screens/student/FaceRegistrationScreen.tsx
import React, { useState, useRef } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Camera } from 'expo-camera';
import { Button, Text } from 'react-native-paper';
import * as FaceDetector from 'expo-face-detector';
import axios from 'axios';
import { useAuth } from '../../../contexts/AuthContext';
import { API_URL } from '../../../config';

const FaceRegistrationScreen = ({ navigation }) => {
  const { token } = useAuth();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [faceDetected, setFaceDetected] = useState(false);
  const [processing, setProcessing] = useState(false);
  const cameraRef = useRef<Camera>(null);

  React.useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleFacesDetected = ({ faces }) => {
    if (faces.length > 0) {
      setFaceDetected(true);
    } else {
      setFaceDetected(false);
    }
  };

  const takePicture = async () => {
    if (cameraRef.current && faceDetected && !processing) {
      try {
        setProcessing(true);
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: true,
        });

        // Send to server for registration
        const response = await axios.post(
          `${API_URL}/api/students/register-face`,
          { faceData: photo.base64 },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        Alert.alert(
          "Success",
          "Your face has been registered successfully!",
          [{ text: "OK", onPress: () => navigation.goBack() }]
        );
      } catch (error) {
        console.error(error);
        Alert.alert(
          "Error",
          "Failed to register face. Please try again."
        );
      } finally {
        setProcessing(false);
      }
    }
  };

  if (hasPermission === null) {
    return <View><Text>Requesting camera permission...</Text></View>;
  }

  if (hasPermission === false) {
    return <View><Text>No access to camera. Please enable camera permissions.</Text></View>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Face Registration</Text>
      <Text style={styles.instructions}>
        Position your face in the frame and ensure good lighting.
      </Text>

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

        <View style={[
          styles.faceIndicator,
          { borderColor: faceDetected ? '#00C853' : '#FF3D00' }
        ]}>
          <Text style={styles.faceIndicatorText}>
            {faceDetected ? 'Face Detected' : 'No Face Detected'}
          </Text>
        </View>
      </View>

      <Button
        mode="contained"
        disabled={!faceDetected || processing}
        onPress={takePicture}
        style={styles.button}
        loading={processing}
      >
        {processing ? 'Processing...' : 'Register My Face'}
      </Button>
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
  instructions: {
    marginBottom: 24,
    textAlign: 'center',
  },
  cameraContainer: {
    aspectRatio: 3/4,
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  faceIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
    borderWidth: 2,
    borderRadius: 24,
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  faceIndicatorText: {
    color: 'white',
    fontWeight: 'bold',
  },
  button: {
    padding: 8,
  },
});

export default FaceRegistrationScreen;

