import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';

const RegisterScreen = ({ onNavigate }) => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student'); // Default role as student

  const handleRegister = async () => {
    try {
      const response = await fetch('http://10.10.41.4:3000/api/users/register', {  // Replace X.X with your local IP
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, username, password, role }),
      });

      const data = await response.json();
      if (response.ok) {
        Alert.alert('Success', 'Registration successful!');
        onNavigate('Login');
      } else {
        Alert.alert('Error', data.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong');
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
      <Text style={{ fontSize: 24, textAlign: 'center', marginBottom: 20 }}>Register</Text>
      <TextInput placeholder="Full Name" value={name} onChangeText={setName} style={styles.input} />
      <TextInput placeholder="Username" value={username} onChangeText={setUsername} style={styles.input} />
      <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />
      <TouchableOpacity onPress={handleRegister} style={styles.button}>
        <Text style={{ color: '#fff', fontSize: 18 }}>Register</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => onNavigate('Login')}>
        <Text style={{ textAlign: 'center', marginTop: 10 }}>Already have an account? Login</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = {
  input: { borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 5 },
  button: { backgroundColor: '#28a745', padding: 15, borderRadius: 5, alignItems: 'center' },
};

export default RegisterScreen;
