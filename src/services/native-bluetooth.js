// src/services/native-bluetooth.js
import { NativeModules, Platform } from 'react-native';

// Define the TypeScript interface for teacher beacons
export interface TeacherBeacon {
  deviceId: string;
  name: string;
  rssi: number;
}

const BluetoothService = {
  startAdvertising: async (userId) => {
    // Use direct module calls instead of EventEmitter
    try {
      if (Platform.OS === 'android') {
        return await NativeModules.BluetoothModule.startAdvertising(userId.toString());
      } else {
        return await NativeModules.BluetoothModule.startAdvertising(userId.toString());
      }
    } catch (error) {
      console.error("Error starting advertising:", error);
      return false;
    }
  },

  stopAdvertising: async () => {
    try {
      if (Platform.OS === 'android') {
        return await NativeModules.BluetoothModule.stopAdvertising();
      } else {
        return await NativeModules.BluetoothModule.stopAdvertising();
      }
    } catch (error) {
      console.error("Error stopping advertising:", error);
      return false;
    }
  },

  startScanning: async (callback) => {
    // Set up a direct callback pattern instead of events
    try {
      if (Platform.OS === 'android') {
        await NativeModules.BluetoothModule.startScanning();
        // Use a polling approach instead of events
        const interval = setInterval(async () => {
          try {
            const teachers = await NativeModules.BluetoothModule.getDetectedTeachers();
            callback(teachers || []);
          } catch (e) {
            console.error("Error getting detected teachers:", e);
            callback([]);
          }
        }, 2000);

        return () => {
          clearInterval(interval);
          NativeModules.BluetoothModule.stopScanning();
        };
      } else {
        // Similar approach for iOS
        await NativeModules.BluetoothModule.startScanning();
        const interval = setInterval(async () => {
          try {
            const teachers = await NativeModules.BluetoothModule.getDetectedTeachers();
            callback(teachers || []);
          } catch (e) {
            console.error("Error getting detected teachers:", e);
            callback([]);
          }
        }, 2000);

        return () => {
          clearInterval(interval);
          NativeModules.BluetoothModule.stopScanning();
        };
      }
    } catch (error) {
      console.error("Error starting scanning:", error);
      callback([]);
      return () => {};
    }
  }
};

export default BluetoothService;