import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Switch, Alert } from 'react-native';
import { Text, Card, Button, Divider, Avatar } from 'react-native-elements';
import axios from 'axios';
import { useAuth } from '../../../contexts/AuthContext';
import { API_URL } from '../../../config';
import BluetoothService from '../../services/native-bluetooth';
import NetInfo from '@react-native-community/netinfo';
import { useNavigation } from '@react-navigation/native';

interface AttendanceStats {
  totalStudents: number;
  presentToday: number;
  attendanceRate: number;
  presentByClass: {
    className: string;
    present: number;
    total: number;
  }[];
}

// Properly defined navigation prop types
type NavigationProp = {
  navigate: (screen: string, params?: any) => void;
};

const TeacherDashboardScreen: React.FC = () => {
  // Use the navigation hook instead of receiving it as a prop
  const navigation = useNavigation<NavigationProp>();
  const { user, token } = useAuth();
  const [isBeaconActive, setIsBeaconActive] = useState(false);
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(true);

  // Add network connectivity listener
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected ?? false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (isConnected) {
      fetchAttendanceStats();
    } else {
      setLoading(false);
    }
  }, [isConnected]);

  const fetchAttendanceStats = async () => {
    try {
      setLoading(true);

      // Check if network is available
      if (!isConnected) {
        throw new Error('No internet connection');
      }

      // Add a timeout to the axios request
      const response = await axios.get(`${API_URL}/api/teacher/attendance-stats`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000 // 10 seconds timeout
      });

      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);

      // Handle network error more gracefully
      if (axios.isAxiosError(error) && !error.response) {
        Alert.alert(
          'Network Error',
          'Unable to connect to the server. Please check your internet connection and try again.',
          [{ text: 'OK' }]
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleBeacon = async () => {
    try {
      if (!user || !user.id) {
        Alert.alert('Error', 'User information is not available');
        return;
      }

      if (!isBeaconActive) {
        // Wrapping in try/catch to handle potential native module errors
        try {
          const success = await BluetoothService.startAdvertising(user.id);
          setIsBeaconActive(success);
        } catch (error) {
          console.error('Native module error:', error);
          Alert.alert(
            'Bluetooth Error',
            'Failed to start Bluetooth advertising. Please ensure Bluetooth is enabled.'
          );
        }
      } else {
        try {
          await BluetoothService.stopAdvertising();
          setIsBeaconActive(false);
        } catch (error) {
          console.error('Native module error:', error);
          Alert.alert('Bluetooth Error', 'Failed to stop Bluetooth advertising.');
        }
      }
    } catch (error) {
      console.error('Failed to toggle beacon:', error);
    }
  };

  const mockStats: AttendanceStats = {
    totalStudents: 120,
    presentToday: 98,
    attendanceRate: 81.7,
    presentByClass: [
      { className: 'Computer Science 101', present: 35, total: 40 },
      { className: 'Database Systems', present: 28, total: 35 },
      { className: 'Mobile Development', present: 35, total: 45 },
    ],
  };

  const displayStats = stats || mockStats;

  // Safe navigation handler function
  const handleNavigation = (screen: string, params?: any) => {
    if (navigation && navigation.navigate) {
      navigation.navigate(screen, params);
    } else {
      console.error('Navigation is not available');
    }
  };

  return (
    <ScrollView style={styles.container}>
      {!isConnected && (
        <View style={styles.offlineBar}>
          <Text style={styles.offlineText}>You are offline. Some features may be limited.</Text>
        </View>
      )}

      <Card containerStyle={styles.card}>
        <Card.Title>Proximity Beacon</Card.Title>
        <Card.Divider />
        <View style={styles.row}>
          <Text>{isBeaconActive ? 'Active - Students can detect your presence' : 'Inactive - Turn on to allow students to mark attendance'}</Text>
          <Switch
            value={isBeaconActive}
            onValueChange={toggleBeacon}
            disabled={!user || !user.id}
          />
        </View>
      </Card>

      <Card containerStyle={styles.card}>
        <Card.Title>Today's Attendance</Card.Title>
        <Card.Divider />
        <Text>{`${displayStats.presentToday} of ${displayStats.totalStudents} students present`}</Text>
        <View style={styles.statsRow}>
          <Text style={styles.statValue}>{displayStats.attendanceRate}%</Text>
          <Text style={styles.statValue}>{displayStats.totalStudents - displayStats.presentToday} Absent</Text>
        </View>
        <Button
          title="Mark Attendance Manually"
          type="outline"
          onPress={() => handleNavigation('ManualAttendance')}
        />
      </Card>

      <Card containerStyle={styles.card}>
        <Card.Title>Classes Today</Card.Title>
        <Card.Divider />
        {displayStats.presentByClass.map((classItem, index) => (
          <View key={index}>
            <View style={styles.row}>
              <Avatar
                rounded
                title={classItem.className.substring(0, 2)}
                containerStyle={styles.avatar}
              />
              <Text style={styles.className}>{`${classItem.className} (${Math.round((classItem.present / classItem.total) * 100)}%)`}</Text>
              <Button
                title="View"
                type="clear"
                onPress={() => handleNavigation('ClassDetails', { classId: index })}
              />
            </View>
            {index < displayStats.presentByClass.length - 1 && <Divider style={styles.divider} />}
          </View>
        ))}
      </Card>

      <Button
        title="Refresh Data"
        icon={{ name: 'refresh', type: 'material', color: 'white' }}
        loading={loading}
        onPress={fetchAttendanceStats}
        containerStyle={styles.refreshButton}
        disabled={!isConnected}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  offlineBar: {
    backgroundColor: '#ff9800',
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  offlineText: {
    color: 'white',
    fontWeight: 'bold',
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    padding: 5,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 16,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  avatar: {
    backgroundColor: '#2196F3',
  },
  className: {
    flex: 1,
    marginLeft: 10,
  },
  divider: {
    marginVertical: 10,
  },
  refreshButton: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 24,
  },
});

export default TeacherDashboardScreen;