import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';

const ClassManagementScreen = () => {
  const handleAddClass = () => Alert.alert('Feature', 'Add class functionality');

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, textAlign: 'center', marginBottom: 20 }}>Manage Classes</Text>
      <TouchableOpacity onPress={handleAddClass} style={styles.button}>
        <Text style={styles.buttonText}>Add Class</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = {
  button: { backgroundColor: '#28a745', padding: 15, borderRadius: 5, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 18 },
};

export default ClassManagementScreen;
