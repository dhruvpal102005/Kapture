import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';

interface MapGlobeProps {
    userLocation?: { latitude: number; longitude: number };
    territories?: {
        coordinates: { latitude: number; longitude: number }[];
        color: string;
    }[];
    onGlobeReady?: () => void;
}

export default function MapGlobe({ userLocation, territories, onGlobeReady }: MapGlobeProps) {
    const mapRef = useRef<MapView>(null);
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const [mapReady, setMapReady] = useState(false);

    // Default to Mumbai if no location
    const lat = userLocation?.latitude ?? 19.076;
    const lng = userLocation?.longitude ?? 72.8777;

    // Pulse animation for location marker
    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.5,
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

    // Center map when location changes
    useEffect(() => {
        if (mapRef.current && userLocation && mapReady) {
            mapRef.current.animateToRegion({
                latitude: lat,
                longitude: lng,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
            }, 1000);
        }
    }, [userLocation, mapReady]);

    const handleMapReady = () => {
        setMapReady(true);
        onGlobeReady?.();
    };

    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                style={styles.map}
                provider={PROVIDER_GOOGLE}
                mapType="terrain"
                initialRegion={{
                    latitude: lat,
                    longitude: lng,
                    latitudeDelta: 0.1,
                    longitudeDelta: 0.1,
                }}
                onMapReady={handleMapReady}
                rotateEnabled={true}
                scrollEnabled={true}
                zoomEnabled={true}
                pitchEnabled={true}
                showsCompass={false}
                showsScale={false}
                showsBuildings={true}
                showsTraffic={false}
                showsIndoors={false}
                toolbarEnabled={false}
                loadingEnabled={true}
                loadingIndicatorColor="#3B82F6"
                loadingBackgroundColor="#0a1525"
            >
                {/* User location marker */}
                <Marker
                    coordinate={{ latitude: lat, longitude: lng }}
                    anchor={{ x: 0.5, y: 0.5 }}
                >
                    <View style={styles.markerContainer}>
                        <Animated.View
                            style={[
                                styles.markerPulse,
                                {
                                    transform: [{ scale: pulseAnim }],
                                    opacity: pulseAnim.interpolate({
                                        inputRange: [1, 1.5],
                                        outputRange: [0.6, 0],
                                    }),
                                },
                            ]}
                        />
                        <View style={styles.markerDot} />
                    </View>
                </Marker>
            </MapView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        flex: 1,
    },
    markerContainer: {
        width: 50,
        height: 50,
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
        shadowColor: '#3B82F6',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 8,
        elevation: 5,
    },
});
