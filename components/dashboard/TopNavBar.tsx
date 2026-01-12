import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type TabType = 'lobby' | 'single' | 'club';

interface TopNavBarProps {
    activeTab?: TabType;
    onTabChange?: (tab: TabType) => void;
}

export default function TopNavBar({ activeTab = 'single', onTabChange }: TopNavBarProps) {
    const handleTabPress = (tab: TabType) => {
        onTabChange?.(tab);
    };

    return (
        <View style={styles.container}>
            {/* Private Lobby - Dropdown style */}
            <TouchableOpacity
                style={[styles.tab, activeTab === 'lobby' && styles.activeTab]}
                onPress={() => handleTabPress('lobby')}
            >
                <Text style={[styles.tabText, activeTab === 'lobby' && styles.activeTabText]}>
                    Private Lobby
                </Text>
                <Ionicons
                    name="chevron-down"
                    size={14}
                    color={activeTab === 'lobby' ? '#FFFFFF' : 'rgba(255,255,255,0.6)'}
                />
            </TouchableOpacity>

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
        // Removed static background color to prevent "always active" look
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
