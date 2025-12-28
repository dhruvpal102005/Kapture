import React, { useState, useCallback } from 'react';
import {
    View,
    StyleSheet,
    Dimensions,
    StatusBar,
    Text,
    Platform,
} from 'react-native';
import { Stack, router } from 'expo-router';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from '@clerk/clerk-expo';

import OnboardingCard from '@/components/onboarding/OnboardingCard';
import AnimatedPolygon from '@/components/onboarding/AnimatedPolygon';
import { onboardingSteps } from '@/components/onboarding/onboardingData';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const ONBOARDING_COMPLETE_KEY = 'kapture_onboarding_complete';

// Custom dark map style (similar to INTVL dark theme)
const darkMapStyle = [
    { elementType: 'geometry', stylers: [{ color: '#1d2c4d' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#8ec3b9' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#1a3646' }] },
    {
        featureType: 'administrative.country',
        elementType: 'geometry.stroke',
        stylers: [{ color: '#4b6878' }],
    },
    {
        featureType: 'administrative.land_parcel',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#64779e' }],
    },
    {
        featureType: 'administrative.province',
        elementType: 'geometry.stroke',
        stylers: [{ color: '#4b6878' }],
    },
    {
        featureType: 'landscape.man_made',
        elementType: 'geometry.stroke',
        stylers: [{ color: '#334e87' }],
    },
    {
        featureType: 'landscape.natural',
        elementType: 'geometry',
        stylers: [{ color: '#023e58' }],
    },
    {
        featureType: 'poi',
        elementType: 'geometry',
        stylers: [{ color: '#283d6a' }],
    },
    {
        featureType: 'poi',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#6f9ba5' }],
    },
    {
        featureType: 'poi',
        elementType: 'labels.text.stroke',
        stylers: [{ color: '#1d2c4d' }],
    },
    {
        featureType: 'poi.park',
        elementType: 'geometry.fill',
        stylers: [{ color: '#023e58' }],
    },
    {
        featureType: 'poi.park',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#3C7680' }],
    },
    {
        featureType: 'road',
        elementType: 'geometry',
        stylers: [{ color: '#304a7d' }],
    },
    {
        featureType: 'road',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#98a5be' }],
    },
    {
        featureType: 'road',
        elementType: 'labels.text.stroke',
        stylers: [{ color: '#1d2c4d' }],
    },
    {
        featureType: 'road.highway',
        elementType: 'geometry',
        stylers: [{ color: '#2c6675' }],
    },
    {
        featureType: 'road.highway',
        elementType: 'geometry.stroke',
        stylers: [{ color: '#255763' }],
    },
    {
        featureType: 'road.highway',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#b0d5ce' }],
    },
    {
        featureType: 'road.highway',
        elementType: 'labels.text.stroke',
        stylers: [{ color: '#023e58' }],
    },
    {
        featureType: 'transit',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#98a5be' }],
    },
    {
        featureType: 'transit',
        elementType: 'labels.text.stroke',
        stylers: [{ color: '#1d2c4d' }],
    },
    {
        featureType: 'transit.line',
        elementType: 'geometry.fill',
        stylers: [{ color: '#283d6a' }],
    },
    {
        featureType: 'transit.station',
        elementType: 'geometry',
        stylers: [{ color: '#3a4762' }],
    },
    {
        featureType: 'water',
        elementType: 'geometry',
        stylers: [{ color: '#0e1626' }],
    },
    {
        featureType: 'water',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#4e6d70' }],
    },
];

export default function OnboardingScreen() {
    const [currentStep, setCurrentStep] = useState(0);
    const [selectedUnit, setSelectedUnit] = useState<string>('km');
    const [selectedColor, setSelectedColor] = useState<string>('#FFA500');
    const { user } = useUser();

    const step = onboardingSteps[currentStep];
    const userName = user?.firstName || 'Runner';

    const handleNext = useCallback(async () => {
        if (currentStep < onboardingSteps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            // Onboarding complete - save preferences and navigate
            try {
                await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
                await AsyncStorage.setItem('kapture_unit', selectedUnit);
                await AsyncStorage.setItem('kapture_color', selectedColor);
            } catch (error) {
                console.error('Failed to save onboarding state:', error);
            }
            router.replace('/');
        }
    }, [currentStep, selectedUnit, selectedColor]);

    const handleOptionSelect = useCallback((value: string) => {
        if (step.optionType === 'unit') {
            setSelectedUnit(value);
        } else if (step.optionType === 'color') {
            setSelectedColor(value);
        }
        handleNext();
    }, [step, handleNext]);

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar barStyle="light-content" />
            <View style={styles.container}>
                {/* Map Background */}
                {Platform.OS !== 'web' ? (
                    <MapView
                        style={styles.map}
                        provider={PROVIDER_GOOGLE}
                        customMapStyle={darkMapStyle}
                        region={step.mapRegion}
                        scrollEnabled={false}
                        zoomEnabled={false}
                        rotateEnabled={false}
                        pitchEnabled={false}
                        showsUserLocation={false}
                        showsMyLocationButton={false}
                        showsCompass={false}
                        showsScale={false}
                        showsBuildings={true}
                        showsTraffic={false}
                        showsIndoors={false}
                    >
                        {/* Render shapes for current step */}
                        {step.shapes?.map((shape, index) => (
                            <AnimatedPolygon
                                key={`${currentStep}-${index}`}
                                shape={shape}
                                animate={shape.animate}
                            />
                        ))}
                    </MapView>
                ) : (
                    // Fallback for web - use a dark background
                    <View style={styles.webMapFallback}>
                        <Text style={styles.webMapText}>Map View</Text>
                        <Text style={styles.webMapSubtext}>
                            (Use mobile device to see map)
                        </Text>
                    </View>
                )}

                {/* Area Counter (for screens 5, 6, 7) */}
                {step.showAreaCounter && (
                    <View style={styles.areaCounterContainer}>
                        <Text style={[styles.areaValue, { color: step.areaColor }]}>
                            {step.areaValue}
                            <Text style={styles.areaSuffix}>M²</Text>
                        </Text>
                        <Text style={[styles.areaLabel, { color: step.areaColor }]}>
                            Area Captured
                        </Text>
                    </View>
                )}

                {/* Onboarding Card */}
                <OnboardingCard
                    key={currentStep} // Force re-render for animation
                    message={step.message}
                    onNext={handleNext}
                    showOptions={step.showOptions}
                    options={step.options}
                    onOptionSelect={handleOptionSelect}
                    userName={userName}
                />
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a0a',
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    webMapFallback: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#1d2c4d',
        justifyContent: 'center',
        alignItems: 'center',
    },
    webMapText: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: 'bold',
    },
    webMapSubtext: {
        color: '#8ec3b9',
        fontSize: 14,
        marginTop: 8,
    },
    areaCounterContainer: {
        position: 'absolute',
        top: 60,
        alignSelf: 'center',
        alignItems: 'center',
    },
    areaValue: {
        fontSize: 72,
        fontWeight: '800',
    },
    areaSuffix: {
        fontSize: 24,
        fontWeight: '400',
    },
    areaLabel: {
        fontSize: 16,
        fontWeight: '600',
        marginTop: -4,
    },
});
