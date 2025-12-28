import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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

    const handleTabPress = (tab: SheetTab) => {
        setCurrentTab(tab);
        onTabChange?.(tab);
    };

    return (
        <View style={styles.container}>
            {/* Handle indicator */}
            <View style={styles.handleContainer}>
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

            {/* Content area (placeholder for now) */}
            <View style={styles.content}>
                {/* This will show content based on active tab */}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#1A1A1A',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 20,
    },
    handleContainer: {
        alignItems: 'center',
        paddingVertical: 10,
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
        minHeight: 20,
        paddingHorizontal: 16,
    },
});
