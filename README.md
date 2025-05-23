# 📱 Attendance_F – BLE Based Attendance System

[![React Native](https://img.shields.io/badge/Built%20with-React%20Native-61DAFB.svg?logo=react)](https://reactnative.dev/)
[![Python](https://img.shields.io/badge/Backend-Python%203.8+-3776AB.svg?logo=python)](https://www.python.org/)
An automated, BLE-based attendance system built using **React Native** and a **Python backend**. It uses Bluetooth Low Energy to detect nearby devices and mark attendance, eliminating manual efforts and improving accuracy.

---

## 🚀 Features

✅ Automatic attendance using BLE  
✅ Cross-platform (Android & iOS)  
✅ Real-time synchronization with Python backend  
✅ Clean UI with React Native  
✅ Local & cloud data support

---

<details>
<summary>📁 <strong>Project Structure</strong></summary>

```bash
Attendance_F/
├── android/              # Android-specific config
├── ios/                  # iOS-specific config
├── backend/              # Python backend server
├── src/                  # React Native source code
│   ├── components/       # Reusable UI components
│   ├── contexts/         # Global state management
│   └── screens/          # App screens
├── App.tsx               # App entry point
├── package.json          # Node dependencies
└── README.md             # Project info
```
</details>

⚙️ Prerequisites
Before you begin, make sure you have:

📦 Node.js (v14+)

🧶 Yarn or npm

📱 React Native CLI

🐍 Python 3.8+

🔧 Android Studio or Xcode

📲 BLE-compatible device

🛠️ Setup Guide
📲 Mobile App Setup

# Clone the repository
git clone https://github.com/Srbaqua/Attendance_F.git
cd Attendance_F

# Install dependencies
npm install
# or
yarn install

# Start Metro bundler
npx react-native start
npx react-native run-android

🖥️ Backend Setup

cd backend

# Install Python dependencies
pip install -r requirements.txt

# Start the backend server
python server.py

<details> <summary>🧩 <strong>Configuration Tips</strong></summary>
Edit BLE settings and server URL in src/config.ts

Ensure Bluetooth & location permissions are granted on device

Server should be running before using the app

</details>

Made with ❤️ by @Srbaqua
