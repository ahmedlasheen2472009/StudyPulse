# BUILD_ANDROID.md — Guide for Debian Linux (Beginner Friendly)

This step-by-step guide is written specifically for Debian / Ubuntu Linux. Follow each command in order to prepare your development environment, connect your phone, and build the **BioAdapt** Android app.

---

## 1. Prerequisites Check

Open your terminal in Debian and run:

```bash
java -version
which adb
```

If `java` and `adb` return "not found", you need to install OpenJDK and Android platform tools.

---

## 2. Step 1: Install OpenJDK 17 and Tools on Debian

Capacitor 6 and Android Gradle Plugin 8+ require **Java 17**.

Run:
```bash
sudo apt update
sudo apt install -y openjdk-17-jdk adb
```

Verify your Java version:
```bash
java -version
```
You should see `openjdk version "17.0.x"`.

---

## 3. Step 2: Install Android Studio and Android SDK

The simplest and most reliable way to get the Android SDK on Debian is through the official Android Studio installer:

1. Download Android Studio for Linux (.tar.gz) from [developer.android.com/studio](https://developer.android.com/studio).
2. Extract the archive (for example into `~/android-studio` or `/opt/`):
   ```bash
   tar -xvzf android-studio-*-linux.tar.gz
   cd android-studio/bin
   ./studio.sh
   ```
3. In the Setup Wizard:
   - Select **Standard Setup**.
   - Make sure **Android SDK**, **Android SDK Platform-Tools**, and **Android SDK Build-Tools** are checked.
   - Note down the SDK location (typically `/home/ahmadino/Android/Sdk`).

4. Add the Android SDK to your shell environment:
   Open `~/.bashrc`:
   ```bash
   nano ~/.bashrc
   ```
   Add the following lines at the bottom:
   ```bash
   export ANDROID_HOME=$HOME/Android/Sdk
   export PATH=$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/cmdline-tools/latest/bin
   ```
   Save (`Ctrl+O`, `Enter`) and exit (`Ctrl+X`), then reload:
   ```bash
   source ~/.bashrc
   ```

---

## 4. Step 3: Enable Developer Options & USB Debugging on Your Phone

1. On your Android phone, open **Settings** > **About Phone**.
2. Find **Build Number** and tap it **7 times** until you see the message: *"You are now a developer!"*.
3. Go back to **Settings** > **System** (or **Developer Options**) > **Developer Options**.
4. Turn on **USB Debugging**.
5. Connect your phone to your computer with a USB cable (make sure it's a data cable, not charge-only).
6. A dialog will pop up on your phone screen: *"Allow USB debugging?"*. Check **"Always allow from this computer"** and tap **Allow**.

---

## 5. Step 4: Verify Phone Connection with adb

Run:
```bash
adb devices
```

Expected output:
```text
List of devices attached
9a8b7c6d5e4f    device
```

If it says `unauthorized` or `no permissions`, check your phone screen and tap "Allow", or restart adb:
```bash
adb kill-server
adb start-server
adb devices
```

---

## 6. Step 5: Running the App on Your Phone

From the project root (`/home/ahmadino/Documents/StudyPulse`):

```bash
# Sync the web build with Android assets
npm run android:sync

# Run the app directly onto your connected phone
npm run android:run
```

Capacitor will build the debug APK, upload it to your phone via `adb`, and launch BioAdapt automatically.

---

## 7. Step 6: Building a Standalone Debug APK

If you want to build an `.apk` file that you can transfer to another phone via USB, Google Drive, or Telegram:

Run:
```bash
npm run android:apk
```

Or run the Gradle command directly:
```bash
cd android
./gradlew assembleDebug
```

Your generated APK will be located at:
```text
android/app/build/outputs/apk/debug/app-debug.apk
```

To install it directly to any connected phone:
```bash
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 8. The 5 Most Common Errors and Exact Fixes

### 1. `java: command not found` or Unsupported Java Version
- **Error**: Gradle fails with `Unsupported class file major version` or Java cannot be found.
- **Fix**: Make sure OpenJDK 17 is installed and selected:
  ```bash
  sudo apt install -y openjdk-17-jdk
  sudo update-alternatives --config java
  ```
  Choose option 17.

### 2. `SDK location not found` / `ANDROID_HOME not set`
- **Error**: `SDK location not found. Define a location with an ANDROID_HOME environment variable or by setting the sdk.dir path in your project's local.properties file.`
- **Fix**: Create `android/local.properties` with:
  ```properties
  sdk.dir=/home/ahmadino/Android/Sdk
  ```
  (Replace `/home/ahmadino` with your actual Linux user path if different).

### 3. `device unauthorized`
- **Error**: `adb devices` lists your device as `unauthorized`.
- **Fix**: Unlock your phone screen. Look for the RSA fingerprint prompt and tap "Always allow from this computer". Then run:
  ```bash
  adb kill-server && adb start-server
  ```

### 4. `device not detected` (empty list in `adb devices`)
- **Error**: `List of devices attached` is completely blank.
- **Causes & Fix**:
  - Cable issue: Test with another USB cable (many cables are charge-only).
  - USB Mode: On your phone, pull down notifications and change USB mode from "Charging only" to "File Transfer (MTP)".
  - Linux udev rules: Install Android udev rules on Debian:
    ```bash
    sudo apt install -y android-sdk-platform-tools-common
    sudo udevadm control --reload-rules
    ```

### 5. Gradle Daemon Memory / Build Failure
- **Error**: `OutOfMemoryError: Java heap space` or Gradle build process interrupted.
- **Fix**: Add memory configuration in `android/gradle.properties`:
  ```properties
  org.gradle.jvmargs=-Xmx2048m -XX:MaxMetaspaceSize=512m
  ```
