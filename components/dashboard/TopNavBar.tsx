import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type TabType = 'lobby' | 'single' | 'club';

interface TopNavBarProps {
    activeTab?: TabType;
    onTabChange?: (tab: TabType) => void;
}

export default function TopNavBar({ activeTab = 'single', onTabChange }: TopNavBarProps) {
    const [currentTab, setCurrentTab] = useState<TabType>(activeTab);

    const handleTabPress = (tab: TabType) => {
        setCurrentTab(tab);
        onTabChange?.(tab);
    };

    return (
        <View style={styles.container}>
            {/* Private Lobby - Dropdown style */}
            <TouchableOpacity
                style={[styles.tab, currentTab === 'lobby' && styles.activeTab]}
                onPress={() => handleTabPress('lobby')}
            >
                <Text style={[styles.tabText, currentTab === 'lobby' && styles.activeTabText]}>
                    Private Lobby
                </Text>
                <Ionicons
                    name="chevron-down"
                    size={14}
                    color={currentTab === 'lobby' ? '#FFFFFF' : 'rgba(255,255,255,0.6)'}
                />
            </TouchableOpacity>

            {/* Single Player - Center prominent */}
            <TouchableOpacity
                style={[
                    styles.tab,
                    styles.centerTab,
                    currentTab === 'single' && styles.activeTab,
                ]}
                onPress={() => handleTabPress('single')}
            >
                <Text style={[styles.tabText, currentTab === 'single' && styles.activeTabText]}>
                    Single Player
                </Text>
            </TouchableOpacity>

            {/* My Club */}
            <TouchableOpacity
                style={[styles.tab, currentTab === 'club' && styles.activeTab]}
                onPress={() => handleTabPress('club')}
            >
                <Text style={[styles.tabText, currentTab === 'club' && styles.activeTabText]}>
                    My Club
                </Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: 'transparent',
    },
    tab: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 4,
    },
    centerTab: {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        paddingHorizontal: 20,
    },
    activeTab: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    tabText: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 14,
        fontWeight: '500',
    },
    activeTabText: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
});
