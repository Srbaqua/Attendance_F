import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Switch } from 'react-native';
import { Text, Card, Button, Divider, Avatar } from 'react-native-elements';
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

const TeacherDashboardScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
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
      const response = await axios.get(`${API_URL}/api/teacher/attendance-stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
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
        const success = await BluetoothService.startAdvertising(user.id);
        setIsBeaconActive(success);
      } else {
        await BluetoothService.stopAdvertising();
        setIsBeaconActive(false);
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

  return (
    <ScrollView style={styles.container}>
      <Card>
        <Card.Title>Proximity Beacon</Card.Title>
        <Card.Divider />
        <View style={styles.row}>
          <Text>{isBeaconActive ? 'Active - Students can detect your presence' : 'Inactive - Turn on to allow students to mark attendance'}</Text>
          <Switch value={isBeaconActive} onValueChange={toggleBeacon} />
        </View>
      </Card>

      <Card>
        <Card.Title>Today's Attendance</Card.Title>
        <Card.Divider />
        <Text>{`${displayStats.presentToday} of ${displayStats.totalStudents} students present`}</Text>
        <View style={styles.statsRow}>
          <Text style={styles.statValue}>{displayStats.attendanceRate}%</Text>
          <Text style={styles.statValue}>{displayStats.totalStudents - displayStats.presentToday} Absent</Text>
        </View>
        <Button title="Mark Attendance Manually" type="outline" onPress={() => navigation.navigate('ManualAttendance')} />
      </Card>

      <Card>
        <Card.Title>Classes Today</Card.Title>
        <Card.Divider />
        {displayStats.presentByClass.map((classItem, index) => (
          <View key={index}>
            <View style={styles.row}>
              <Avatar rounded title={classItem.className.substring(0, 2)} />
              <Text>{`${classItem.className} (${Math.round((classItem.present / classItem.total) * 100)}%)`}</Text>
              <Button title="View" type="clear" onPress={() => navigation.navigate('ClassDetails', { classId: index })} />
            </View>
            {index < displayStats.presentByClass.length - 1 && <Divider />}
          </View>
        ))}
      </Card>

      <Button title="Refresh Data" icon={{ name: 'refresh', color: 'white' }} loading={loading} onPress={fetchAttendanceStats} containerStyle={{ marginTop: 16 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
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
});

export default TeacherDashboardScreen;
