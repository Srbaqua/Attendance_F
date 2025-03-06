// src/screens/teacher/DashboardScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Button, Switch, List, Divider, Avatar } from 'react-native-paper';
// import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { useAuth } from '../../../contexts/AuthContext';
import { API_URL } from '../../../config';
import BluetoothService from '../../services/native-bluetooth';

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

const TeacherDashboardScreen = ({ navigation }) => {
  const { user, token } = useAuth();
  const [isBeaconActive, setIsBeaconActive] = useState(false);
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttendanceStats();
  }, []);

  const fetchAttendanceStats = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/api/teacher/attendance-stats`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleBeacon = async () => {
    try {
      if (!isBeaconActive) {
        // Start advertising as a teacher beacon
        const success = await BluetoothService.startAdvertising(user.id);
        setIsBeaconActive(success);
      } else {
        // Stop advertising
        await BluetoothService.stopAdvertising();
        setIsBeaconActive(false);
      }
    } catch (error) {
      console.error('Failed to toggle beacon:', error);
    }
  };

  // Mock data for the UI in case the API isn't ready
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

  // Use mock data if real data isn't loaded
  const displayStats = stats || mockStats;

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.beaconCard}>
        <Card.Content>
          <View style={styles.beaconHeader}>
            <Text style={styles.beaconTitle}>Proximity Beacon</Text>
            <Switch
              value={isBeaconActive}
              onValueChange={toggleBeacon}
            />
          </View>
          <Text style={styles.beaconStatus}>
            {isBeaconActive 
              ? 'Active - Students can detect your presence' 
              : 'Inactive - Turn on to allow students to mark attendance'}
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.statsCard}>
        <Card.Title 
          title="Today's Attendance" 
          subtitle={`${displayStats.presentToday} of ${displayStats.totalStudents} students present`}
        />
        <Card.Content>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{displayStats.attendanceRate}%</Text>
              <Text style={styles.statLabel}>Attendance Rate</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{displayStats.totalStudents - displayStats.presentToday}</Text>
              <Text style={styles.statLabel}>Absent</Text>
            </View>
          </View>
          
          <Button 
            mode="outlined" 
            onPress={() => navigation.navigate('ManualAttendance')}
            style={styles.actionButton}
          >
            Mark Attendance Manually
          </Button>
        </Card.Content>
      </Card>

      <Card style={styles.classesCard}>
        <Card.Title title="Classes Today" />
        <Card.Content>
          <List.Section>
            {displayStats.presentByClass.map((classItem, index) => (
              <React.Fragment key={index}>
                <List.Item
                  title={classItem.className}
                  description={`${classItem.present}/${classItem.total} present (${Math.round(classItem.present/classItem.total*100)}%)`}
                  left={props => <Avatar.Text size={40} label={classItem.className.substring(0, 2)} />}
                  right={props => (
                    <Button 
                      mode="text" 
                      onPress={() => navigation.navigate('ClassDetails', { classId: index })}
                    >
                      View
                    </Button>
                  )}
                />
                {index < displayStats.presentByClass.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List.Section>
        </Card.Content>
      </Card>

      <Button
        mode="contained"
        icon="refresh"
        onPress={fetchAttendanceStats}
        style={styles.refreshButton}
        loading={loading}
      >
        Refresh Data
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  beaconCard: {
    marginBottom: 16,
    elevation: 2,
  },
  beaconHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  beaconTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  beaconStatus: {
    color: '#666',
  },
  statsCard: {
    marginBottom: 16,
    elevation: 2,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  statLabel: {
    color: '#666',
    marginTop: 4,
  },
  actionButton: {
    marginTop: 8,
  },
  classesCard: {
    marginBottom: 16,
    elevation: 2,
  },
  refreshButton: {
    marginBottom: 24,
  },
});

export default TeacherDashboardScreen;