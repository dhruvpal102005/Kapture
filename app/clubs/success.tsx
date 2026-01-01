import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator } from 'react-native';

export default function ClubSuccessScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Show loading for 1 second, then show success message
        const timer = setTimeout(() => {
            setLoading(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#EF4444" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    <View style={styles.header}>
                        <Text style={styles.title}>APPLICATION SUBMITTED</Text>
                    </View>

                    <View style={styles.messageContainer}>
                        <Text style={styles.message}>
                            We will double check your application to make sure everything is correct
                            and then you will receive a notification once your terra club has been
                            approved.
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>EDITING MY TERRA CLUB</Text>
                        <Text style={styles.sectionMessage}>
                            Once your club has been approved you can edit your terra club details by
                            going to settings menu inside of Terra Clubs Mode.
                        </Text>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFE5E5',
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: '#FFE5E5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    safeArea: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    header: {
        marginBottom: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#1A1A1A',
        textTransform: 'uppercase',
    },
    messageContainer: {
        marginBottom: 32,
    },
    message: {
        fontSize: 16,
        color: '#1A1A1A',
        lineHeight: 24,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 12,
        textTransform: 'uppercase',
    },
    sectionMessage: {
        fontSize: 16,
        color: '#1A1A1A',
        lineHeight: 24,
    },
});


