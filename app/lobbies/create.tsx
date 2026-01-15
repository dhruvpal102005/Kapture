import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CreateLobbyScreen() {
    const [lobbyName, setLobbyName] = useState('');
    const [maxPlayers, setMaxPlayers] = useState(4);
    const [duration, setDuration] = useState(30); // minutes
    const [loading, setLoading] = useState(false);

    const handleCreate = async () => {
        if (!lobbyName.trim()) return;

        setLoading(true);
        // TODO: Implement create lobby logic
        console.log('Creating lobby:', { lobbyName, maxPlayers, duration });
        setTimeout(() => {
            setLoading(false);
            // Navigate to lobby with generated code
        }, 1000);
    };

    const playerOptions = [2, 4, 6, 8, 10];
    const durationOptions = [15, 30, 45, 60, 90];

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>CREATE LOBBY</Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Content */}
                <View style={styles.content}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="add" size={40} color="#FF6E6E" />
                    </View>

                    <Text style={styles.title}>Create Private Lobby</Text>
                    <Text style={styles.subtitle}>
                        Set up your lobby and invite friends to compete.
                    </Text>

                    {/* Lobby Name Input */}
                    <View style={styles.inputSection}>
                        <Text style={styles.inputLabel}>Lobby Name</Text>
                        <TextInput
                            style={styles.textInput}
                            value={lobbyName}
                            onChangeText={setLobbyName}
                            placeholder="Enter lobby name..."
                            placeholderTextColor="#999"
                            maxLength={30}
                        />
                    </View>

                    {/* Max Players */}
                    <View style={styles.inputSection}>
                        <Text style={styles.inputLabel}>Max Players</Text>
                        <View style={styles.optionsRow}>
                            {playerOptions.map((num) => (
                                <TouchableOpacity
                                    key={num}
                                    style={[
                                        styles.optionButton,
                                        maxPlayers === num && styles.optionButtonActive,
                                    ]}
                                    onPress={() => setMaxPlayers(num)}
                                >
                                    <Text
                                        style={[
                                            styles.optionText,
                                            maxPlayers === num && styles.optionTextActive,
                                        ]}
                                    >
                                        {num}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Duration */}
                    <View style={styles.inputSection}>
                        <Text style={styles.inputLabel}>Duration (minutes)</Text>
                        <View style={styles.optionsRow}>
                            {durationOptions.map((mins) => (
                                <TouchableOpacity
                                    key={mins}
                                    style={[
                                        styles.optionButton,
                                        duration === mins && styles.optionButtonActive,
                                    ]}
                                    onPress={() => setDuration(mins)}
                                >
                                    <Text
                                        style={[
                                            styles.optionText,
                                            duration === mins && styles.optionTextActive,
                                        ]}
                                    >
                                        {mins}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Create Button */}
                    <TouchableOpacity
                        style={[
                            styles.createButton,
                            !lobbyName.trim() && styles.createButtonDisabled,
                        ]}
                        onPress={handleCreate}
                        disabled={!lobbyName.trim() || loading}
                    >
                        <Text style={styles.createButtonText}>
                            {loading ? 'Creating...' : 'Create Lobby'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
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
    scrollView: {
        flex: 1,
    },
    content: {
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 40,
        paddingBottom: 40,
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
        marginBottom: 32,
    },
    inputSection: {
        width: '100%',
        marginBottom: 24,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 10,
    },
    textInput: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        paddingVertical: 16,
        paddingHorizontal: 16,
        fontSize: 16,
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
    optionsRow: {
        flexDirection: 'row',
        gap: 10,
    },
    optionButton: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    optionButtonActive: {
        backgroundColor: '#FF6E6E',
    },
    optionText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    optionTextActive: {
        color: '#FFF',
    },
    createButton: {
        width: '100%',
        backgroundColor: '#FF6E6E',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 16,
    },
    createButtonDisabled: {
        opacity: 0.5,
    },
    createButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
});
