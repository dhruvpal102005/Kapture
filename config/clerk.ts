import * as SecureStore from 'expo-secure-store';

const tokenCache = {
    async getToken(key: string): Promise<string | null> {
        try {
            const item = await SecureStore.getItemAsync(key);
            return item;
        } catch (error) {
            console.error('SecureStore getToken error:', error);
            await SecureStore.deleteItemAsync(key);
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
};

export { tokenCache };
