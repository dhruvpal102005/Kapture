import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function JoinLobbyScreen() {
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);

    const handleJoin = async () => {
        if (code.length !== 6) return;

        setLoading(true);
        // TODO: Implement join lobby logic
        console.log('Joining lobby with code:', code);
        setTimeout(() => {
            setLoading(false);
            // Navigate to lobby or show error
        }, 1000);
    };

    const handleCodeChange = (text: string) => {
        // Only allow alphanumeric characters and limit to 6
        const cleaned = text.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
        setCode(cleaned);
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#000" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>JOIN LOBBY</Text>
                    <View style={styles.headerSpacer} />
                </View>

                {/* Content */}
                <View style={styles.content}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="people" size={40} color="#FF6E6E" />
                    </View>

                    <Text style={styles.title}>Enter Lobby Code</Text>
                    <Text style={styles.subtitle}>
                        Ask your friend for the 6-digit code to join their private lobby.
                    </Text>

                    {/* Code Input */}
                    <View style={styles.codeInputContainer}>
                        <TextInput
                            style={styles.codeInput}
                            value={code}
                            onChangeText={handleCodeChange}
                            placeholder="XXXXXX"
                            placeholderTextColor="#CCC"
                            maxLength={6}
                            autoCapitalize="characters"
                            keyboardType="default"
                            autoFocus
                        />
                    </View>

                    {/* Join Button */}
                    <TouchableOpacity
                        style={[
                            styles.joinButton,
                            code.length !== 6 && styles.joinButtonDisabled,
                        ]}
                        onPress={handleJoin}
                        disabled={code.length !== 6 || loading}
                    >
                        <Text style={styles.joinButtonText}>
                            {loading ? 'Joining...' : 'Join Lobby'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    keyboardView: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        color: '#000',
        fontSize: 14,
        fontWeight: '700',
        letterSpacing: 1,
    },
    headerSpacer: {
        width: 40,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 60,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#1A1A1A',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#000',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 40,
        paddingHorizontal: 20,
    },
    codeInputContainer: {
        width: '100%',
        marginBottom: 24,
    },
    codeInput: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        paddingVertical: 20,
        paddingHorizontal: 24,
        fontSize: 32,
        fontWeight: '700',
        textAlign: 'center',
        letterSpacing: 12,
        color: '#000',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    joinButton: {
        width: '100%',
        backgroundColor: '#FF6E6E',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
    },
    joinButtonDisabled: {
        opacity: 0.5,
    },
    joinButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
});
