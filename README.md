# 🌍 Kapture

> A revolutionary running app that transforms your runs into a global adventure with an interactive 3D Earth visualization and community-driven Terra Clubs.

[![React Native](https://img.shields.io/badge/React%20Native-0.81.5-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-~54.0-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-12.7.0-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)

---

## ✨ Features

### 🌐 Interactive 3D Globe
- **Real-time Earth Visualization**: Powered by Three.js and WebGL for stunning 3D graphics
- **Location Tracking**: Zoom to your current location with a single tap
- **Smooth Animations**: Fluid camera movements and rotations using React Native Reanimated

### 🏃 Running Modes
- **Private Lobby**: Train solo with personalized tracking
- **Single Player**: Challenge yourself with individual runs
- **My Club**: Join or create Terra Clubs and run with your community

### 🎯 Terra Clubs System
- **Create Clubs**: Build your own running community with custom logos and branding
- **Join Clubs**: Discover and join clubs from around the world
- **Country-based**: Represent your nation or join international communities
- **Draggable Bottom Sheet**: Smooth, gesture-based club browsing interface
- **Club Management**: Pending approval system for new club applications

### 🔐 Authentication & Onboarding
- **Clerk Integration**: Secure authentication with Google OAuth
- **Firebase Sync**: Automatic user data synchronization
- **Animated Onboarding**: Beautiful multi-step introduction with map visualization
- **Location-based Setup**: Personalized experience based on user location

### 🗺️ Maps & Location
- **React Native Maps**: Interactive map views for route planning
- **Real-time Location**: GPS tracking for accurate run recording
- **Route Visualization**: See your runs displayed on the map

---

## 🛠️ Tech Stack

### Frontend
- **React Native** - Cross-platform mobile development
- **Expo** - Development platform and tooling
- **TypeScript** - Type-safe development
- **React Navigation** - Navigation and routing
- **Expo Router** - File-based routing system

### 3D Graphics
- **Three.js** - 3D rendering engine
- **@react-three/fiber** - React renderer for Three.js
- **expo-three** - Three.js integration for Expo
- **expo-gl** - WebGL support

### UI/UX
- **React Native Reanimated** - High-performance animations
- **React Native Gesture Handler** - Touch gesture system
- **NativeWind** - Tailwind CSS for React Native
- **Expo Linear Gradient** - Beautiful gradient effects

### Backend & Services
- **Firebase** - Backend as a Service
  - Firestore - NoSQL database
  - Storage - File storage for club logos
  - Authentication sync
- **Clerk** - User authentication and management

### State & Data
- **AsyncStorage** - Local data persistence
- **Expo Secure Store** - Secure credential storage

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (Mac) or Android Emulator

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/dhruvpal102005/Kapture.git
   cd Kapture
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
   EXPO_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

4. **Start the development server**
   ```bash
   npx expo start
   ```

5. **Run on your device**
   - Press `a` for Android emulator
   - Press `i` for iOS simulator
   - Scan QR code with Expo Go app

---

## 📁 Project Structure

```
Kapture/
├── app/                      # Main application screens
│   ├── (tabs)/              # Tab-based navigation
│   │   ├── feed.tsx         # Activity feed
│   │   ├── me.tsx           # User profile
│   │   ├── plan.tsx         # Training plans
│   │   ├── play.tsx         # Main 3D globe screen
│   │   └── start.tsx        # Start run screen
│   ├── clubs/               # Club management
│   │   ├── create.tsx       # Create new club
│   │   └── success.tsx      # Club creation success
│   ├── _layout.tsx          # Root layout with providers
│   ├── index.tsx            # Landing page
│   ├── onboarding.tsx       # Onboarding flow
│   ├── sign-in.tsx          # Sign in screen
│   └── sign-up.tsx          # Sign up screen
├── components/              # Reusable components
│   ├── clubs/              # Club-related components
│   │   └── MyClubBottomSheet.tsx
│   ├── dashboard/          # Dashboard components
│   │   ├── BottomSheet.tsx
│   │   ├── Globe3DWebView.tsx
│   │   ├── SideActionButtons.tsx
│   │   └── TopNavBar.tsx
│   └── onboarding/         # Onboarding components
├── config/                 # Configuration files
│   ├── clerk.ts           # Clerk authentication config
│   └── firebase.ts        # Firebase configuration
├── constants/             # App constants
│   └── countries.ts       # Country data
├── hooks/                 # Custom React hooks
│   └── useFirebaseUserSync.ts
├── services/              # Business logic & API
│   └── clubService.ts     # Club management service
└── assets/               # Images, fonts, etc.
```

---

## 🎮 Usage

### Creating a Terra Club

1. Navigate to the **My Club** tab
2. Tap **Create a club**
3. Fill in club details:
   - Club name
   - Upload logo (square image recommended)
   - Select country
   - Choose privacy settings (Public/Invite-only)
4. Submit for approval

### Joining a Club

1. Go to **My Club** tab
2. Browse available clubs
3. Use search to find specific clubs
4. Filter by country or member count
5. Tap to join

### Exploring the Globe

1. Open the **Play** tab
2. Tap the question mark button to zoom to your location
3. Swipe to rotate the globe
4. Pinch to zoom in/out

---

## 🔧 Development

### Available Scripts

```bash
# Start development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run on Web
npm run web

# Lint code
npm run lint

# Reset project
npm run reset-project
```

### Key Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `expo` | ~54.0.30 | Development platform |
| `react-native` | 0.81.5 | Mobile framework |
| `firebase` | ^12.7.0 | Backend services |
| `@clerk/clerk-expo` | ^2.5.0 | Authentication |
| `three` | ^0.182.0 | 3D graphics |
| `react-native-reanimated` | ~4.1.1 | Animations |
| `expo-location` | ~19.0.8 | GPS tracking |
| `react-native-maps` | 1.20.1 | Map integration |

---

## 🎨 Design Philosophy

Kapture combines cutting-edge 3D visualization with intuitive mobile UX:

- **Immersive Experience**: 3D Earth globe creates a unique running visualization
- **Gesture-First**: Smooth, natural interactions with draggable sheets and swipe gestures
- **Community-Driven**: Terra Clubs foster global running communities
- **Performance**: Optimized animations and rendering for smooth 60fps experience
- **Accessibility**: Clear visual hierarchy and intuitive navigation

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is private and proprietary.

---

## 🙏 Acknowledgments

- **Three.js** for amazing 3D rendering capabilities
- **Expo** for streamlined React Native development
- **Firebase** for robust backend infrastructure
- **Clerk** for seamless authentication
- **INTVL Run Club** for inspiration

---

## 📧 Contact

For questions or support, please open an issue in the repository.

---

<div align="center">
  <strong>Built with ❤️ for runners worldwide</strong>
  <br />
  <sub>Transforming every run into a global adventure</sub>
</div>
