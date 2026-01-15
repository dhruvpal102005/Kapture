import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PrivateLobbiesScreen() {
    const handleJoinLobby = () => {
        router.push({ pathname: '/lobbies/join' } as any);
    };

    const handleCreateLobby = () => {
        router.push({ pathname: '/lobbies/create' } as any);
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>KAPTURE PRIVATE LOBBIES</Text>
                <View style={styles.headerSpacer} />
            </View>

            {/* Content */}
            <View style={styles.content}>
                {/* Icon */}
                <View style={styles.iconContainer}>
                    <MaterialCommunityIcons name="sword-cross" size={40} color="#FF6E6E" />
                </View>

                {/* Title and Subtitle */}
                <Text style={styles.title}>Private Lobbies</Text>
                <Text style={styles.subtitle}>
                    Join or create a private lobby to compete with your friends.
                </Text>

                {/* Action Cards */}
                <View style={styles.cardsContainer}>
                    {/* Join Lobby Card */}
                    <TouchableOpacity style={styles.card} onPress={handleJoinLobby}>
                        <View style={styles.cardIcon}>
                            <Ionicons name="people-outline" size={24} color="#FF6E6E" />
                        </View>
                        <View style={styles.cardContent}>
                            <Text style={styles.cardTitle}>Join a Private Lobby</Text>
                            <Text style={styles.cardDescription}>
                                Enter a 6-digit code to join an existing private lobby.
                            </Text>
                        </View>
                    </TouchableOpacity>

                    {/* Create Lobby Card */}
                    <TouchableOpacity style={styles.card} onPress={handleCreateLobby}>
                        <View style={styles.cardIcon}>
                            <Ionicons name="add" size={24} color="#888" />
                        </View>
                        <View style={styles.cardContent}>
                            <Text style={styles.cardTitle}>Create a Private Lobby</Text>
                            <Text style={styles.cardDescription}>
                                Set up your own private lobby with custom settings.
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
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
        backgroundColor: '#F5F5F5',
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
        paddingHorizontal: 20,
        paddingTop: 40,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#1A1A1A',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 22,
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
    cardsContainer: {
        width: '100%',
        gap: 12,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'flex-start',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    cardIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#F8F8F8',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    cardContent: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
        marginBottom: 4,
    },
    cardDescription: {
        fontSize: 13,
        color: '#888',
        lineHeight: 18,
    },
});
