import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GLOBE_SIZE = SCREEN_WIDTH * 0.85;

interface GlobeProps {
    userLocation?: { latitude: number; longitude: number };
}

export default function Globe({ userLocation }: GlobeProps) {
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const glowAnim = useRef(new Animated.Value(0.5)).current;

    useEffect(() => {
        // Pulsing animation for user location marker
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.4,
                    duration: 1200,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1200,
                    useNativeDriver: true,
                }),
            ])
        ).start();

        // Glow animation for atmosphere
        Animated.loop(
            Animated.sequence([
                Animated.timing(glowAnim, {
                    toValue: 0.8,
                    duration: 3000,
                    useNativeDriver: true,
                }),
                Animated.timing(glowAnim, {
                    toValue: 0.5,
                    duration: 3000,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    return (
        <View style={styles.container}>
            {/* Starfield background */}
            <View style={styles.starfield}>
                {[...Array(50)].map((_, i) => (
                    <View
                        key={i}
                        style={[
                            styles.star,
                            {
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                width: Math.random() * 2 + 1,
                                height: Math.random() * 2 + 1,
                                opacity: Math.random() * 0.5 + 0.3,
                            },
                        ]}
                    />
                ))}
            </View>

            {/* Atmospheric glow */}
            <Animated.View
                style={[
                    styles.atmosphereGlow,
                    {
                        opacity: glowAnim,
                    },
                ]}
            />

            {/* Globe with Earth-like appearance */}
            <View style={styles.globe}>
                <LinearGradient
                    colors={['#1a3a4a', '#0d2633', '#0a1f2a', '#051520']}
                    locations={[0, 0.3, 0.6, 1]}
                    style={styles.globeGradient}
                >
                    {/* Continent-like shapes */}
                    <View style={[styles.continent, { top: '25%', left: '30%', width: 80, height: 50 }]} />
                    <View style={[styles.continent, { top: '40%', left: '55%', width: 60, height: 70 }]} />
                    <View style={[styles.continent, { top: '20%', left: '60%', width: 40, height: 30 }]} />
                    <View style={[styles.continent, { top: '55%', left: '25%', width: 50, height: 40 }]} />
                    <View style={[styles.continent, { top: '35%', left: '15%', width: 30, height: 25 }]} />
                </LinearGradient>

                {/* User location marker */}
                <View style={styles.userLocationContainer}>
                    <Animated.View
                        style={[
                            styles.userLocationPulse,
                            {
                                transform: [{ scale: pulseAnim }],
                                opacity: pulseAnim.interpolate({
                                    inputRange: [1, 1.4],
                                    outputRange: [0.6, 0],
                                }),
                            },
                        ]}
                    />
                    <View style={styles.userLocationDot} />
                </View>
            </View>

            {/* Bottom reflection/glow */}
            <LinearGradient
                colors={['transparent', 'rgba(100, 180, 255, 0.1)', 'transparent']}
                style={styles.bottomGlow}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    starfield: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#05090d',
    },
    star: {
        position: 'absolute',
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
    },
    atmosphereGlow: {
        position: 'absolute',
        width: GLOBE_SIZE + 50,
        height: GLOBE_SIZE + 50,
        borderRadius: (GLOBE_SIZE + 50) / 2,
        backgroundColor: 'transparent',
        borderWidth: 20,
        borderColor: 'rgba(100, 180, 255, 0.15)',
        shadowColor: '#64B4FF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 30,
    },
    globe: {
        width: GLOBE_SIZE,
        height: GLOBE_SIZE,
        borderRadius: GLOBE_SIZE / 2,
        overflow: 'hidden',
        shadowColor: '#64B4FF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    globeGradient: {
        width: '100%',
        height: '100%',
        position: 'relative',
    },
    continent: {
        position: 'absolute',
        backgroundColor: 'rgba(60, 120, 80, 0.5)',
        borderRadius: 20,
    },
    userLocationContainer: {
        position: 'absolute',
        top: '45%',
        left: '48%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    userLocationPulse: {
        position: 'absolute',
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(59, 130, 246, 0.4)',
    },
    userLocationDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#3B82F6',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    bottomGlow: {
        position: 'absolute',
        bottom: 0,
        width: GLOBE_SIZE * 1.5,
        height: 80,
    },
});
