// App.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Auth Screens

import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';

// Student Screens
import StudentDashboardScreen from './src/screens/student/DashboardScreen';
import FaceRegistrationScreen from './src/screens/student/FaceRegistrationScreen';
// import MarkAttendanceScreen from './src/screens/student/MarkAttendanceScreen';
// import StudentHistoryScreen from './src/screens/student/HistoryScreen';
// import StudentProfileScreen from './src/screens/student/ProfileScreen';

// Teacher Screens
import TeacherDashboardScreen from './src/screens/teacher/DashboardScreen';
// import ClassManagementScreen from './src/screens/teacher/ClassManagementScreen';
// import ManualAttendanceScreen from './src/screens/teacher/ManualAttendanceScreen';
// import TeacherHistoryScreen from './src/screens/teacher/HistoryScreen';
import TeacherProfileScreen from './src/screens/teacher/ProfileScreen';

// Auth Context
import { AuthProvider, useAuth } from './contexts/AuthContext';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Student Tab Navigator
const StudentTabNavigator = () => (
  <Tab.Navigator>
    <Tab.Screen name="Dashboard" component={StudentDashboardScreen} />
    {/* <Tab.Screen name="Mark Attendance" component={MarkAttendanceScreen} /> */}
    {/* <Tab.Screen name="History" component={StudentHistoryScreen} /> */}
    {/* <Tab.Screen name="Profile" component={StudentProfileScreen} /> */}
  </Tab.Navigator>
);

// Teacher Tab Navigator
const TeacherTabNavigator = () => (
  <Tab.Navigator>
    <Tab.Screen name="Dashboard" component={TeacherDashboardScreen} />
    {/* <Tab.Screen name="Classes" component={ClassManagementScreen} /> */}
    {/* <Tab.Screen name="Manual Attendance" component={ManualAttendanceScreen} /> */}
    {/* <Tab.Screen name="History" component={TeacherHistoryScreen} /> */}
    <Tab.Screen name="Profile" component={TeacherProfileScreen} />
  </Tab.Navigator>
);

// Main Navigation
const AppNavigator = () => {
  const { isAuthenticated, userRole } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          // Auth Stack
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          // Role-based Navigation
          <>
            {userRole === 'student' ? (
              <>
                <Stack.Screen name="StudentTabs" component={StudentTabNavigator} />
                <Stack.Screen
                  name="FaceRegistration"
                  component={FaceRegistrationScreen}
                  options={{ headerShown: true }}
                />
              </>
            ) : (
              <Stack.Screen name="TeacherTabs" component={TeacherTabNavigator} />
            )}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// Root App Component
const App = () => {
  return (
    <SafeAreaProvider>
      <PaperProvider>
        <AuthProvider>
          <AppNavigator />
        </AuthProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
};

export default App;