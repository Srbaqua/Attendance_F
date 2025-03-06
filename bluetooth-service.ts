// bluetooth-service.ts
import { BleManager, Characteristic, Device } from 'react-native-ble-plx';
import { Platform, PermissionsAndroid } from 'react-native';

export interface TeacherBeacon {
  deviceId: string;
  name: string;
  rssi: number;  // Signal strength
}

class BluetoothService {
  private bleManager: BleManager;
  private isScanning: boolean = false;
  private discoveredDevices: Map<string, TeacherBeacon> = new Map();
  private proximityThreshold: number = -70; // RSSI threshold for proximity (adjust based on testing)

  constructor() {
    this.bleManager = new BleManager();
  }

  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'android') {
      const bluetoothScanPermission = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        {
          title: 'Bluetooth Scan Permission',
          message: 'The app needs permission to scan for nearby Bluetooth devices',
          buttonPositive: 'OK',
        }
      );

      const bluetoothConnectPermission = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        {
          title: 'Bluetooth Connect Permission',
          message: 'The app needs permission to connect to Bluetooth devices',
          buttonPositive: 'OK',
        }
      );

      const fineLocationPermission = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'The app needs permission to access your location for Bluetooth scanning',
          buttonPositive: 'OK',
        }
      );

      return (
        bluetoothScanPermission === PermissionsAndroid.RESULTS.GRANTED &&
        bluetoothConnectPermission === PermissionsAndroid.RESULTS.GRANTED &&
        fineLocationPermission === PermissionsAndroid.RESULTS.GRANTED
      );
    }

    return true; // iOS handles permissions differently
  }

  // Start advertising (for teacher's device)
  async startAdvertising(teacherId: string): Promise<boolean> {
    // Note: React Native doesn't directly support BLE advertising
    // You'll need a native module bridge or a library like react-native-ble-advertiser
    // This is a placeholder for the implementation
    console.log(`Started advertising as teacher ${teacherId}`);
    return true;
  }

  // Start scanning for teacher beacons (for student's device)
  async startScanning(onTeacherFound: (teachers: TeacherBeacon[]) => void): Promise<void> {
    if (this.isScanning) {
      return;
    }

    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Bluetooth permissions not granted');
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

        if (device && device.name) {
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
    if (this.isScanning) {
      this.bleManager.stopDeviceScan();
      this.isScanning = false;
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
    this.bleManager.destroy();
  }
}

export default new BluetoothService();