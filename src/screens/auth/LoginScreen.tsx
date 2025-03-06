import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      if (response.ok) {
        await AsyncStorage.setItem('token', data.token);
        Alert.alert('Success', 'Login successful!');
        navigation.navigate('Home'); // Navigate to Home or Dashboard
      } else {
        Alert.alert('Error', data.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong');
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
      <Text style={{ fontSize: 24, textAlign: 'center', marginBottom: 20 }}>Login</Text>
      <TextInput placeholder="Username" value={username} onChangeText={setUsername} style={styles.input} />
      <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />
      <TouchableOpacity onPress={handleLogin} style={styles.button}>
        <Text style={{ color: '#fff', fontSize: 18 }}>Login</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={{ textAlign: 'center', marginTop: 10 }}>Don't have an account? Register</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = {
  input: { borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 5 },
  button: { backgroundColor: '#007bff', padding: 15, borderRadius: 5, alignItems: 'center' },
};

export default LoginScreen;
