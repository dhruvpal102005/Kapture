# Kapture Migration Source Code Dump

This file contains the core logic from the TypeScript/React Native project to be used as a reference for the Flutter migration.

---

## 1. Run Tracking Logic

### services/runTrackingService.ts
```typescript
/**
 * CRITICAL LOGIC:
 * - GPS Filtering: MIN_DISTANCE_THRESHOLD = 0.005 (5m)
 * - Pace Smoothing: Weighted average window of 10 points
 * - Area Calculation: Shoelace formula for polygon area
 * - Firebase Sync: Batching locations every 5 seconds
 */

import * as Location from 'expo-location';
import * as runService from './runService';
import { socketService } from './socketService';
import { CapturedPolygon, LocationPoint, RunStats } from './types';

// ... (Rest of the file follows)
```

[content of services/runTrackingService.ts]

### services/runService.ts
```typescript
/**
 * Firestore Write Operations:
 * - Collection: 'runs'
 * - Sub-collection: 'locations' (batched)
 */
```

[content of services/runService.ts]

---

## 2. Globe 3D Code

### components/dashboard/Globe3DWebView.tsx
```javascript
/**
 * Three.js Implementation inside WebView
 */
```

[content of components/dashboard/Globe3DWebView.tsx]

---

## 3. Auth Flow

### services/userService.ts
```typescript
/**
 * Syncing Clerk User to Firestore
 */
```

[content of services/userService.ts]

---

## 4. Socket.IO Structure

### services/socketService.ts
```typescript
/**
 * Frontend Socket Events (Stubs)
 */
```

[content of services/socketService.ts]

### backend/src/index.js
```javascript
/**
 * Backend Socket.IO Server Handlers
 */
```

[content of backend/src/index.js]

---

## 5. Post & Club Services

### services/postsService.ts
[content]

### services/clubService.ts
[content]
