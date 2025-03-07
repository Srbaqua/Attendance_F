import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, ScrollView } from 'react-native';
import axios from 'axios';
import { API_URL, TEST_ENDPOINT } from '../../config';

const ConnectionTest = () => {
  const [status, setStatus] = useState('Waiting for test...');
  const [logs, setLogs] = useState<string[]>([]);
  
  const addLog = (message: string) => {
    setLogs(prevLogs => [...prevLogs, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };
  
  const testConnection = async () => {
    setStatus('Testing connection...');
    addLog(`Attempting to connect to ${API_URL}${TEST_ENDPOINT}`);
    
    try {
      const response = await axios.get(`${API_URL}${TEST_ENDPOINT}`, {
        timeout: 5000, // 5 second timeout
      });
      
      setStatus('Connected successfully!');
      addLog(`Success! Server responded with: ${JSON.stringify(response.data)}`);
    } catch (error) {
      setStatus('Connection failed');
      
      if (error.response) {
        // The server responded with a status code outside of 2xx range
        addLog(`Server error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
      } else if (error.request) {
        // The request was made but no response was received
        addLog('No response received from server. Network error or server not running.');
      } else {
        // Something happened in setting up the request
        addLog(`Error: ${error.message}`);
      }
      
      console.error('Full error:', error);
    }
  };
  
  // Optional: Test connection on component mount
  useEffect(() => {
    addLog(`Environment: ${__DEV__ ? 'Development' : 'Production'}`);
    addLog(`API URL configured as: ${API_URL}`);
  }, []);
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>API Connection Test</Text>
      <Text style={styles.subtitle}>Status: <Text style={styles.statusText}>{status}</Text></Text>
      
      <Button 
        title="Test Connection" 
        onPress={testConnection} 
        color="#2196F3"
      />
      
      <ScrollView style={styles.logContainer}>
        <Text style={styles.logTitle}>Connection Logs:</Text>
        {logs.map((log, index) => (
          <Text key={index} style={styles.logLine}>{log}</Text>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 16,
  },
  statusText: {
    fontWeight: 'bold',
  },
  logContainer: {
    marginTop: 20,
    flex: 1,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  logTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  logLine: {
    fontSize: 14,
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
});

export default ConnectionTest;