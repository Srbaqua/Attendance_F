// src/services/bluetooth-service.ts
import { Platform, NativeEventEmitter, NativeModules, PermissionsAndroid } from 'react-native';
import { BleManager } from 'react-native-ble-plx';

export interface TeacherBeacon {
  deviceId: string;
  name: string;
  rssi: number;  // Signal strength
}

class BluetoothService {
  private bleManager: BleManager | null = null;
  private isScanning: boolean = false;
  private discoveredDevices: Map<string, TeacherBeacon> = new Map();
  private proximityThreshold: number = -70; // RSSI threshold for proximity

  constructor() {
    // Initialize BLE manager lazily to avoid "EventEmitter of undefined" errors
    try {
      this.bleManager = new BleManager();
      console.log('BLE Manager initialized successfully');
    } catch (error) {
      console.error('Failed to initialize BLE Manager:', error);
      this.bleManager = null;
    }
  }

  async requestPermissions(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return true; // iOS handles permissions differently
    }

    try {
      // For Android 12+ (API level 31+)
      if (Platform.Version >= 31) {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);
        
        return (
          granted[PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN] === PermissionsAndroid.RESULTS.GRANTED &&
          granted[PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT] === PermissionsAndroid.RESULTS.GRANTED &&
          granted[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] === PermissionsAndroid.RESULTS.GRANTED
        );
      } 
      // For Android 10+ (API level 29+)
      else {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'The app needs permission to access your location for Bluetooth scanning',
            buttonPositive: 'OK',
          }
        );
        
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return false;
    }
  }

  // Check if Bluetooth is available
  async isBluetoothAvailable(): Promise<boolean> {
    if (!this.bleManager) {
      return false;
    }
    
    try {
      const state = await this.bleManager.state();
      return state === 'PoweredOn';
    } catch (error) {
      console.error('Error checking Bluetooth state:', error);
      return false;
    }
  }

  // Start advertising (for teacher's device)
  async startAdvertising(teacherId: string): Promise<boolean> {
    console.log(`Attempt to start advertising as teacher ${teacherId}`);
    
    // Check if Bluetooth is available
    if (!await this.isBluetoothAvailable()) {
      console.error('Bluetooth is not available');
      return false;
    }
    
    // Note: React Native doesn't directly support BLE advertising through react-native-ble-plx
    // This is a placeholder that simulates successful advertising
    // In a real implementation, you would need a native module or plugin that supports advertising
    // Consider react-native-ble-advertiser or a custom native module
    
    console.log(`Started advertising as teacher ${teacherId}`);
    return true;
  }

  // Stop advertising
  async stopAdvertising(): Promise<boolean> {
    // Placeholder for stopping beacon advertising
    console.log('Stopped advertising');
    return true;
  }

  // Start scanning for teacher beacons (for student's device)
  async startScanning(onTeacherFound: (teachers: TeacherBeacon[]) => void): Promise<void> {
    if (this.isScanning || !this.bleManager) {
      if (!this.bleManager) {
        throw new Error('BLE Manager not initialized');
      }
      return;
    }
    
    try {
      // Request permissions
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Bluetooth permissions not granted');
      }
      
      // Check if Bluetooth is turned on
      const state = await this.bleManager.state();
      if (state !== 'PoweredOn') {
        throw new Error('Bluetooth is not powered on');
      }
      
      this.isScanning = true;
      this.discoveredDevices.clear();
      
      // Start BLE scanning
      this.bleManager.startDeviceScan(null, null, (error, device) => {
        if (error) {
          console.error('Bluetooth scan error:', error);
          this.isScanning = false;
          return;
        }
        
        if (!device) return;
        
        // Only process devices with names
        if (device.name) {
          // Check if the device is a teacher beacon (would have specific name format or service UUID)
          // This is where you'd implement your teacher device detection logic
          if (device.name.startsWith('Teacher-')) {
            this.discoveredDevices.set(device.id, {
              deviceId: device.id,
              name: device.name,
              rssi: device.rssi || -100,
            });
            
            // Notify callback with all discovered teachers
            onTeacherFound(Array.from(this.discoveredDevices.values()));
          }
        }
      });
      
      // Stop scanning after 10 seconds to save battery
      setTimeout(() => {
        this.stopScanning();
      }, 10000);
    } catch (error) {
      console.error('Failed to start scanning:', error);
      this.isScanning = false;
      throw error;
    }
  }

  // Stop scanning
  stopScanning(): void {
    if (this.isScanning && this.bleManager) {
      this.bleManager.stopDeviceScan();
      this.isScanning = false;
      console.log('Stopped scanning for devices');
    }
  }

  // Check if student is in proximity of teacher
  isInProximity(teacherId: string): boolean {
    const teacher = this.discoveredDevices.get(teacherId);
    if (!teacher) {
      return false;
    }
    
    // Check if RSSI indicates proximity
    return teacher.rssi >= this.proximityThreshold;
  }

  // Get all nearby teachers
  getNearbyTeachers(): TeacherBeacon[] {
    return Array.from(this.discoveredDevices.values())
      .filter(teacher => teacher.rssi >= this.proximityThreshold);
  }

  // Clean up resources
  destroy(): void {
    this.stopScanning();
    if (this.bleManager) {
      this.bleManager.destroy();
      this.bleManager = null;
    }
  }
}

// Export a singleton instance
export default new BluetoothService();