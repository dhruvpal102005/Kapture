import { useEffect } from 'react';
import { ClerkProvider } from '@clerk/clerk-expo';
import { Slot } from 'expo-router';
import { tokenCache, clearClerkCache } from '@/config/clerk';
import { useFirebaseUserSync } from '@/hooks/useFirebaseUserSync';

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY as string;

if (!publishableKey) {
  throw new Error('Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in .env');
}

// Inner component that has access to Clerk context
function AppContent() {
  // This hook syncs Clerk user data to Firebase whenever user signs in
  // Works for both Google OAuth and email/password sign-ups
  useFirebaseUserSync('google');

  return <Slot />;
}

export default function RootLayout() {
  // Clear stale tokens on app start in development
  // This helps when you switch Clerk API keys
  useEffect(() => {
    if (__DEV__) {
      // Only clear on first install or after clearing app data
      // The clearClerkCache function is available if you need to manually clear
      console.log('Development mode: Clerk cache utils available');
    }
  }, []);

  return (
    <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
      <AppContent />
    </ClerkProvider>
  );
}

// Export for manual cache clearing (use in dev tools or settings)
export { clearClerkCache };
