import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function FeedScreen() {
    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <SafeAreaView style={styles.content}>
                <Text style={styles.title}>Feed</Text>

                {/* Empty state */}
                <View style={styles.emptyState}>
                    <Ionicons name="people-outline" size={64} color="rgba(255, 255, 255, 0.3)" />
                    <Text style={styles.emptyTitle}>No activity yet</Text>
                    <Text style={styles.emptySubtitle}>
                        Start running to see your friends' activities here
                    </Text>
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
        paddingHorizontal: 20,
    },
    title: {
        color: '#FFFFFF',
        fontSize: 28,
        fontWeight: '700',
        marginTop: 16,
        marginBottom: 24,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 100,
    },
    emptyTitle: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: '600',
        marginTop: 16,
    },
    emptySubtitle: {
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: 14,
        textAlign: 'center',
        marginTop: 8,
        paddingHorizontal: 40,
    },
});
