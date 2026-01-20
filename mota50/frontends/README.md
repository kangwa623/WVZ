# Mota50 - Fleet Management System

Integrated Fleet Management & Smart Driver Digital Log Application for World Vision Zambia.

## Technology Stack

- **Frontend**: React Native (Expo) with TypeScript
- **Navigation**: Expo Router
- **State Management**: Redux Toolkit
- **UI Components**: Custom components with World Vision branding
- **Icons**: @expo/vector-icons
- **Location**: expo-location
- **Camera**: expo-camera
- **Storage**: expo-secure-store

## Features

- ✅ Authentication & Role-Based Access Control
- ✅ Vehicle Booking System
- ✅ Trip Logging (Start/Stop, Mileage)
- ✅ Digital Inspections (Pre/Post-trip)
- ✅ Receipt Management
- ✅ Violation Points Tracking
- ✅ Dashboards (Driver, Fleet Manager, Finance)
- ✅ License Verification
- ✅ Maintenance Management
- ✅ Incident Reporting

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator / Android Emulator or Expo Go app

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Run on specific platform:
```bash
npm run ios     # iOS
npm run android # Android
npm run web     # Web
```

## Project Structure

```
frontend/
├── src/
│   ├── app/              # Expo Router app directory
│   ├── components/       # Reusable UI components
│   ├── screens/          # Screen components
│   ├── services/         # API services
│   ├── store/            # Redux store
│   ├── theme/            # Design system
│   ├── types/            # TypeScript types
│   ├── utils/            # Utility functions
│   └── hooks/            # Custom React hooks
├── assets/               # Images, fonts, etc.
├── app.json              # Expo configuration
└── package.json
```

## World Vision Branding

The app uses World Vision's official color palette:
- **Primary Orange**: #FF6600 (PANTONE 021)
- **Accent Gold**: PANTONE 129
- **Accent Terra Cotta**: PANTONE 1525
- **Black & White**: For contrast and text

## Development

### Environment Variables

Create a `.env` file in the root directory:

```
API_URL=http://localhost:8000/api
NODE_ENV=development
```

### Building

For production builds, use EAS Build:

```bash
eas build --platform ios
eas build --platform android
```

## License

Copyright © World Vision Zambia
