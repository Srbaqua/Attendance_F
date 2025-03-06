package com.attendancesystem;

import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothManager;
import android.bluetooth.le.AdvertiseCallback;
import android.bluetooth.le.AdvertiseData;
import android.bluetooth.le.AdvertiseSettings;
import android.bluetooth.le.BluetoothLeAdvertiser;
import android.content.Context;
import android.os.ParcelUuid;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import java.util.UUID;

public class BluetoothAdvertiserModule extends ReactContextBaseJavaModule {
    private final ReactApplicationContext reactContext;
    private BluetoothLeAdvertiser bluetoothLeAdvertiser;
    private AdvertiseCallback advertiseCallback;

    public BluetoothAdvertiserModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @NonNull
    @Override
    public String getName() {
        return "BluetoothAdvertiser";
    }

    @ReactMethod
    public void startAdvertising(String userId, Promise promise) {
        BluetoothManager bluetoothManager = (BluetoothManager) reactContext.getSystemService(Context.BLUETOOTH_SERVICE);
        BluetoothAdapter bluetoothAdapter = bluetoothManager.getAdapter();

        if (bluetoothAdapter == null || !bluetoothAdapter.isEnabled()) {
            promise.reject("BLUETOOTH_NOT_ENABLED", "Bluetooth is not enabled");
            return;
        }

        bluetoothLeAdvertiser = bluetoothAdapter.getBluetoothLeAdvertiser();
        if (bluetoothLeAdvertiser == null) {
            promise.reject("ADVERTISER_NOT_AVAILABLE", "BLE Advertising not supported on this device");
            return;
        }

        AdvertiseSettings settings = new AdvertiseSettings.Builder()
                .setAdvertiseMode(AdvertiseSettings.ADVERTISE_MODE_LOW_LATENCY)
                .setTxPowerLevel(AdvertiseSettings.ADVERTISE_TX_POWER_HIGH)
                .setConnectable(false)
                .build();

        // Create a UUID based on user ID to identify the teacher
        UUID teacherUuid = UUID.nameUUIDFromBytes(userId.getBytes());
        ParcelUuid pUuid = new ParcelUuid(teacherUuid);

        AdvertiseData data = new AdvertiseData.Builder()
                .setIncludeDeviceName(true)
                .addServiceUuid(pUuid)
                .build();

        advertiseCallback = new AdvertiseCallback() {
            @Override
            public void onStartSuccess(AdvertiseSettings settingsInEffect) {
                super.onStartSuccess(settingsInEffect);
                promise.resolve(true);
            }

            @Override
            public void onStartFailure(int errorCode) {
                super.onStartFailure(errorCode);
                promise.reject("ADVERTISE_FAILED", "Failed to start advertising: " + errorCode);
            }
        };

        bluetoothLeAdvertiser.startAdvertising(settings, data, advertiseCallback);
    }

    @ReactMethod
    public void stopAdvertising(Promise promise) {
        if (bluetoothLeAdvertiser != null && advertiseCallback != null) {
            try {
                bluetoothLeAdvertiser.stopAdvertising(advertiseCallback);
                promise.resolve(true);
            } catch (Exception e) {
                promise.reject("STOP_ADVERTISE_FAILED", e.getMessage());
            }
        } else {
            promise.resolve(false);
        }
    }
}