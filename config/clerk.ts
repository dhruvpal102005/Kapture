import * as SecureStore from 'expo-secure-store';

// Keys that Clerk uses to store tokens
const CLERK_TOKEN_KEYS = [
    '__clerk_client_jwt',
    '__clerk_session_jwt',
    '__clerk_session_id',
    'clerk-js-session',
    'clerk_session',
];

const tokenCache = {
    async getToken(key: string): Promise<string | null> {
        try {
            const item = await SecureStore.getItemAsync(key);
            return item;
        } catch (error) {
            console.error('SecureStore getToken error:', error);
            // Clear corrupted token
            try {
                await SecureStore.deleteItemAsync(key);
            } catch { }
            return null;
        }
    },
    async saveToken(key: string, token: string): Promise<void> {
        try {
            await SecureStore.setItemAsync(key, token);
        } catch (error) {
            console.error('SecureStore saveToken error:', error);
        }
    },
    async deleteToken(key: string): Promise<void> {
        try {
            await SecureStore.deleteItemAsync(key);
        } catch (error) {
            console.error('SecureStore deleteToken error:', error);
        }
    },
};

/**
 * Clears all cached Clerk tokens
 * Call this when you change API keys or need to force re-authentication
 */
export async function clearClerkCache(): Promise<void> {
    console.log('Clearing Clerk token cache...');
    for (const key of CLERK_TOKEN_KEYS) {
        try {
            await SecureStore.deleteItemAsync(key);
            console.log(`Cleared: ${key}`);
        } catch (error) {
            // Ignore errors for keys that don't exist
        }
    }
    console.log('Clerk cache cleared!');
}

export { tokenCache };
