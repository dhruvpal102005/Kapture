import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StatusBar,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ImageBackground,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { useSignIn, useOAuth, useAuth } from '@clerk/clerk-expo';
import * as WebBrowser from 'expo-web-browser';
import Svg, { Path } from 'react-native-svg';

// Warm up browser for OAuth
WebBrowser.maybeCompleteAuthSession();

// Google Icon
const GoogleIcon = () => (
    <Svg width={20} height={20} viewBox="0 0 24 24">
        <Path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
        />
        <Path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
        />
        <Path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
        />
        <Path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
        />
    </Svg>
);

export default function SignInScreen() {
    const { isLoaded, signIn, setActive } = useSignIn();
    const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' });
    const { isSignedIn, signOut } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);

    const handleSignIn = async () => {
        if (!isLoaded) return;

        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            const result = await signIn.create({
                identifier: email,
                password,
            });

            if (result.status === 'complete') {
                await setActive({ session: result.createdSessionId });
                router.replace('/');
            }
        } catch (error: any) {
            Alert.alert('Sign In Failed', error.errors?.[0]?.message || error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = useCallback(async () => {
        setGoogleLoading(true);
        try {
            // If already signed in, just navigate to home
            if (isSignedIn) {
                router.replace('/');
                return;
            }

            const { createdSessionId, setActive: setActiveSession } = await startOAuthFlow();

            if (createdSessionId && setActiveSession) {
                await setActiveSession({ session: createdSessionId });
                // User sync to Firebase is handled by useFirebaseUserSync hook in _layout.tsx
                router.replace('/');
            }
        } catch (error: any) {
            console.error('Google sign in error:', error);

            // Handle "already signed in" error
            if (error.message?.includes('already signed in')) {
                try {
                    // Sign out the stale session and try again
                    await signOut();
                    Alert.alert(
                        'Session Cleared',
                        'Please try signing in again.',
                        [{ text: 'OK' }]
                    );
                } catch (signOutError) {
                    console.error('Sign out error:', signOutError);
                }
            } else {
                Alert.alert('Google Sign In Failed', error.message || 'Please try again');
            }
        } finally {
            setGoogleLoading(false);
        }
    }, [startOAuthFlow, isSignedIn, signOut]);

    const handleSignUp = () => {
        router.push('/sign-up');
    };

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar barStyle="light-content" />
            <ImageBackground
                source={require('@/assets/images/runner.jpg')}
                style={styles.backgroundImage}
                resizeMode="cover"
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.container}
                >
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        keyboardShouldPersistTaps="handled"
                    >
                        <View style={styles.spacer} />
                        <View style={styles.formSection}>
                            <Text style={styles.titleText}>WELCOME</Text>

                            <TextInput
                                style={styles.input}
                                placeholder="Email address"
                                placeholderTextColor="rgba(0, 0, 0, 0.5)"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />

                            <TextInput
                                style={styles.input}
                                placeholder="Enter password"
                                placeholderTextColor="rgba(0, 0, 0, 0.5)"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                            />

                            <TouchableOpacity
                                style={styles.button}
                                onPress={handleSignIn}
                                activeOpacity={0.8}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#FFFFFF" />
                                ) : (
                                    <Text style={styles.buttonText}>Sign in</Text>
                                )}
                            </TouchableOpacity>

                            {/* Divider */}
                            <View style={styles.dividerContainer}>
                                <View style={styles.divider} />
                                <Text style={styles.dividerText}>or</Text>
                                <View style={styles.divider} />
                            </View>

                            {/* Google Sign In */}
                            <TouchableOpacity
                                style={styles.googleButton}
                                onPress={handleGoogleSignIn}
                                activeOpacity={0.8}
                                disabled={googleLoading}
                            >
                                {googleLoading ? (
                                    <ActivityIndicator color="#000000" />
                                ) : (
                                    <>
                                        <GoogleIcon />
                                        <Text style={styles.googleButtonText}>
                                            Continue with Google
                                        </Text>
                                    </>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity>
                                <Text style={styles.linkText}>Forgot password?</Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={handleSignUp}>
                                <Text style={styles.linkText}>
                                    Don't have an account? Sign up
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </ImageBackground>
        </>
    );
}

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },
    spacer: {
        flex: 1,
        minHeight: '30%',
    },
    formSection: {
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 50,
    },
    titleText: {
        fontSize: 42,
        fontWeight: '900',
        fontStyle: 'italic',
        color: '#FFFFFF',
        marginBottom: 24,
    },
    input: {
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: '#000000',
        marginBottom: 12,
    },
    button: {
        backgroundColor: '#1a1a1a',
        paddingVertical: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 16,
    },
    buttonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 16,
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
    },
    dividerText: {
        color: '#FFFFFF',
        paddingHorizontal: 16,
        fontSize: 14,
    },
    googleButton: {
        backgroundColor: '#FFFFFF',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 12,
        marginBottom: 20,
    },
    googleButtonText: {
        color: '#000000',
        fontWeight: '600',
        fontSize: 16,
    },
    linkText: {
        color: '#FFFFFF',
        fontSize: 14,
        textAlign: 'center',
        textDecorationLine: 'underline',
        marginBottom: 12,
    },
});
