# Study Pulse: BioAdapt (Regeneron ISEF Prototype)

> **IMPORTANT DISCLAIMER & RESEARCH NOTICE**  
> Study Pulse: BioAdapt is a high school research and wellness prototype developed for the **Regeneron ISEF** competition (Category: **Embedded Systems**).  
> **It is NOT a medical device. It does NOT diagnose, treat, prevent, or cure any medical or mental health condition.**  
> Wrist photoplethysmography (PPG) is prone to motion artifacts and is less accurate than clinical ECG. All thresholds, scoring formulas, and baseline drop percentages in this app are **unvalidated research placeholders**.  
> If you feel unwell (chest tightness, dizziness, shortness of breath, severe distress), stop using the prototype and seek professional medical assistance immediately.

---

## 1. Project Background

Current stress monitoring consumer apps rely on static timers or population-wide fixed thresholds that ignore personal differences. **Study Pulse: BioAdapt** measures acute student mental fatigue and stress against a **personal calm baseline** instead of arbitrary timers.

### Hardware Architecture
- **Microcontroller**: ESP32 with Bluetooth Low Energy (BLE).
- **Sensors**:
  - **MAX30102**: Optical pulse sensor measuring Heart Rate and Heart Rate Variability (HRV - RMSSD).
  - **GSR Module**: Galvanic Skin Response (skin conductance from sweat gland activity).
  - **MPU6050**: 6-axis accelerometer/gyroscope measuring wrist motion. **Motion gating** freezes pulse classification whenever the hand is moving to prevent false stress alerts from motion artifacts.

---

## 2. BLE Contract (ESP32 $\leftrightarrow$ Android App)

- **Advertised Device Name**: `BioAdapt`
- **Primary Service UUID**: `4fafc201-1fb5-459e-8fcc-c5c9c331914b`
- **Notify Characteristic UUID**: `beb5483e-36e1-4688-b7f5-ea07361b26a8`
- **Packet Format**: UTF-8 comma-separated text sent ~1 time per second:
  ```text
  bpm,hrv,gsr,motion,quality
  ```
  *Example*: `72.0,45.2,1830.0,0.12,3`
  - `bpm`: Heart rate in beats per minute (e.g. `72.0`)
  - `hrv`: Root Mean Square of Successive Differences (RMSSD) in milliseconds (e.g. `45.2`)
  - `gsr`: Raw analog skin conductance / mV reading (e.g. `1830.0`)
  - `motion`: Relative movement level (`0.00` = still; `>0.50` = moving)
  - `quality`: Optical pulse signal quality index from `0` (unusable) to `4` (optimal)

---

## 3. Configuration & Research Placeholders (`src/config.js`)

All algorithm parameters are centralized in `src/config.js` and editable in the **Settings** tab:

| Parameter | Default Value | Description |
|---|---|---|
| `stressMode` | `'baseline'` | `'baseline'` (personal calibration) or `'simple'` (fixed GSR threshold) |
| `baselineDurationSeconds` | `120` | 2 minutes of calm recording to establish personal median |
| `hrvMediumDropPercent` | `15%` | Placeholder drop from personal baseline indicating mild stress |
| `hrvHighDropPercent` | `30%` | Placeholder drop from personal baseline indicating high stress |
| `gsrMediumRisePercent` | `10%` | Placeholder skin conductance increase for mild stress |
| `gsrHighRisePercent` | `25%` | Placeholder skin conductance increase for high stress |
| `simpleGsrThreshold` | `2200` | Raw GSR threshold for Simple Mode |
| `persistenceSeconds` | `10s` | Required consecutive duration before a stress state transition triggers |
| `alertCooldownMinutes` | `5 min` | Minimum cooldown between notifications |
| `bpmMinNormal` / `bpmMaxNormal` | `40` / `180` | Normal physiological range; values outside trigger `abnormal` warning |
| `motionThreshold` | `0.5` | Movement level above which pulse measurement pauses |
| `minQualityBars` | `2` | Quality $\le 1$ triggers `weak-signal` check |

