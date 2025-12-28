import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { useUser } from '@clerk/clerk-expo';
import { Image } from 'expo-image';

export default function MeScreen() {
    const { user } = useUser();

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <SafeAreaView style={styles.content}>
                {/* Profile Header */}
                <View style={styles.header}>
                    {user?.imageUrl ? (
                        <Image
                            source={{ uri: user.imageUrl }}
                            style={styles.avatar}
                            contentFit="cover"
                        />
                    ) : (
                        <View style={styles.avatarFallback}>
                            <Text style={styles.avatarText}>
                                {user?.firstName?.[0]?.toUpperCase() || 'U'}
                            </Text>
                        </View>
                    )}
                    <Text style={styles.name}>{user?.fullName || 'Runner'}</Text>
                    <Text style={styles.email}>{user?.emailAddresses?.[0]?.emailAddress}</Text>
                </View>

                {/* Stats placeholder */}
                <View style={styles.statsContainer}>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>0</Text>
                        <Text style={styles.statLabel}>Runs</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>0 m²</Text>
                        <Text style={styles.statLabel}>Territory</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>0</Text>
                        <Text style={styles.statLabel}>Rank</Text>
                    </View>
                </View>

                {/* Coming soon */}
                <View style={styles.comingSoon}>
                    <Text style={styles.comingSoonText}>More features coming soon!</Text>
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0D0D0D',
    },
    content: {
        flex: 1,
        alignItems: 'center',
        paddingTop: 40,
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 16,
    },
    avatarFallback: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#333',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    avatarText: {
        color: '#FFFFFF',
        fontSize: 40,
        fontWeight: '600',
    },
    name: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 4,
    },
    email: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 14,
    },
    statsContainer: {
        flexDirection: 'row',
        gap: 16,
        marginTop: 24,
    },
    statCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        minWidth: 100,
    },
    statValue: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: '700',
    },
    statLabel: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 12,
        marginTop: 4,
    },
    comingSoon: {
        marginTop: 60,
        padding: 20,
    },
    comingSoonText: {
        color: 'rgba(255, 255, 255, 0.4)',
        fontSize: 14,
    },
});
