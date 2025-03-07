import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface HistoryItem {
  _id: string;
  studentId: { name: string };
  courseId: string;
  status: string;
}

const ClassDetailsScreen = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const response = await fetch('http://localhost:3000/api/attendance/history', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json();
        setHistory(data);
      } catch (error) {
        Alert.alert('Error', 'Failed to load history');
      }
      setLoading(false);
    };

    fetchHistory();
  }, []);

  if (loading) return <ActivityIndicator size="large" />;

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <FlatList
        data={history}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text>{item.studentId.name} - {item.courseId} - {item.status}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = {
  item: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#ddd' },
};

export default  ClassDetailsScreen;