---

## 4. State Priority Hierarchy

The state engine (`src/lib/stateEngine.js`) evaluates states strictly in order of precedence:
1. **`disconnected`**: Band not connected.
2. **`motion`**: Hand movement detected ($> 0.5$); pulse measurement paused.
3. **`weak-signal`**: Optical signal quality $\le 1$; guides user to adjust strap fit.
4. **`abnormal`**: BPM $< 40$ or $> 180$; labeled strictly as *"may be a sensor error"* (never a diagnosis).
5. **`persistent`**: High stress remains elevated even after 3 completed breathing sessions.
6. **`high`**: Significant HRV drop & GSR rise vs baseline.
7. **`medium`**: Mild deviation from baseline.
8. **`calm`**: Metrics steady and close to personal baseline.
9. **`noBaseline`**: Prompt to record a 2-minute baseline before stress analysis begins.

---

## 5. Development & Running

### Run Web Development Version
```bash
npm run dev
```

### Run Unit Tests (Vitest)
```bash
npm test
```

### Build Web Assets
```bash
npm run build
```

### Android Workflow (Debian Linux)
See full details in [BUILD_ANDROID.md](file:///home/ahmadino/Documents/StudyPulse/BUILD_ANDROID.md).

```bash
# 1. Sync web assets with native Android project
npm run android:sync

# 2. Run app directly onto connected Android phone
npm run android:run

# 3. Build standalone debug APK
npm run android:apk
```

---

## 6. Testing Every State in Demo Mode (Phone or Browser)

Demo Mode is **ON by default** to allow full verification without needing the physical ESP32 breadboard:
1. Open the app on your phone or browser.
2. You will see the yellow banner: `DEMO DATA, not from the band`.
3. In the **Dashboard** tab, scroll down to the **Developer & Demo Inspector** card and tap to expand.
4. Tap any of the test buttons to force that state:
   - **Calm**: Injects BPM 70, HRV 55 ms, GSR 1600.
   - **Mild Stress**: Injects BPM 78, HRV 41 ms, GSR 1880.
   - **High Stress**: Injects BPM 88, HRV 28 ms, GSR 2300 (after 10s persistence, an alert triggers).
   - **Motion**: Injects motion 0.95. Notice the State Hero turns purple ("Hold still") and measurement freezes.
   - **Weak Signal**: Injects quality 1. State Hero turns orange ("Check the sensor").
   - **Abnormal**: Injects BPM 195. Labeled as sensor error.
   - **Cycle All States**: Automatically cycles through all states every 12 seconds to observe live transitions.
5. In the **Settings** tab, tap **Test Alert** to test Android local notifications and vibration haptics.

---

## 7. Honest Status: What is Untested & Not Implemented

### UNTESTED
1. **Real Bluetooth LE Hardware Connection**: The BLE communication code using `@capacitor-community/bluetooth-le` has been coded strictly to the BLE contract, but has **NOT** been tested with a physical ESP32 or breadboard. It is marked as **UNTESTED** in the UI and README.
2. **Background BLE Monitoring**: Android restricts BLE scan and background processes unless run as a native foreground service with persistent notifications. Background monitoring is **NOT** validated on physical hardware and is marked as **UNTESTED**; the app runs monitoring in the foreground.

### NOT IMPLEMENTED (By Design)
- **ESP32 Firmware**: Not part of this mobile application project.
- **Beat Detection / Raw ECG Algorithm**: Beat detection and RMSSD computation are performed on the ESP32 firmware before transmission.
- **User Accounts / Cloud Sync / Analytics**: All session history and baseline calibrations remain 100% private and local on the user's phone.
- **iOS Support**: Project targets Android only.
- **Clinically Validated Thresholds**: All thresholds remain explicit, labeled research placeholders for the ISEF science fair.
