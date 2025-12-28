import React, { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { Polygon, Polyline, Circle } from 'react-native-maps';
import Animated, {
    useSharedValue,
    withTiming,
    withDelay,
    Easing,
    withRepeat,
    withSequence,
    runOnJS,
} from 'react-native-reanimated';
import { ShapeConfig } from './onboardingData';

interface AnimatedPolygonProps {
    shape: ShapeConfig;
    animate?: boolean;
}

export default function AnimatedPolygon({ shape, animate = true }: AnimatedPolygonProps) {
    const [visibleCoordinates, setVisibleCoordinates] = useState<typeof shape.coordinates>([]);
    const [isDrawingComplete, setIsDrawingComplete] = useState(false);
    const [showFill, setShowFill] = useState(false);

    const fillOpacity = useSharedValue(0);
    const pulseOpacity = useSharedValue(1);

    useEffect(() => {
        if (!animate || shape.type !== 'polygon') {
            // No animation - show everything immediately
            setVisibleCoordinates(shape.coordinates);
            setIsDrawingComplete(true);
            setShowFill(true);
            return;
        }

        // Reset state
        setVisibleCoordinates([]);
        setIsDrawingComplete(false);
        setShowFill(false);

        // Progressive drawing animation
        const totalPoints = shape.coordinates.length;
        const drawDuration = 1500; // Total time to draw the route
        const delayPerPoint = drawDuration / totalPoints;

        // Reveal points one by one
        shape.coordinates.forEach((coord, index) => {
            setTimeout(() => {
                setVisibleCoordinates(prev => [...prev, coord]);

                // When we reach the last point, drawing is complete
                if (index === totalPoints - 1) {
                    setTimeout(() => {
                        setIsDrawingComplete(true);
                        // Show filled polygon after a brief pause
                        setTimeout(() => {
                            setShowFill(true);
                            fillOpacity.value = withTiming(1, {
                                duration: 600,
                                easing: Easing.out(Easing.cubic)
                            });
                        }, 200);
                    }, 100);
                }
            }, delayPerPoint * index);
        });

        // Pulse animation for warning shapes
        if (shape.pulse) {
            setTimeout(() => {
                pulseOpacity.value = withRepeat(
                    withSequence(
                        withTiming(0.5, { duration: 500 }),
                        withTiming(1, { duration: 500 })
                    ),
                    -1,
                    true
                );
            }, drawDuration + 800);
        }

        // Cleanup
        return () => {
            setVisibleCoordinates([]);
            setIsDrawingComplete(false);
            setShowFill(false);
        };
    }, [animate, shape.coordinates, shape.pulse]);

    // For web, just render static polygon
    if (Platform.OS === 'web') {
        return null;
    }

    // Circle rendering (no progressive animation for circles)
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

    // Polygon rendering with progressive drawing
    if (shape.type === 'polygon' && shape.coordinates.length > 0) {
        return (
            <>
                {/* Drawing phase - show the route being drawn with Polyline */}
                {visibleCoordinates.length > 1 && !showFill && (
                    <Polyline
                        coordinates={visibleCoordinates}
                        strokeColor={shape.strokeColor}
                        strokeWidth={4}
                    />
                )}

                {/* Fill phase - show the completed polygon with territory fill */}
                {showFill && (
                    <Polygon
                        coordinates={shape.coordinates}
                        strokeColor={shape.strokeColor}
                        fillColor={shape.fillColor}
                        strokeWidth={3}
                    />
                )}
            </>
        );
    }

    // Polyline rendering
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
