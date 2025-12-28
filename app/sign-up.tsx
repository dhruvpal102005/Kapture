import React, { useState } from 'react';
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
import { useSignUp } from '@clerk/clerk-expo';

export default function SignUpScreen() {
    const { isLoaded, signUp, setActive } = useSignUp();

    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [pendingVerification, setPendingVerification] = useState(false);
    const [code, setCode] = useState('');

    const handleSignUp = async () => {
        if (!isLoaded) return;

        if (!email || !firstName || !lastName || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            await signUp.create({
                emailAddress: email,
                password,
                firstName,
                lastName,
            });

            // Send email verification code
            await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
            setPendingVerification(true);
        } catch (error: any) {
            Alert.alert('Sign Up Failed', error.errors?.[0]?.message || error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyCode = async () => {
        if (!isLoaded) return;

        setLoading(true);
        try {
            const result = await signUp.attemptEmailAddressVerification({ code });

            if (result.status === 'complete') {
                await setActive({ session: result.createdSessionId });
                router.replace('/onboarding');
            } else {
                Alert.alert('Verification Issue', 'Please try again');
            }
        } catch (error: any) {
            Alert.alert('Verification Failed', error.errors?.[0]?.message || 'Invalid code');
        } finally {
            setLoading(false);
        }
    };

    const handleSignIn = () => {
        router.push('/sign-in');
    };

    // Show verification code input if pending
    if (pendingVerification) {
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
                                <Text style={styles.titleText}>VERIFY EMAIL</Text>
                                <Text style={styles.subtitleText}>
                                    Enter the 6-digit code sent to {email}
                                </Text>

                                <TextInput
                                    style={styles.input}
                                    placeholder="Verification code"
                                    placeholderTextColor="rgba(0, 0, 0, 0.5)"
                                    value={code}
                                    onChangeText={setCode}
                                    keyboardType="number-pad"
                                    maxLength={6}
                                />

                                <TouchableOpacity
                                    style={styles.button}
                                    onPress={handleVerifyCode}
                                    activeOpacity={0.8}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <ActivityIndicator color="#FFFFFF" />
                                    ) : (
                                        <Text style={styles.buttonText}>Verify Email</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </KeyboardAvoidingView>
                </ImageBackground>
            </>
        );
    }

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
                            <Text style={styles.titleText}>SIGN UP</Text>

                            <TextInput
                                style={styles.input}
                                placeholder="Email Address"
                                placeholderTextColor="rgba(0, 0, 0, 0.5)"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />

                            <View style={styles.nameRow}>
                                <TextInput
                                    style={[styles.input, styles.halfInput]}
                                    placeholder="First Name"
                                    placeholderTextColor="rgba(0, 0, 0, 0.5)"
                                    value={firstName}
                                    onChangeText={setFirstName}
                                    autoCapitalize="words"
                                />
                                <TextInput
                                    style={[styles.input, styles.halfInput]}
                                    placeholder="Last Name"
                                    placeholderTextColor="rgba(0, 0, 0, 0.5)"
                                    value={lastName}
                                    onChangeText={setLastName}
                                    autoCapitalize="words"
                                />
                            </View>

                            <TextInput
                                style={styles.input}
                                placeholder="Password"
                                placeholderTextColor="rgba(0, 0, 0, 0.5)"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                            />

                            <TouchableOpacity
                                style={styles.button}
                                onPress={handleSignUp}
                                activeOpacity={0.8}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#FFFFFF" />
                                ) : (
                                    <Text style={styles.buttonText}>Sign Up</Text>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity onPress={handleSignIn}>
                                <Text style={styles.linkText}>
                                    Already have an account? Sign in
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
        minHeight: '25%',
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
        marginBottom: 16,
    },
    subtitleText: {
        fontSize: 16,
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
    nameRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    halfInput: {
        flex: 1,
    },
    button: {
        backgroundColor: '#1a1a1a',
        paddingVertical: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 20,
    },
    buttonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
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
