import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';

const ManualAttendanceScreen = () => {
  const [studentId, setStudentId] = useState('');
  const handleMarkAttendance = () => Alert.alert('Marked', `Attendance marked for ${studentId}`);

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <TextInput placeholder="Student ID" value={studentId} onChangeText={setStudentId} style={styles.input} />
      <TouchableOpacity onPress={handleMarkAttendance} style={styles.button}>
        <Text style={styles.buttonText}>Mark Attendance</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = {
  input: { borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 5 },
  button: { backgroundColor: '#ff5733', padding: 15, borderRadius: 5, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 18 },
};

export default ManualAttendanceScreen;
