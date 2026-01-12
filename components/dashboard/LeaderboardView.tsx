import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Mock Data
const LEADERBOARD_DATA = [
    { id: '1', rank: 1, name: 'Alice Smith', countryCode: 'US', score: '2,400.5KM²', trend: 'up' },
    { id: '2', rank: 2, name: 'Bob Johnson', countryCode: 'FR', score: '1,950.2KM²', trend: 'down' },
    { id: '3', rank: 3, name: 'Charlie Kim', countryCode: 'KR', score: '1,800.0KM²', trend: 'up' },
    { id: '4', rank: 4, name: 'David Lee', countryCode: 'JP', score: '1,750.8KM²', trend: 'stable' },
    { id: '5', rank: 5, name: 'Emma Watson', countryCode: 'GB', score: '1,600.4KM²', trend: 'up' },
    { id: '6', rank: 6, name: 'Frank Miller', countryCode: 'US', score: '1,200.1KM²', trend: 'down' },
    { id: '7', rank: 7, name: 'Grace Ho', countryCode: 'CN', score: '1,100.9KM²', trend: 'up' },
    { id: '8', rank: 8, name: 'Henry Ford', countryCode: 'US', score: '1,000.5KM²', trend: 'stable' },
    { id: '9', rank: 9, name: 'Nate Pendleton', countryCode: 'US', score: '959.0KM²', trend: 'up' },
    { id: '10', rank: 10, name: 'Nick Van Praag', countryCode: 'ES', score: '950.9KM²', trend: 'down' },
    { id: '11', rank: 11, name: 'Ivy Thomas', countryCode: 'CA', score: '900.2KM²', trend: 'up' },
];

const METRICS = [
    { id: 'overall', label: 'OVERALL', icon: 'stats-chart' },
    { id: 'stealers', label: 'TOP STEALERS', icon: 'magnet' },
    { id: 'gainers', label: 'TOP GAINERS', icon: 'rocket' },
    { id: 'losers', label: 'TOP LOSERS', icon: 'trending-down' },
];

export default function LeaderboardView() {
    const [activeMetric, setActiveMetric] = useState('overall');
    const [scope, setScope] = useState<'friends' | 'worldwide'>('worldwide');

    const renderItem = ({ item }: { item: typeof LEADERBOARD_DATA[0] }) => (
        <View style={styles.rankRow}>
            <View style={styles.rankContainer}>
                <View style={[styles.flagStrip, { backgroundColor: getFlagColor(item.countryCode) }]} />
                <Text style={styles.rankText}>{item.rank}</Text>
            </View>
            <View style={styles.avatarContainer}>
                <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
                </View>
            </View>
            <View style={styles.infoContainer}>
                <Text style={styles.nameText}>{item.name}</Text>
            </View>
            <Text style={styles.scoreText}>{item.score}</Text>
        </View>
    );

    const getFlagColor = (code: string) => {
        const colors: any = { US: '#EF4444', ES: '#F59E0B', FR: '#3B82F6' };
        return colors[code] || '#666';
    };

    return (
        <View style={styles.container}>
            <View style={styles.metricsRow}>
                {METRICS.map((m) => (
                    <TouchableOpacity
                        key={m.id}
                        style={[styles.metricItem, activeMetric === m.id && styles.activeMetric]}
                        onPress={() => setActiveMetric(m.id)}
                    >
                        <Ionicons
                            name={m.icon as any}
                            size={20}
                            color={activeMetric === m.id ? '#FFFFFF' : '#666'}
                            style={{ marginBottom: 4 }}
                        />
                        <Text style={[styles.metricLabel, activeMetric === m.id && styles.activeMetricLabel]}>
                            {m.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.scopeContainer}>
                <View style={styles.scopeToggle}>
                    <TouchableOpacity
                        style={[styles.scopeOption, scope === 'friends' && styles.activeScope]}
                        onPress={() => setScope('friends')}
                    >
                        <Text style={[styles.scopeText, scope === 'friends' && styles.activeScopeText]}>
                            Friends
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.scopeOption, scope === 'worldwide' && styles.activeScope]}
                        onPress={() => setScope('worldwide')}
                    >
                        <Text style={[styles.scopeText, scope === 'worldwide' && styles.activeScopeText]}>
                            Worldwide
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.userStatsRow}>
                <Text style={styles.userRank}>?</Text>
                <View style={styles.userAvatar}>
                    <Ionicons name="person" size={16} color="#FFF" />
                </View>
                <Text style={styles.userName}>Dhruv Pal</Text>
                <Text style={styles.userScore}>0M²</Text>
            </View>

            <FlatList
                data={LEADERBOARD_DATA}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 16,
    },
    metricsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    metricItem: {
        alignItems: 'center',
        flex: 1,
        opacity: 0.5,
    },
    activeMetric: {
        opacity: 1,
    },
    metricLabel: {
        color: '#666',
        fontSize: 10,
        fontWeight: '600',
        textAlign: 'center',
    },
    activeMetricLabel: {
        color: '#FFFFFF',
    },
    scopeContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    scopeToggle: {
        flexDirection: 'row',
        gap: 40,
    },
    scopeOption: {
        paddingVertical: 8,
    },
    activeScope: {},
    scopeText: {
        color: '#666',
        fontSize: 14,
        fontWeight: '500',
    },
    activeScopeText: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
    userStatsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2A2A2A',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginBottom: 16,
    },
    userRank: {
        color: '#999',
        fontSize: 16,
        fontWeight: '700',
        width: 30,
        textAlign: 'center',
    },
    userAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#444',
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 12,
    },
    userName: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
        flex: 1,
    },
    userScore: {
        color: '#999',
        fontSize: 14,
        fontWeight: '600',
    },
    listContent: {
        paddingBottom: 20,
    },
    rankRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 2,
        paddingVertical: 12,
        backgroundColor: '#1E1E1E', // Slightly lighter than background
        borderRadius: 8,
        paddingRight: 12,
    },
    rankContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: 50,
    },
    flagStrip: {
        width: 4,
        height: 24,
        backgroundColor: '#EF4444',
        marginRight: 8,
        borderTopRightRadius: 2,
        borderBottomRightRadius: 2,
    },
    rankText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '700',
        marginLeft: 4,
    },
    avatarContainer: {
        marginRight: 12,
    },
    avatarPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: '#333',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: '#FFF',
        fontWeight: '600',
    },
    infoContainer: {
        flex: 1,
    },
    nameText: {
        color: '#999',
        fontSize: 14,
        fontWeight: '500',
    },
    scoreText: {
        color: '#666',
        fontSize: 14,
        fontWeight: '700',
        textAlign: 'right',
    },
});
