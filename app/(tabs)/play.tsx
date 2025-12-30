import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

// Real 3D globe rendered with Three.js inside a WebView
import MyClubBottomSheet from '@/components/clubs/MyClubBottomSheet';
import BottomSheet from '@/components/dashboard/BottomSheet';
import Globe3DWebView, { Globe3DWebViewRef } from '@/components/dashboard/Globe3DWebView';
import SideActionButtons from '@/components/dashboard/SideActionButtons';
import TopNavBar from '@/components/dashboard/TopNavBar';

type TabType = 'lobby' | 'single' | 'club';

export default function PlayScreen() {
    const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | undefined>();
    const [locationError, setLocationError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<TabType>('single');
    const globeRef = useRef<Globe3DWebViewRef>(null);
    const router = useRouter();

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

            {/* 3D globe background */}
            <View style={styles.globeContainer}>
                <Globe3DWebView ref={globeRef} userLocation={userLocation} />
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
                    <TopNavBar activeTab={activeTab} onTabChange={setActiveTab} />
                </View>

                {/* My runs label */}
                <View style={styles.myRunsContainer}>
                    <Text style={styles.myRunsText}>My runs</Text>
                </View>

                {/* Side action buttons */}
                <SideActionButtons
                    onHelpPress={() => {
                        // Zoom to user's location when question mark button is pressed
                        if (userLocation && globeRef.current) {
                            globeRef.current.zoomToLocation(
                                userLocation.latitude,
                                userLocation.longitude
                            );
                        }
                    }}
                />

                {/* Bottom sheet - show different content based on active tab */}
                {activeTab !== 'club' && (
                    <View style={styles.bottomContainer}>
                        <BottomSheet />
                    </View>
                )}
            </SafeAreaView>

            {/* Club bottom sheet - rendered outside SafeAreaView for proper gesture handling */}
            {activeTab === 'club' && (
                <MyClubBottomSheet
                    visible={activeTab === 'club'}
                    onCreateClub={() => router.push('/clubs/create')}
                />
            )}
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
