# Mota50 Frontend Setup Guide

## Quick Start

1. **Install Dependencies**
   ```bash
   cd mota50/frontend
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm start
   ```

3. **Run on Specific Platform**
   ```bash
   npm run ios      # iOS Simulator
   npm run android  # Android Emulator
   npm run web      # Web Browser
   ```

## Asset Files (Optional)

The app will run without these, but you should add them for production:

- `assets/icon.png` - App icon (1024x1024)
- `assets/splash.png` - Splash screen (1242x2436)
- `assets/adaptive-icon.png` - Android adaptive icon (1024x1024)
- `assets/favicon.png` - Web favicon (48x48)

Expo will use default assets if these are missing.

## Environment Configuration

Update `app.config.js` to set your API URL:

```javascript
export default {
  expo: {
    extra: {
      apiUrl: process.env.API_URL || "http://localhost:8000/api",
    },
  },
};
```

## Troubleshooting

### Path Alias Issues
If you see import errors with `@/`, make sure:
- `babel-plugin-module-resolver` is installed
- `babel.config.js` has the module-resolver plugin configured

### Missing Dependencies
If you get module not found errors:
```bash
npm install
```

### Metro Bundler Cache
Clear cache if you see strange errors:
```bash
npm start -- --clear
```

## Next Steps

1. Connect to backend API (update `app.config.js`)
2. Add app assets (icons, splash screens)
3. Test on physical devices using Expo Go app
4. Configure EAS Build for production builds
