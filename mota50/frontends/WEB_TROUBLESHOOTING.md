# Web Bundling Troubleshooting

If you encounter `react-native-web` bundling errors, try these steps:

## Step 1: Clear All Caches
```bash
# Clear Metro bundler cache
npx expo start --clear

# Or manually clear caches
rm -rf node_modules/.cache
rm -rf .expo
```

## Step 2: Reinstall react-native-web
```bash
npm uninstall react-native-web react-dom
npm install react-native-web@^0.20.0 react-dom@19.0.0 --save
```

## Step 3: Restart Server
```bash
npm start -- --clear
```

## Alternative: Use Mobile Instead
If web continues to have issues, you can test on:
- **Mobile device**: Scan QR code with Expo Go app
- **Android Emulator**: Press `a` in Expo terminal
- **iOS Simulator**: Press `i` in Expo terminal (macOS only)
