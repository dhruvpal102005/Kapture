import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    TouchableOpacity,
    Animated,
    Easing,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import * as Location from 'expo-location';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function StartScreen() {
    const mapRef = useRef<MapView>(null);
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [mapReady, setMapReady] = useState(false);

    // Stats (will be updated during run)
    const [distance, setDistance] = useState(0);
    const [duration, setDuration] = useState('00:00');
    const [pace, setPace] = useState('0:00');
    const [capturedArea, setCapturedArea] = useState(0);

    // Get user location
    useEffect(() => {
        (async () => {
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status === 'granted') {
                    const location = await Location.getCurrentPositionAsync({});
                    setUserLocation({
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                    });
                } else {
                    // Default to Mumbai
                    setUserLocation({ latitude: 19.076, longitude: 72.8777 });
                }
            } catch (error) {
                setUserLocation({ latitude: 19.076, longitude: 72.8777 });
            }
        })();
    }, []);

    // Pulse animation for location marker
    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.8,
                    duration: 1500,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1500,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    // Center map when ready
    useEffect(() => {
        if (mapRef.current && userLocation && mapReady) {
            mapRef.current.animateToRegion({
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            }, 500);
        }
    }, [userLocation, mapReady]);

    const handleStartRun = () => {
        // TODO: Navigate to running tracker screen
        console.log('Start run pressed');
    };

    const handleViewOptions = () => {
        // TODO: Show other run options
        console.log('View other options');
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* Map background */}
            <View style={styles.mapContainer}>
                {userLocation && (
                    <MapView
                        ref={mapRef}
                        style={styles.map}
                        provider={PROVIDER_GOOGLE}
                        mapType="standard"
                        customMapStyle={[
                            { elementType: 'geometry', stylers: [{ color: '#f5f1eb' }] },
                            { elementType: 'labels.text.fill', stylers: [{ color: '#8a8a8a' }] },
                            { elementType: 'labels.text.stroke', stylers: [{ color: '#ffffff' }] },
                            { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#c9c0b6' }] },
                            { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#b8b0a6' }] },
                            { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#e8e4de' }] },
                            { featureType: 'poi', stylers: [{ visibility: 'off' }] },
                            { featureType: 'transit', stylers: [{ visibility: 'off' }] },
                        ]}
                        initialRegion={{
                            latitude: userLocation.latitude,
                            longitude: userLocation.longitude,
                            latitudeDelta: 0.015,
                            longitudeDelta: 0.015,
                        }}
                        onMapReady={() => setMapReady(true)}
                        showsCompass={false}
                        showsScale={false}
                        showsBuildings={true}
                        toolbarEnabled={false}
                        zoomEnabled={true}
                        scrollEnabled={true}
                        rotateEnabled={true}
                    >
                        {/* User location marker */}
                        <Marker
                            coordinate={userLocation}
                            anchor={{ x: 0.5, y: 0.5 }}
                        >
                            <View style={styles.markerContainer}>
                                <Animated.View
                                    style={[
                                        styles.markerPulse,
                                        {
                                            transform: [{ scale: pulseAnim }],
                                            opacity: pulseAnim.interpolate({
                                                inputRange: [1, 1.8],
                                                outputRange: [0.4, 0],
                                            }),
                                        },
                                    ]}
                                />
                                <View style={styles.markerDot} />
                            </View>
                        </Marker>
                    </MapView>
                )}

                {/* Back button */}
                <SafeAreaView style={styles.headerOverlay} edges={['top']}>
                    <TouchableOpacity style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#333" />
                    </TouchableOpacity>
                </SafeAreaView>

                {/* Center on location button */}
                <TouchableOpacity style={styles.centerButton}>
                    <View style={styles.centerButtonInner}>
                        <View style={styles.centerDot} />
                    </View>
                </TouchableOpacity>
            </View>

            {/* Bottom stats panel */}
            <View style={styles.statsPanel}>
                {/* GPS Status */}
                <View style={styles.gpsRow}>
                    <MaterialCommunityIcons name="signal-variant" size={20} color="#EF4444" />
                    <Text style={styles.gpsText}>GPS</Text>
                </View>

                {/* Captured area */}
                <View style={styles.areaContainer}>
                    <Text style={styles.areaNumber}>{capturedArea}</Text>
                    <Text style={styles.areaUnit}>m²</Text>
                </View>
                <Text style={styles.captureStatus}>Capture in Progress</Text>

                {/* Stats row */}
                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{distance.toFixed(2)}<Text style={styles.statUnit}>km</Text></Text>
                        <Text style={styles.statLabel}>Distance</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{duration}</Text>
                        <Text style={styles.statLabel}>Duration</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{pace}</Text>
                        <Text style={styles.statLabel}>Average pace</Text>
                    </View>
                </View>

                {/* Start Run button */}
                <TouchableOpacity style={styles.startButton} onPress={handleStartRun}>
                    <Text style={styles.startButtonText}>Start Run</Text>
                </TouchableOpacity>

                {/* View other options */}
                <TouchableOpacity onPress={handleViewOptions}>
                    <Text style={styles.otherOptionsText}>View other options</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    mapContainer: {
        flex: 1,
    },
    map: {
        flex: 1,
    },
    headerOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
    },
    backButton: {
        marginLeft: 16,
        marginTop: 8,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    centerButton: {
        position: 'absolute',
        top: 100,
        right: 16,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    centerButtonInner: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#3B82F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    centerDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#3B82F6',
    },
    markerContainer: {
        width: 60,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },
    markerPulse: {
        position: 'absolute',
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#3B82F6',
    },
    markerDot: {
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#3B82F6',
        borderWidth: 3,
        borderColor: '#FFFFFF',
    },
    statsPanel: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 40,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 10,
    },
    gpsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        marginBottom: 12,
    },
    gpsText: {
        color: '#666',
        fontSize: 14,
        fontWeight: '500',
    },
    areaContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'center',
    },
    areaNumber: {
        fontSize: 64,
        fontWeight: '700',
        color: '#1A1A1A',
        lineHeight: 70,
    },
    areaUnit: {
        fontSize: 24,
        fontWeight: '500',
        color: '#1A1A1A',
        marginBottom: 12,
        marginLeft: 2,
    },
    captureStatus: {
        textAlign: 'center',
        color: '#666',
        fontSize: 14,
        marginBottom: 24,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1A1A1A',
    },
    statUnit: {
        fontSize: 14,
        fontWeight: '500',
    },
    statLabel: {
        fontSize: 12,
        color: '#888',
        marginTop: 4,
    },
    startButton: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E5E5',
        borderRadius: 30,
        paddingVertical: 16,
        alignItems: 'center',
        marginBottom: 16,
    },
    startButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A1A1A',
    },
    otherOptionsText: {
        textAlign: 'center',
        color: '#888',
        fontSize: 14,
        textDecorationLine: 'underline',
    },
});
