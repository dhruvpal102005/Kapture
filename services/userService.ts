// User Service - Syncs Clerk user data to Firebase Firestore
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/config/firebase';

// Type for user data stored in Firestore
export interface FirebaseUser {
    clerkId: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    fullName: string | null;
    imageUrl: string | null;
    createdAt: any;
    updatedAt: any;
    provider: 'google' | 'email';
    // User preferences (set during onboarding)
    unit?: 'km' | 'mi';
    territoryColor?: string;
    onboardingComplete?: boolean;
}

// Type for Clerk user data (simplified)
export interface ClerkUserData {
    id: string;
    emailAddresses: { emailAddress: string }[];
    firstName: string | null;
    lastName: string | null;
    fullName: string | null;
    imageUrl: string | null;
}

/**
 * Syncs a Clerk user to Firebase Firestore
 * Creates a new document if user doesn't exist, updates if they do
 * @param clerkUser - The user object from Clerk
 * @param provider - The authentication provider used ('google' or 'email')
 * @returns Promise<boolean> - true if successful, false otherwise
 */
export async function syncUserToFirebase(
    clerkUser: ClerkUserData,
    provider: 'google' | 'email' = 'email'
): Promise<boolean> {
    try {
        if (!clerkUser || !clerkUser.id) {
            console.error('syncUserToFirebase: Invalid user data');
            return false;
        }

        const userRef = doc(db, 'users', clerkUser.id);
        const userSnap = await getDoc(userRef);

        const primaryEmail = clerkUser.emailAddresses?.[0]?.emailAddress || '';

        if (userSnap.exists()) {
            // User exists, update their data (except createdAt)
            await setDoc(userRef, {
                clerkId: clerkUser.id,
                email: primaryEmail,
                firstName: clerkUser.firstName,
                lastName: clerkUser.lastName,
                fullName: clerkUser.fullName,
                imageUrl: clerkUser.imageUrl,
                updatedAt: serverTimestamp(),
                provider: provider,
            }, { merge: true });

            console.log('User updated in Firebase:', clerkUser.id);
        } else {
            // New user, create document with createdAt
            const userData: FirebaseUser = {
                clerkId: clerkUser.id,
                email: primaryEmail,
                firstName: clerkUser.firstName,
                lastName: clerkUser.lastName,
                fullName: clerkUser.fullName,
                imageUrl: clerkUser.imageUrl,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                provider: provider,
            };

            await setDoc(userRef, userData);
            console.log('New user created in Firebase:', clerkUser.id);
        }

        return true;
    } catch (error) {
        console.error('Error syncing user to Firebase:', error);
        return false;
    }
}

/**
 * Checks if a user exists in Firebase
 * @param clerkId - The Clerk user ID
 * @returns Promise<boolean> - true if user exists
 */
export async function checkUserExists(clerkId: string): Promise<boolean> {
    try {
        const userRef = doc(db, 'users', clerkId);
        const userSnap = await getDoc(userRef);
        return userSnap.exists();
    } catch (error) {
        console.error('Error checking user existence:', error);
        return false;
    }
}

/**
 * Gets a user from Firebase by their Clerk ID
 * @param clerkId - The Clerk user ID
 * @returns Promise<FirebaseUser | null>
 */
export async function getUserFromFirebase(clerkId: string): Promise<FirebaseUser | null> {
    try {
        const userRef = doc(db, 'users', clerkId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            return userSnap.data() as FirebaseUser;
        }
        return null;
    } catch (error) {
        console.error('Error getting user from Firebase:', error);
        return null;
    }
}

/**
 * Saves user preferences to Firebase
 * @param clerkId - The Clerk user ID
 * @param preferences - User preferences object
 * @returns Promise<boolean> - true if successful
 */
export async function saveUserPreferences(
    clerkId: string,
    preferences: {
        unit?: 'km' | 'mi';
        territoryColor?: string;
        onboardingComplete?: boolean;
    }
): Promise<boolean> {
    try {
        if (!clerkId) {
            console.error('saveUserPreferences: Invalid clerkId');
            return false;
        }

        const userRef = doc(db, 'users', clerkId);

        await setDoc(userRef, {
            ...preferences,
            updatedAt: serverTimestamp(),
        }, { merge: true });

        console.log('User preferences saved to Firebase:', clerkId, preferences);
        return true;
    } catch (error) {
        console.error('Error saving user preferences:', error);
        return false;
    }
}
