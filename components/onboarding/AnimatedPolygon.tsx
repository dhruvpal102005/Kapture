import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { Polygon, Polyline, Circle } from 'react-native-maps';
import Animated, {
    useAnimatedProps,
    useSharedValue,
    withTiming,
    withDelay,
    Easing,
    withRepeat,
    withSequence,
} from 'react-native-reanimated';
import { ShapeConfig } from './onboardingData';

// Create animated versions of map components
const AnimatedPolygonComponent = Animated.createAnimatedComponent(Polygon);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface AnimatedPolygonProps {
    shape: ShapeConfig;
    animate?: boolean;
}

export default function AnimatedPolygon({ shape, animate = true }: AnimatedPolygonProps) {
    const fillOpacity = useSharedValue(0);
    const strokeOpacity = useSharedValue(0);
    const pulseOpacity = useSharedValue(1);

    useEffect(() => {
        if (animate) {
            // Animate stroke first, then fill
            strokeOpacity.value = withDelay(
                200,
                withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) })
            );
            fillOpacity.value = withDelay(
                600,
                withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) })
            );

            // Pulse animation for warning shapes
            if (shape.pulse) {
                pulseOpacity.value = withDelay(
                    1000,
                    withRepeat(
                        withSequence(
                            withTiming(0.5, { duration: 500 }),
                            withTiming(1, { duration: 500 })
                        ),
                        -1, // Infinite
                        true
                    )
                );
            }
        } else {
            fillOpacity.value = 1;
            strokeOpacity.value = 1;
        }
    }, [animate, shape.pulse]);

    // For web, just render static polygon
    if (Platform.OS === 'web') {
        return null;
    }

    if (shape.type === 'circle' && shape.centerCoordinate && shape.radius) {
        return (
            <Circle
                center={shape.centerCoordinate}
                radius={shape.radius}
                strokeColor={shape.strokeColor}
                fillColor={shape.fillColor}
                strokeWidth={3}
            />
        );
    }

    if (shape.type === 'polygon' && shape.coordinates.length > 0) {
        return (
            <Polygon
                coordinates={shape.coordinates}
                strokeColor={shape.strokeColor}
                fillColor={shape.fillColor}
                strokeWidth={3}
            />
        );
    }

    if (shape.type === 'polyline' && shape.coordinates.length > 0) {
        return (
            <Polyline
                coordinates={shape.coordinates}
                strokeColor={shape.strokeColor}
                strokeWidth={4}
            />
        );
    }

    return null;
}
