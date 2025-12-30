import GPSPermissionModal from '@/components/run/GPSPermissionModal';
import PostRunModal from '@/components/run/PostRunModal';
import { LocationPoint, RunStats, runTrackingService } from '@/services/runTrackingService';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Easing,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type RunState = 'idle' | 'running' | 'paused' | 'finished';

export default function StartScreen() {
    const mapRef = useRef<MapView>(null);
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const finishProgressAnim = useRef(new Animated.Value(0)).current;
    const isHoldingFinishRef = useRef(false);
    const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [mapReady, setMapReady] = useState(false);
    const [showPermissionModal, setShowPermissionModal] = useState(false);
    const [hasPermission, setHasPermission] = useState(false);
    const [runState, setRunState] = useState<RunState>('idle');
    const [showPostRunModal, setShowPostRunModal] = useState(false);
    const [routeCoordinates, setRouteCoordinates] = useState<LocationPoint[]>([]);
    const [isHoldingFinish, setIsHoldingFinish] = useState(false);

    // Stats
    const [distance, setDistance] = useState(0);
    const [duration, setDuration] = useState(0);
    const [pace, setPace] = useState(0);
    const [capturedArea, setCapturedArea] = useState(0);
    const [finalStats, setFinalStats] = useState<RunStats | null>(null);

    // Show permission modal immediately when user opens Start tab
    useEffect(() => {
        (async () => {
            try {
                const { status } = await Location.getForegroundPermissionsAsync();
                if (status === 'granted') {
                    setHasPermission(true);
                    await initializeLocation();
                    // Don't show modal if already granted
                    setShowPermissionModal(false);
                } else {
                    // Show permission modal immediately if not granted
                    setShowPermissionModal(true);
                }
            } catch (error) {
                console.error('Error checking permissions:', error);
                // Show permission modal immediately on error
                setShowPermissionModal(true);
            }
        })();
    }, []);

    const initializeLocation = async () => {
        try {
            const location = await Location.getCurrentPositionAsync({});
            const coords = {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            };
            setUserLocation(coords);
        } catch (error) {
            console.error('Error getting location:', error);
            setUserLocation({ latitude: 19.076, longitude: 72.8777 });
        }
    };

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

    // Center map when location updates
    useEffect(() => {
        if (mapRef.current && userLocation && mapReady) {
            mapRef.current.animateToRegion(
                {
                    latitude: userLocation.latitude,
                    longitude: userLocation.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                },
                500
            );
        }
    }, [userLocation, mapReady]);

    const handlePermissionAccept = async () => {
        setShowPermissionModal(false);
        const granted = await runTrackingService.requestPermissions();
        if (granted) {
            setHasPermission(true);
            await initializeLocation();
        }
    };

    const handlePermissionDeny = () => {
        setShowPermissionModal(false);
    };

    const handleStartRun = async () => {
        if (!hasPermission) {
            setShowPermissionModal(true);
            return;
        }

        const started = await runTrackingService.startTracking(
            (location) => {
                setUserLocation({
                    latitude: location.latitude,
                    longitude: location.longitude,
                });
                setRouteCoordinates((prev) => [...prev, location]);
            },
            (stats) => {
                setDistance(stats.distance);
                setDuration(stats.duration);
                setPace(stats.averagePace);
                setCapturedArea(Math.floor(stats.capturedArea));
            }
        );

        if (started) {
            setRunState('running');
            setRouteCoordinates([]);
        }
    };

    const handlePauseRun = () => {
        runTrackingService.pauseTracking();
        setRunState('paused');
    };

    const handleResumeRun = async () => {
        await runTrackingService.resumeTracking();
        setRunState('running');
    };

    const handleFinishPressIn = () => {
        isHoldingFinishRef.current = true;
        setIsHoldingFinish(true);
        // Animate progress over 2 seconds
        Animated.timing(finishProgressAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: false,
        }).start(({ finished }) => {
            if (finished && isHoldingFinishRef.current) {
                handleFinishRun();
            }
        });
    };

    const handleFinishPressOut = () => {
        isHoldingFinishRef.current = false;
        setIsHoldingFinish(false);
        // Reset progress
        Animated.timing(finishProgressAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: false,
        }).start();
    };

    const handleFinishRun = () => {
        setIsHoldingFinish(false);
        finishProgressAnim.setValue(0);
        const stats = runTrackingService.stopTracking();
        setFinalStats(stats);
        setRunState('finished');
        setShowPostRunModal(true);
    };

    const handleSaveRun = () => {
        // TODO: Save run to backend/database
        console.log('Saving run:', finalStats);
        setShowPostRunModal(false);
        resetRun();
    };

    const handleDiscardRun = () => {
        setShowPostRunModal(false);
        resetRun();
    };

    const resetRun = () => {
        setRunState('idle');
        setDistance(0);
        setDuration(0);
        setPace(0);
        setCapturedArea(0);
        setRouteCoordinates([]);
        setFinalStats(null);
    };

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const formatPace = (paceSeconds: number): string => {
        if (paceSeconds === 0 || !isFinite(paceSeconds)) return '0:00';
        const mins = Math.floor(paceSeconds / 60);
        const secs = Math.floor(paceSeconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
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
                        {/* Route polyline */}
                        {routeCoordinates.length > 1 && (
                            <Polyline
                                coordinates={routeCoordinates.map((loc) => ({
                                    latitude: loc.latitude,
                                    longitude: loc.longitude,
                                }))}
                                strokeColor="#3B82F6"
                                strokeWidth={4}
                            />
                        )}

                        {/* User location marker */}
                        {userLocation && (
                            <Marker coordinate={userLocation} anchor={{ x: 0.5, y: 0.5 }}>
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
                        )}
                    </MapView>
                )}

                {/* Back button */}
                <SafeAreaView style={styles.headerOverlay} edges={['top']}>
                    <TouchableOpacity style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#333" />
                    </TouchableOpacity>
                </SafeAreaView>

                {/* Center on location button */}
                <TouchableOpacity
                    style={styles.centerButton}
                    onPress={() => {
                        if (mapRef.current && userLocation) {
                            mapRef.current.animateToRegion(
                                {
                                    latitude: userLocation.latitude,
                                    longitude: userLocation.longitude,
                                    latitudeDelta: 0.01,
                                    longitudeDelta: 0.01,
                                },
                                500
                            );
                        }
                    }}
                >
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
                <Text style={styles.captureStatus}>
                    {runState === 'running' ? 'Capture in Progress' : runState === 'paused' ? 'Paused' : 'Ready to Start'}
                </Text>

                {/* Stats row */}
                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>
                            {distance.toFixed(2)}
                            <Text style={styles.statUnit}>km</Text>
                        </Text>
                        <Text style={styles.statLabel}>Distance</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{formatTime(duration)}</Text>
                        <Text style={styles.statLabel}>Duration</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{formatPace(pace)}</Text>
                        <Text style={styles.statLabel}>Average pace</Text>
                    </View>
                </View>

                {/* Action buttons */}
                {runState === 'idle' && (
                    <>
                        <TouchableOpacity style={styles.startButton} onPress={handleStartRun}>
                            <Text style={styles.startButtonText}>Start Run</Text>
                        </TouchableOpacity>
                        <TouchableOpacity>
                            <Text style={styles.otherOptionsText}>View other options</Text>
                        </TouchableOpacity>
                    </>
                )}

                {runState === 'running' && (
                    <View style={styles.actionButtonRow}>
                        <TouchableOpacity style={styles.pauseButton} onPress={handlePauseRun}>
                            <Ionicons name="pause" size={20} color="#1A1A1A" />
                            <Text style={styles.pauseButtonText}>Pause Run</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.finishButton}
                            onPressIn={handleFinishPressIn}
                            onPressOut={handleFinishPressOut}
                            activeOpacity={0.9}
                        >
                            <View style={styles.finishButtonProgressContainer}>
                                <Animated.View
                                    style={[
                                        styles.finishButtonProgress,
                                        {
                                            width: finishProgressAnim.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: ['0%', '100%'],
                                            }),
                                        },
                                    ]}
                                />
                            </View>
                            <View style={styles.finishButtonContent}>
                                <Ionicons name="square" size={20} color="#FFFFFF" />
                                <Text style={styles.finishButtonText}>Hold to Finish</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                )}

                {runState === 'paused' && (
                    <View style={styles.actionButtonRow}>
                        <TouchableOpacity style={styles.resumeButton} onPress={handleResumeRun}>
                            <Ionicons name="play" size={20} color="#1A1A1A" />
                            <Text style={styles.resumeButtonText}>Resume Run</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.finishButton}
                            onPressIn={handleFinishPressIn}
                            onPressOut={handleFinishPressOut}
                            activeOpacity={0.9}
                        >
                            <View style={styles.finishButtonProgressContainer}>
                                <Animated.View
                                    style={[
                                        styles.finishButtonProgress,
                                        {
                                            width: finishProgressAnim.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: ['0%', '100%'],
                                            }),
                                        },
                                    ]}
                                />
                            </View>
                            <View style={styles.finishButtonContent}>
                                <Ionicons name="square" size={20} color="#FFFFFF" />
                                <Text style={styles.finishButtonText}>Hold to Finish</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            {/* Modals */}
            <GPSPermissionModal
                visible={showPermissionModal}
                onAccept={handlePermissionAccept}
                onDeny={handlePermissionDeny}
            />

            {finalStats && (
                <PostRunModal
                    visible={showPostRunModal}
                    stats={finalStats}
                    onSave={handleSaveRun}
                    onDiscard={handleDiscardRun}
                />
            )}
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
    actionButtonRow: {
        flexDirection: 'row',
        gap: 12,
    },
    pauseButton: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E5E5',
        borderRadius: 12,
        paddingVertical: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    pauseButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A1A1A',
    },
    resumeButton: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E5E5',
        borderRadius: 12,
        paddingVertical: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    resumeButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A1A1A',
    },
    finishButton: {
        flex: 1,
        backgroundColor: '#1A1A1A',
        borderRadius: 12,
        paddingVertical: 14,
        overflow: 'hidden',
        position: 'relative',
    },
    finishButtonProgressContainer: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        right: 0,
        backgroundColor: '#1A1A1A',
    },
    finishButtonProgress: {
        height: '100%',
        backgroundColor: '#EF4444',
    },
    finishButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        position: 'relative',
        zIndex: 1,
    },
    finishButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    otherOptionsText: {
        textAlign: 'center',
        color: '#888',
        fontSize: 14,
        textDecorationLine: 'underline',
    },
});
