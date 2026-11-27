/**
 * BLE Service Wrapper using @capacitor-community/bluetooth-le
 * 
 * NOTE & RESEARCH STATUS:
 * Real Bluetooth LE connectivity has been implemented according to the official contract,
 * but is UNTESTED on physical Android hardware and ESP32 breadboards.
 * 
 * Contract:
 * - Device Name: "BioAdapt"
 * - Service UUID: 4fafc201-1fb5-459e-8fcc-c5c9c331914b
 * - Notify Characteristic UUID: beb5483e-36e1-4688-b7f5-ea07361b26a8
 */

import { BleClient, numbersToDataView, dataViewToNumbers } from '@capacitor-community/bluetooth-le';
import { BLE_CONFIG } from '../config.js';
import { parseBlePacket } from './packetParser.js';

class BleService {
  constructor() {
    this.deviceId = null;
    this.isInitialized = false;
    this.isConnected = false;
    this.onPacketCallback = null;
    this.onStatusChangeCallback = null;
    this.onErrorCallback = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 3;
    this.reconnectTimer = null;
  }

  async initialize() {
    if (this.isInitialized) return;
    try {
      await BleClient.initialize();
      this.isInitialized = true;
    } catch (err) {
      console.warn('[BLE] BleClient init warning (normal in web browser):', err);
    }
  }

  setCallbacks({ onPacket, onStatusChange, onError }) {
    this.onPacketCallback = onPacket;
    this.onStatusChangeCallback = onStatusChange;
    this.onErrorCallback = onError;
  }

  notifyStatus(status, details = {}) {
    if (this.onStatusChangeCallback) {
      this.onStatusChangeCallback(status, details);
    }
  }

  /**
   * Scans and connects to the BioAdapt wristband.
   */
  async scanAndConnect() {
    try {
      await this.initialize();
      this.notifyStatus('scanning');

      // Request device with BioAdapt name filter
      const device = await BleClient.requestDevice({
        namePrefix: BLE_CONFIG.DEVICE_NAME,
        optionalServices: [BLE_CONFIG.SERVICE_UUID],
      });

      if (!device || !device.deviceId) {
        this.notifyStatus('disconnected', { reason: 'No device selected' });
        return;
      }

      this.deviceId = device.deviceId;
      await this.connectToDevice(device.deviceId);
    } catch (err) {
      console.error('[BLE] Scan/Connect error:', err);
      this.notifyStatus('disconnected', { error: err.message || 'Scan cancelled or failed' });
      if (this.onErrorCallback) this.onErrorCallback(err);
    }
  }

  /**
   * Connects to a known device ID and starts notifications.
   */
  async connectToDevice(deviceId) {
    try {
      this.notifyStatus('connecting', { deviceId });

      await BleClient.connect(deviceId, (disconnectedDeviceId) => {
        console.warn(`[BLE] Device ${disconnectedDeviceId} disconnected unexpectedly`);
        this.isConnected = false;
        this.notifyStatus('disconnected', { reason: 'Connection lost' });
        this.handleAutoReconnect();
      });

      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.notifyStatus('connected', { deviceId });

      // Subscribe to notification characteristic
      await BleClient.startNotifications(
        deviceId,
        BLE_CONFIG.SERVICE_UUID,
        BLE_CONFIG.NOTIFY_CHARACTERISTIC_UUID,
        (value) => {
          this.handleIncomingData(value);
        }
      );
    } catch (err) {
      console.error('[BLE] Connect failed:', err);
      this.isConnected = false;
      this.notifyStatus('disconnected', { error: err.message });
      if (this.onErrorCallback) this.onErrorCallback(err);
    }
  }

  handleIncomingData(value) {
    try {
      let rawText = '';
      if (value instanceof DataView) {
        const bytes = new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
        const decoder = new TextDecoder('utf-8');
        rawText = decoder.decode(bytes);
      } else if (typeof value === 'string') {
        rawText = value;
      }

      const parsed = parseBlePacket(rawText);
      if (parsed.valid && this.onPacketCallback) {
        this.onPacketCallback(parsed.data);
      } else if (!parsed.valid && this.onErrorCallback) {
        this.onErrorCallback(new Error(parsed.error || 'Malformed packet'));
      }
    } catch (err) {
      if (this.onErrorCallback) this.onErrorCallback(err);
    }
  }

  handleAutoReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts && this.deviceId) {
      this.reconnectAttempts++;
      const delay = this.reconnectAttempts * 2000;
      this.notifyStatus('connecting', {
        reconnecting: true,
        attempt: this.reconnectAttempts,
        maxAttempts: this.maxReconnectAttempts,
      });

      this.reconnectTimer = setTimeout(async () => {
        try {
          await this.connectToDevice(this.deviceId);
        } catch (e) {
          console.warn('[BLE] Auto-reconnect attempt failed:', e);
        }
      }, delay);
    } else {
      this.notifyStatus('disconnected', { reason: 'Auto-reconnect failed' });
    }
  }

  async disconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectAttempts = 999; // prevent auto-reconnect on deliberate disconnect
    if (this.deviceId && this.isConnected) {
      try {
        await BleClient.stopNotifications(
          this.deviceId,
          BLE_CONFIG.SERVICE_UUID,
          BLE_CONFIG.NOTIFY_CHARACTERISTIC_UUID
        );
        await BleClient.disconnect(this.deviceId);
      } catch (err) {
        console.warn('[BLE] Disconnect cleanup warning:', err);
      }
    }
    this.isConnected = false;
    this.notifyStatus('disconnected', { reason: 'Manual disconnect' });
  }

  async isBluetoothEnabled() {
    try {
      await this.initialize();
      return await BleClient.isEnabled();
    } catch (e) {
      return false;
    }
  }

  async requestEnableBluetooth() {
    try {
      await BleClient.requestEnable();
      return true;
    } catch (e) {
      return false;
    }
  }

  async openAppSettings() {
    try {
      await BleClient.openAppSettings();
    } catch (e) {
      console.warn('[BLE] Could not open app settings:', e);
    }
  }
}

export const bleService = new BleService();
