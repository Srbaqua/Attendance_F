import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfileScreen = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const response = await fetch('http://localhost:3000/api/users/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json();
        setProfile(data);
      } catch (error) {
        Alert.alert('Error', 'Failed to load profile');
      }
      setLoading(false);
    };

    fetchProfile();
  }, []);

  if (loading) return <ActivityIndicator size="large" />;
  if (!profile) return <Text>No profile data</Text>;

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text>Name: {profile.name}</Text>
      <Text>Username: {profile.username}</Text>
      <Text>Role: {profile.role}</Text>
    </View>
  );
};

export default ProfileScreen;
