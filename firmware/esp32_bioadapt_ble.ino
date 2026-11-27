/*
  Study Pulse: BioAdapt - ESP32 BLE Firmware Starter
  ISEF Research Prototype (Embedded Systems)

  Contract:
  - Device Name: "BioAdapt"
  - Service UUID: 4fafc201-1fb5-459e-8fcc-c5c9c331914b
  - Characteristic UUID: beb5483e-36e1-4688-b7f5-ea07361b26a8
  - Packet Format: "bpm,hrv,gsr,motion,quality" (~1Hz)
*/

#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>

#define DEVICE_NAME "BioAdapt"
#define SERVICE_UUID        "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
#define CHARACTERISTIC_UUID "beb5483e-36e1-4688-b7f5-ea07361b26a8"

BLEServer* pServer = NULL;
BLECharacteristic* pCharacteristic = NULL;
bool deviceConnected = false;

class MyServerCallbacks: public BLEServerCallbacks {
    void onConnect(BLEServer* pServer) {
      deviceConnected = true;
      Serial.println("[BLE] Phone Connected!");
    };
    void onDisconnect(BLEServer* pServer) {
      deviceConnected = false;
      Serial.println("[BLE] Phone Disconnected. Restarting advertising...");
      pServer->getAdvertising()->start();
    }
};

void setup() {
  Serial.begin(115200);
  Serial.println("Starting BioAdapt ESP32 BLE Server...");

  // 1. Initialize BLE with advertised name "BioAdapt"
  BLEDevice::init(DEVICE_NAME);

  // 2. Create BLE Server
  pServer = BLEDevice::createServer();
  pServer->setCallbacks(new MyServerCallbacks());

  // 3. Create BLE Service
  BLEService *pService = pServer->createService(SERVICE_UUID);

  // 4. Create BLE Notify Characteristic
  pCharacteristic = pService->createCharacteristic(
                      CHARACTERISTIC_UUID,
                      BLECharacteristic::PROPERTY_READ   |
                      BLECharacteristic::PROPERTY_NOTIFY
                    );
  pCharacteristic->addDescriptor(new BLE2902());

  // 5. Start Service & Advertising
  pService->start();
  BLEAdvertising *pAdvertising = BLEDevice::getAdvertising();
  pAdvertising->addServiceUUID(SERVICE_UUID);
  pAdvertising->setScanResponse(true);
  pAdvertising->setMinPreferred(0x06);
  pAdvertising->setMinPreferred(0x12);
  BLEDevice::startAdvertising();

  Serial.println("Advertising active. Waiting for BioAdapt app connection...");
}

void loop() {
  if (deviceConnected) {
    // -------------------------------------------------------------
    // SENSOR READINGS PLACEHOLDER:
    // Hook up your MAX30102, GSR analog pin, and MPU6050 here.
    // -------------------------------------------------------------
    float bpm = 72.0 + (random(-2, 3));
    float hrv = 48.5 + (random(-3, 3));
    float gsr = 1750.0 + (random(-20, 20));
    float motion = 0.04;
    int quality = 4; // 0 to 4

    // Format packet: "bpm,hrv,gsr,motion,quality"
    char packet[64];
    snprintf(packet, sizeof(packet), "%.1f,%.1f,%.1f,%.2f,%d", bpm, hrv, gsr, motion, quality);

    // Send packet via BLE Notify
    pCharacteristic->setValue((uint8_t*)packet, strlen(packet));
    pCharacteristic->notify();

    Serial.print("Notified: ");
    Serial.println(packet);
  }

  delay(1000); // 1Hz packet rate
}
