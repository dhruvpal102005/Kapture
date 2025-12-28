import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    SafeAreaView,
    StatusBar,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Text as SvgText } from 'react-native-svg';
import { useAuth } from '@clerk/clerk-expo';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_COMPLETE_KEY = 'kapture_onboarding_complete';

// --- Consolidated Components ---

const GradientBackground = ({ children }: { children: React.ReactNode }) => (
    <LinearGradient
        colors={['#E8A4A4', '#F5B8B8', '#FAC8C8', '#F5B0A8', '#FF8080']}
        locations={[0, 0.25, 0.5, 0.75, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
    >
        {children}
    </LinearGradient>
);

const KaptureLogo = () => {
    const text = 'KAPTURE';
    const fontSize = 52;
    const lineHeight = 36;

    return (
        <View style={styles.logoContainer}>
            <Svg height={220} width={360}>
                {/* Echo layers - outline only (stroke, no fill) */}
                <SvgText
                    x="180"
                    y={50}
                    fontSize={fontSize}
                    fontWeight="900"
                    fill="none"
                    stroke="rgba(255,255,255,0.15)"
                    strokeWidth={1.2}
                    textAnchor="middle"
                    letterSpacing={3}
                >
                    {text}
                </SvgText>
                <SvgText
                    x="180"
                    y={50 + lineHeight}
                    fontSize={fontSize}
                    fontWeight="900"
                    fill="none"
                    stroke="rgba(255,255,255,0.25)"
                    strokeWidth={1.2}
                    textAnchor="middle"
                    letterSpacing={3}
                >
                    {text}
                </SvgText>
                <SvgText
                    x="180"
                    y={50 + lineHeight * 2}
                    fontSize={fontSize}
                    fontWeight="900"
                    fill="none"
                    stroke="rgba(255,255,255,0.35)"
                    strokeWidth={1.2}
                    textAnchor="middle"
                    letterSpacing={3}
                >
                    {text}
                </SvgText>
                <SvgText
                    x="180"
                    y={50 + lineHeight * 3}
                    fontSize={fontSize}
                    fontWeight="900"
                    fill="none"
                    stroke="rgba(255,255,255,0.5)"
                    strokeWidth={1.2}
                    textAnchor="middle"
                    letterSpacing={3}
                >
                    {text}
                </SvgText>
                {/* Solid text at bottom */}
                <SvgText
                    x="180"
                    y={50 + lineHeight * 4}
                    fontSize={fontSize}
                    fontWeight="900"
                    fill="#FFFFFF"
                    textAnchor="middle"
                    letterSpacing={3}
                >
                    {text}
                </SvgText>
            </Svg>
        </View>
    );
};

const PrimaryButton = ({
    title,
    onPress,
}: {
    title: string;
    onPress: () => void;
}) => (
    <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        style={styles.primaryButton}
    >
        <Text style={styles.primaryButtonText}>{title}</Text>
    </TouchableOpacity>
);

// --- Main Screen ---

export default function LandingScreen() {
    const { isLoaded, isSignedIn } = useAuth();
    const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true);

    useEffect(() => {
        const checkAuthAndOnboarding = async () => {
            if (!isLoaded) return;

            if (isSignedIn) {
                // User is signed in, check if onboarding is complete
                try {
                    const onboardingComplete = await AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY);

                    if (onboardingComplete === 'true') {
                        // TODO: Replace with your main app home screen when ready
                        // For now, we'll show a simple message or redirect to a home page
                        // router.replace('/home');
                        console.log('User has completed onboarding - show main app');
                    } else {
                        // First time user, go to onboarding
                        router.replace('/onboarding');
                    }
                } catch (error) {
                    console.error('Error checking onboarding status:', error);
                    // Default to onboarding on error
                    router.replace('/onboarding');
                }
            }
            setIsCheckingOnboarding(false);
        };

        checkAuthAndOnboarding();
    }, [isLoaded, isSignedIn]);

    // Show loading while checking auth
    if (!isLoaded || (isSignedIn && isCheckingOnboarding)) {
        return (
            <View style={[styles.container, styles.loadingContainer]}>
                <ActivityIndicator size="large" color="#FF8080" />
            </View>
        );
    }

    // If signed in, the useEffect will handle redirect
    // This screen is only shown for unauthenticated users
    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar barStyle="light-content" />
            <GradientBackground>
                <SafeAreaView style={styles.container}>
                    {/* Logo Section - positioned slightly above center */}
                    <View style={styles.logoSection}>
                        <KaptureLogo />
                    </View>

                    {/* Bottom Interaction Section */}
                    <View style={styles.bottomSection}>
                        <PrimaryButton
                            title="Sign in"
                            onPress={() => router.push('/sign-in')}
                        />

                        <View style={styles.signUpRow}>
                            <Text style={styles.signUpText}>Don't have an account? </Text>
                            <TouchableOpacity onPress={() => console.log('Sign Up Pressed')}>
                                <Text style={styles.signUpLink}>Sign up</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </SafeAreaView>
            </GradientBackground>
        </>
    );
}

// --- Styles ---

const styles = StyleSheet.create({
    gradient: {
        flex: 1,
    },
    container: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    logoSection: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        marginTop: 60,
    },
    logoContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    bottomSection: {
        width: '100%',
        paddingBottom: 60,
        paddingTop: 40,
    },
    primaryButton: {
        backgroundColor: '#1a1a1a',
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 12,
        width: '100%',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    primaryButtonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 18,
    },
    signUpRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 16,
    },
    signUpText: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 14,
    },
    signUpLink: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 14,
        textDecorationLine: 'underline',
    },
    loadingContainer: {
        justifyContent: 'center',
        backgroundColor: '#FAC8C8',
    },
});
