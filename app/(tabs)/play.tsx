import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    SafeAreaView,
    TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';

import MapGlobe from '@/components/dashboard/MapGlobe';
import TopNavBar from '@/components/dashboard/TopNavBar';
import BottomSheet from '@/components/dashboard/BottomSheet';
import SideActionButtons from '@/components/dashboard/SideActionButtons';

export default function PlayScreen() {
    const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | undefined>();
    const [locationError, setLocationError] = useState<string | null>(null);

    // Request location permission and get current location
    useEffect(() => {
        (async () => {
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    setLocationError('Location permission denied');
                    // Use default location (Mumbai)
                    setUserLocation({ latitude: 19.076, longitude: 72.8777 });
                    return;
                }

                const location = await Location.getCurrentPositionAsync({});
                setUserLocation({
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                });
            } catch (error) {
                console.error('Error getting location:', error);
                // Use default location (Mumbai)
                setUserLocation({ latitude: 19.076, longitude: 72.8777 });
            }
        })();
    }, []);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Map Globe background - real map with streets */}
            <View style={styles.globeContainer}>
                <MapGlobe userLocation={userLocation} />
            </View>

            {/* Safe area content overlay */}
            <SafeAreaView style={styles.overlay} pointerEvents="box-none">
                {/* Top section */}
                <View style={styles.topSection} pointerEvents="box-none">
                    {/* Notification bell - top left */}
                    <TouchableOpacity style={styles.notificationButton}>
                        <Ionicons name="notifications-outline" size={24} color="#FFFFFF" />
                    </TouchableOpacity>

                    {/* Top navigation tabs */}
                    <TopNavBar />
                </View>

                {/* My runs label */}
                <View style={styles.myRunsContainer}>
                    <Text style={styles.myRunsText}>My runs</Text>
                </View>

                {/* Side action buttons */}
                <SideActionButtons />

                {/* Bottom sheet */}
                <View style={styles.bottomContainer}>
                    <BottomSheet />
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#05090d',
    },
    globeContainer: {
        ...StyleSheet.absoluteFillObject,
    },
    overlay: {
        flex: 1,
    },
    topSection: {
        paddingTop: 40,
    },
    notificationButton: {
        position: 'absolute',
        top: 70,
        left: 16,
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    myRunsContainer: {
        position: 'absolute',
        top: 130,
        left: 16,
    },
    myRunsText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    bottomContainer: {
        position: 'absolute',
        bottom: 20,
        left: 0,
        right: 0,
    },
});
