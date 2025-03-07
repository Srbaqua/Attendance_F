import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';

const ManualAttendanceScreen = () => {
  const [studentId, setStudentId] = useState('');

  const handleMarkAttendance = () => {
    if (!studentId.trim()) {
      Alert.alert('Error', 'Please enter a valid Student ID');
      return;
    }
    Alert.alert('Marked', `Attendance marked for ${studentId}`);
    setStudentId(''); // Clear input after marking attendance
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Student ID"
        value={studentId}
        onChangeText={setStudentId}
        style={styles.input}
        keyboardType="numeric"
      />
      <TouchableOpacity
        onPress={handleMarkAttendance}
        style={styles.button}
      >
        <Text style={styles.buttonText}>Mark Attendance</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 20,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#ff5733',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '500',
  },
});

export default ManualAttendanceScreen;