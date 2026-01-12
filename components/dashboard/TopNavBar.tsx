import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type TabType = 'lobby' | 'single' | 'club';

interface TopNavBarProps {
    activeTab?: TabType;
    onTabChange?: (tab: TabType) => void;
}

export default function TopNavBar({ activeTab = 'single', onTabChange }: TopNavBarProps) {
    const [showLobbyDropdown, setShowLobbyDropdown] = useState(false);

    const handleTabPress = (tab: TabType) => {
        if (tab === 'lobby') {
            setShowLobbyDropdown(!showLobbyDropdown);
            onTabChange?.(tab);
        } else {
            setShowLobbyDropdown(false);
            onTabChange?.(tab);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.lobbyContainer}>
                {/* Private Lobby - Dropdown style */}
                <TouchableOpacity
                    style={[styles.tab]} // Removed activeTab style
                    onPress={() => handleTabPress('lobby')}
                >
                    <Text style={[styles.tabText, activeTab === 'lobby' && styles.activeTabText]}>
                        Private Lobby
                    </Text>
                    <Ionicons
                        name={showLobbyDropdown ? 'chevron-up' : 'chevron-down'}
                        size={14}
                        color={activeTab === 'lobby' ? '#FFFFFF' : 'rgba(255,255,255,0.6)'}
                    />
                </TouchableOpacity>

                {/* Dropdown Menu */}
                {showLobbyDropdown && (
                    <View style={styles.dropdown}>
                        <TouchableOpacity style={styles.dropdownItem}>
                            <Ionicons name="add-circle-outline" size={20} color="#d4fc45" />
                            <Text style={styles.dropdownText}>Create/Join a Private Lobby</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            {/* Single Player - Center prominent */}
            <TouchableOpacity
                style={[
                    styles.tab,
                    styles.centerTab,
                    activeTab === 'single' && styles.activeTab,
                ]}
                onPress={() => handleTabPress('single')}
            >
                <Text style={[styles.tabText, activeTab === 'single' && styles.activeTabText]}>
                    Single Player
                </Text>
            </TouchableOpacity>

            {/* My Club */}
            <TouchableOpacity
                style={[styles.tab, activeTab === 'club' && styles.activeTab]}
                onPress={() => handleTabPress('club')}
            >
                <Text style={[styles.tabText, activeTab === 'club' && styles.activeTabText]}>
                    My Club
                </Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        paddingTop: 8,
        paddingBottom: 8,
        backgroundColor: 'transparent',
        zIndex: 100,
    },
    lobbyContainer: {
        position: 'relative',
        zIndex: 101,
    },
    dropdown: {
        position: 'absolute',
        top: 40,
        left: 0,
        backgroundColor: '#000000', // Pure black for better contrast
        borderWidth: 1,
        borderColor: '#333333',
        borderRadius: 12,
        padding: 4, // Slight padding wrapper
        minWidth: 240, // Wider
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 8,
        zIndex: 1000,
    },
    dropdownItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        gap: 10,
        borderRadius: 8,
        backgroundColor: '#111111', // Slightly lighter inner background
    },
    dropdownText: {
        color: '#d4fc45',
        fontSize: 14,
        fontWeight: '600',
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
