import { useRef, useState } from 'react';
import { Dimensions, PanResponder, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import LeaderboardView from './LeaderboardView';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Sliding positions (negative values move the sheet UP from below screen)
const MAX_TRANSLATE_Y = -SCREEN_HEIGHT * 0.85; // Almost full screen
const MIDDLE_TRANSLATE_Y = -SCREEN_HEIGHT * 0.5; // Half screen
const MIN_TRANSLATE_Y = -SCREEN_HEIGHT * 0.18; // Peek position

type SheetTab = 'leaderboard' | 'events' | 'territories' | 'history';

interface BottomSheetProps {
    activeTab?: SheetTab;
    onTabChange?: (tab: SheetTab) => void;
}

const tabs: { key: SheetTab; label: string }[] = [
    { key: 'leaderboard', label: 'Leaderboard' },
    { key: 'events', label: 'Events' },
    { key: 'territories', label: 'Territories' },
    { key: 'history', label: 'History' },
];

export default function BottomSheet({ activeTab = 'leaderboard', onTabChange }: BottomSheetProps) {
    const [currentTab, setCurrentTab] = useState<SheetTab>(activeTab);

    // Start at peek position
    const translateY = useSharedValue(MIN_TRANSLATE_Y);
    const startY = useRef(0);

    const handleTabPress = (tab: SheetTab) => {
        setCurrentTab(tab);
        onTabChange?.(tab);
        // Auto-expand to middle when tapping a tab
        if (translateY.value > MIDDLE_TRANSLATE_Y) {
            translateY.value = withSpring(MIDDLE_TRANSLATE_Y, { damping: 50 });
        }
    };

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: () => {
                startY.current = translateY.value;
            },
            onPanResponderMove: (_, gestureState) => {
                const newY = startY.current + gestureState.dy;
                // Clamp: more negative = higher up
                translateY.value = Math.max(Math.min(newY, 0), MAX_TRANSLATE_Y);
            },
            onPanResponderRelease: (_, gestureState) => {
                const velocity = gestureState.vy;
                const currentY = translateY.value;

                if (velocity > 0.5) {
                    // Fling down
                    if (currentY > MIDDLE_TRANSLATE_Y) {
                        translateY.value = withSpring(MIN_TRANSLATE_Y, { damping: 50 });
                    } else {
                        translateY.value = withSpring(MIDDLE_TRANSLATE_Y, { damping: 50 });
                    }
                } else if (velocity < -0.5) {
                    // Fling up
                    if (currentY < MIDDLE_TRANSLATE_Y) {
                        translateY.value = withSpring(MAX_TRANSLATE_Y, { damping: 50 });
                    } else {
                        translateY.value = withSpring(MIDDLE_TRANSLATE_Y, { damping: 50 });
                    }
                } else {
                    // Snap to nearest
                    const distMin = Math.abs(currentY - MIN_TRANSLATE_Y);
                    const distMid = Math.abs(currentY - MIDDLE_TRANSLATE_Y);
                    const distMax = Math.abs(currentY - MAX_TRANSLATE_Y);

                    if (distMin <= distMid && distMin <= distMax) {
                        translateY.value = withSpring(MIN_TRANSLATE_Y, { damping: 50 });
                    } else if (distMax <= distMid) {
                        translateY.value = withSpring(MAX_TRANSLATE_Y, { damping: 50 });
                    } else {
                        translateY.value = withSpring(MIDDLE_TRANSLATE_Y, { damping: 50 });
                    }
                }
            },
        })
    ).current;

    const rStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: translateY.value }],
        };
    });

    return (
        <Animated.View style={[styles.container, rStyle]}>
            {/* Handle - this is the draggable area */}
            <View style={styles.handleContainer} {...panResponder.panHandlers}>
                <View style={styles.handle} />
            </View>

            {/* Tab navigation */}
            <View style={styles.tabContainer}>
                {tabs.map((tab) => (
                    <TouchableOpacity
                        key={tab.key}
                        style={[styles.tab, currentTab === tab.key && styles.activeTab]}
                        onPress={() => handleTabPress(tab.key)}
                    >
                        <Text
                            style={[
                                styles.tabText,
                                currentTab === tab.key && styles.activeTabText,
                            ]}
                        >
                            {tab.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Content area */}
            <View style={styles.content}>
                {currentTab === 'leaderboard' && <LeaderboardView />}
                {currentTab !== 'leaderboard' && (
                    <View style={{ padding: 20, alignItems: 'center' }}>
                        <Text style={{ color: '#666' }}>Coming Soon</Text>
                    </View>
                )}
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: SCREEN_HEIGHT, // Start below the screen
        left: 0,
        right: 0,
        height: SCREEN_HEIGHT, // Full height when dragged up
        backgroundColor: '#1A1A1A',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 80, // Extra padding for bottom tab bar
        zIndex: 1000,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 10,
    },
    handleContainer: {
        alignItems: 'center',
        paddingVertical: 12,
        width: '100%',
    },
    handle: {
        width: 40,
        height: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        borderRadius: 2,
    },
    tabContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingTop: 4,
        paddingBottom: 12,
        justifyContent: 'space-around',
    },
    tab: {
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: '#FFFFFF',
    },
    tabText: {
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: 14,
        fontWeight: '500',
    },
    activeTabText: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
    },
});
