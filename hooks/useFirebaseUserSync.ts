// Hook to sync Clerk user to Firebase whenever user state changes
import { useEffect, useRef } from 'react';
import { useUser } from '@clerk/clerk-expo';
import { syncUserToFirebase, ClerkUserData } from '@/services/userService';

/**
 * Hook that automatically syncs the Clerk user to Firebase
 * Call this in your app's root layout or main component
 * @param provider - The authentication provider ('google' or 'email')
 */
export function useFirebaseUserSync(provider: 'google' | 'email' = 'email') {
    const { user, isLoaded, isSignedIn } = useUser();
    const hasSynced = useRef(false);

    useEffect(() => {
        // Only sync once when user becomes available
        if (isLoaded && isSignedIn && user && !hasSynced.current) {
            const userData: ClerkUserData = {
                id: user.id,
                emailAddresses: user.emailAddresses.map(e => ({ emailAddress: e.emailAddress })),
                firstName: user.firstName,
                lastName: user.lastName,
                fullName: user.fullName,
                imageUrl: user.imageUrl,
            };

            syncUserToFirebase(userData, provider)
                .then((success) => {
                    if (success) {
                        hasSynced.current = true;
                        console.log('User synced to Firebase successfully');
                    }
                })
                .catch((error) => {
                    console.error('Failed to sync user to Firebase:', error);
                });
        }

        // Reset sync flag when user signs out
        if (!isSignedIn) {
            hasSynced.current = false;
        }
    }, [isLoaded, isSignedIn, user, provider]);

    return { user, isLoaded, isSignedIn };
}
