# Quick Start - Mota50 Frontend

## ✅ Setup Complete!

The following fixes have been applied:
- ✅ Babel path alias configuration added
- ✅ babel-plugin-module-resolver added to dependencies
- ✅ app.json cleaned up
- ✅ Setup documentation created

## 🚀 To Run the App:

1. **Navigate to frontend directory:**
   ```bash
   cd mota50/frontend
   ```

2. **Install dependencies (if not already done):**
   ```bash
   npm install
   ```

3. **Start the Expo development server:**
   ```bash
   npm start
   ```

4. **Choose your platform:**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Press `w` for web browser
   - Scan QR code with Expo Go app on your phone

## 📝 Notes:

- **Missing Assets**: The app will run without icon/splash images. Expo uses defaults. Add them later for production.
- **Backend Connection**: API calls will fail until you connect to your backend. Update `app.config.js` with your API URL.
- **First Run**: The first `npm start` may take a few minutes to download Expo dependencies.

## 🔧 If You Encounter Issues:

1. **Clear cache:**
   ```bash
   npm start -- --clear
   ```

2. **Reinstall dependencies:**
   ```bash
   rm -rf node_modules
   npm install
   ```

3. **Check Node version:**
   ```bash
   node --version  # Should be 18+ for Expo 51
   ```

## ✨ The app is ready to run!

All core features are implemented and the configuration is complete.
