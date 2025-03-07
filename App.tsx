import React, { useState } from 'react';
import { View, Button, SafeAreaView, StyleSheet } from 'react-native';

// Screens
import StudentDashboardScreen from './src/screens/student/DashboardScreen';
import FaceRegistrationScreen from './src/screens/student/FaceRegistrationScreen';
import ManualAttendanceScreen from './src/screens/teacher/ManualAttendanceScreen';
// In App.tsx
import ConnectionTest from './src/components/ConnectionTest';

// Add this somewhere in your component structure
<ConnectionTest />

const AppNavigator: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState('Dashboard');

  const renderScreen = () => {
    switch (currentScreen) {
      case 'Dashboard':
        return <StudentDashboardScreen />;
      case 'Face Registration':
        return <FaceRegistrationScreen />;
      case 'Manual Attendance':
        return <ManualAttendanceScreen />;
      default:
        return <StudentDashboardScreen />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.screenContainer}>{renderScreen()}</View>
      <View style={styles.navbar}>
        <Button title="Dashboard" onPress={() => setCurrentScreen('Dashboard')} />
        <Button title="Face Registration" onPress={() => setCurrentScreen('Face Registration')} />
        <Button title="Manual Attendance" onPress={() => setCurrentScreen('Manual Attendance')} />
      </View>
    </SafeAreaView>
  );
};

const App: React.FC = () => {
  return <AppNavigator />;
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  screenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    backgroundColor: '#f8f9fa',
    borderTopWidth: 1,
    borderColor: '#ddd',
  },
});


export default App;