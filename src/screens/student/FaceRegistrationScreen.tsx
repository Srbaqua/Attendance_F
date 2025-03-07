import React, { useState, useRef } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { RNCamera } from 'react-native-camera';
import { Button, Text } from 'react-native-elements';
import { useAuth } from '../../../contexts/AuthContext';
import { API_URL } from '../../../config';
import axios from 'axios';

const FaceRegistrationScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { token } = useAuth();
  const [faceDetected, setFaceDetected] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const cameraRef = useRef<RNCamera | null>(null);

  const handleFaceDetected = ({ faces }: { faces: any[] }) => {
    setFaceDetected(faces.length > 0);
    // Clear error when a face is detected
    if (faces.length > 0 && errorMessage) {
      setErrorMessage(null);
    }
  };

  const takePicture = async () => {
    if (cameraRef.current && faceDetected && !processing) {
      try {
        setProcessing(true);
        setErrorMessage(null);
        
        // Take picture
        const data = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: true,
        });

        // Send to server
        try {
          const response = await axios.post(
            `${API_URL}/api/students/register-face`, 
            { faceData: data.base64 }, 
            { 
              headers: { 
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              timeout: 15000 // 15 second timeout since face processing might take time
            }
          );

          Alert.alert(
            'Success', 
            'Your face has been registered successfully!', 
            [{ text: 'OK', onPress: () => navigation.goBack() }]
          );
        } catch (error) {
          console.error('API Error:', error);
          
          if (axios.isAxiosError(error)) {
            // Handle Axios specific errors
            if (error.response) {
              // The server responded with a status code outside the 2xx range
              setErrorMessage(`Server error: ${error.response.data.message || 'Unknown error'}`);
            } else if (error.request) {
              // The request was made but no response was received
              setErrorMessage('Network error: No response from server. Please check your connection.');
            } else {
              // Something happened in setting up the request
              setErrorMessage(`Error: ${error.message}`);
            }
          } else {
            // Handle non-Axios errors
            setErrorMessage('An unexpected error occurred');
          }
          
          Alert.alert('Registration Failed', errorMessage || 'Failed to register face. Please try again.');
        }
      } catch (cameraError) {
        setErrorMessage('Failed to capture image. Please try again.');
        Alert.alert('Camera Error', 'Failed to capture image. Please try again.');
      } finally {
        setProcessing(false);
      }
    } else if (!faceDetected) {
      setErrorMessage('No face detected. Please position your face in the frame.');
    }
  };

  return (
    <View style={styles.container}>
      <Text h4 style={styles.title}>Face Registration</Text>
      <Text style={styles.instructions}>Position your face in the frame and ensure good lighting.</Text>

      <View style={styles.cameraContainer}>
        {processing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007bff" />
            <Text style={styles.loadingText}>Processing your face data...</Text>
          </View>
        ) : (
          <RNCamera 
            ref={cameraRef} 
            style={styles.camera} 
            type={RNCamera.Constants.Type.front} 
            captureAudio={false} 
            onFacesDetected={handleFaceDetected}
            androidCameraPermissionOptions={{
              title: 'Permission to use camera',
              message: 'We need your permission to use your camera for face registration',
              buttonPositive: 'OK',
              buttonNegative: 'Cancel',
            }}
          />
        )}
        
        <Text style={[styles.faceIndicator, { color: faceDetected ? 'green' : 'red' }]}>
          {faceDetected ? 'Face Detected' : 'No Face Detected'}
        </Text>
        
        {errorMessage && (
          <Text style={styles.errorMessage}>{errorMessage}</Text>
        )}
      </View>

      <Button 
        title={processing ? "Processing..." : "Register My Face"} 
        disabled={!faceDetected || processing} 
        onPress={takePicture} 
        loading={processing} 
        containerStyle={{ marginTop: 20 }}
        buttonStyle={{ backgroundColor: '#007bff' }}
      />
      
      <Button 
        title="Cancel" 
        type="outline"
        onPress={() => navigation.goBack()} 
        containerStyle={{ marginTop: 10 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 16, 
    backgroundColor: '#f5f5f5' 
  },
  title: { 
    textAlign: 'center', 
    marginBottom: 16 
  },
  instructions: { 
    textAlign: 'center', 
    marginBottom: 24 
  },
  cameraContainer: { 
    aspectRatio: 3 / 4, 
    width: '100%', 
    borderRadius: 12, 
    overflow: 'hidden', 
    marginBottom: 24,
    backgroundColor: '#e0e0e0' 
  },
  camera: { 
    flex: 1 
  },
  faceIndicator: { 
    textAlign: 'center', 
    marginTop: 10, 
    fontWeight: 'bold' 
  },
  errorMessage: {
    textAlign: 'center',
    color: 'red',
    marginTop: 8,
    padding: 8
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5'
  },
  loadingText: {
    marginTop: 10,
    textAlign: 'center'
  }
});

export default FaceRegistrationScreen;