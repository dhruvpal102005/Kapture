import {
    formatArea,
    getAreaLeaderboard,
    getUserRankAndStats,
    LeaderboardEntry,
} from '@/services/leaderboardService';
import { useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const METRICS = [
    { id: 'overall', label: 'OVERALL', icon: 'stats-chart' },
    { id: 'stealers', label: 'TOP STEALERS', icon: 'magnet' },
    { id: 'gainers', label: 'TOP GAINERS', icon: 'rocket' },
    { id: 'losers', label: 'TOP LOSERS', icon: 'trending-down' },
];

export default function LeaderboardView() {
    const { user } = useUser();
    const [activeMetric, setActiveMetric] = useState('overall');
    const [scope, setScope] = useState<'friends' | 'worldwide'>('worldwide');
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [userStats, setUserStats] = useState<{
        rank: number | null;
        totalArea: number;
        runCount: number;
    }>({ rank: null, totalArea: 0, runCount: 0 });

    // Fetch leaderboard data
    useEffect(() => {
        fetchLeaderboard();
    }, []);

    // Fetch user's own stats
    useEffect(() => {
        if (user?.id) {
            fetchUserStats(user.id);
        }
    }, [user?.id]);

    const fetchLeaderboard = async () => {
        setLoading(true);
        try {
            const data = await getAreaLeaderboard(50);
            setLeaderboard(data);
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserStats = async (userId: string) => {
        try {
            const stats = await getUserRankAndStats(userId);
            setUserStats(stats);
        } catch (error) {
            console.error('Error fetching user stats:', error);
        }
    };

    const renderItem = ({ item }: { item: LeaderboardEntry }) => (
        <View style={styles.rankRow}>
            <View style={styles.rankContainer}>
                <View style={[styles.flagStrip, { backgroundColor: getRankColor(item.rank) }]} />
                <Text style={styles.rankText}>{item.rank}</Text>
            </View>
            <View style={styles.avatarContainer}>
                {item.avatarUrl ? (
                    <Image source={{ uri: item.avatarUrl }} style={styles.avatarImage} />
                ) : (
                    <View style={styles.avatarPlaceholder}>
                        <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
                    </View>
                )}
            </View>
            <View style={styles.infoContainer}>
                <Text style={styles.nameText}>{item.name}</Text>
                <Text style={styles.runCountText}>{item.runCount} runs</Text>
            </View>
            <Text style={styles.scoreText}>{formatArea(item.totalArea)}</Text>
        </View>
    );

    const getRankColor = (rank: number) => {
        if (rank === 1) return '#FFD700'; // Gold
        if (rank === 2) return '#C0C0C0'; // Silver
        if (rank === 3) return '#CD7F32'; // Bronze
        return '#666';
    };

    const userName = user?.firstName || user?.username || 'You';

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

            {/* Current user's stats */}
            <View style={styles.userStatsRow}>
                <Text style={styles.userRank}>
                    {userStats.rank ? `#${userStats.rank}` : '?'}
                </Text>
                <View style={styles.userAvatar}>
                    {user?.imageUrl ? (
                        <Image source={{ uri: user.imageUrl }} style={styles.userAvatarImage} />
                    ) : (
                        <Ionicons name="person" size={16} color="#FFF" />
                    )}
                </View>
                <Text style={styles.userName}>{userName}</Text>
                <Text style={styles.userScore}>{formatArea(userStats.totalArea)}</Text>
            </View>

            {/* Leaderboard list */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#3B82F6" />
                    <Text style={styles.loadingText}>Loading leaderboard...</Text>
                </View>
            ) : leaderboard.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="trophy-outline" size={48} color="#666" />
                    <Text style={styles.emptyText}>No runs yet!</Text>
                    <Text style={styles.emptySubtext}>Start a run to capture territory</Text>
                </View>
            ) : (
                <FlatList
                    data={leaderboard}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.userId}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.listContent}
                    onRefresh={fetchLeaderboard}
                    refreshing={loading}
                />
            )}
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
        color: '#3B82F6',
        fontSize: 16,
        fontWeight: '700',
        width: 40,
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
        overflow: 'hidden',
    },
    userAvatarImage: {
        width: 32,
        height: 32,
        borderRadius: 16,
    },
    userName: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
        flex: 1,
    },
    userScore: {
        color: '#3B82F6',
        fontSize: 14,
        fontWeight: '700',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
    },
    loadingText: {
        color: '#666',
        marginTop: 12,
        fontSize: 14,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        color: '#999',
        fontSize: 18,
        fontWeight: '600',
        marginTop: 16,
    },
    emptySubtext: {
        color: '#666',
        fontSize: 14,
        marginTop: 4,
    },
    listContent: {
        paddingBottom: 20,
    },
    rankRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 2,
        paddingVertical: 12,
        backgroundColor: '#1E1E1E',
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
    avatarImage: {
        width: 40,
        height: 40,
        borderRadius: 8,
    },
    avatarText: {
        color: '#FFF',
        fontWeight: '600',
        fontSize: 16,
    },
    infoContainer: {
        flex: 1,
    },
    nameText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '600',
    },
    runCountText: {
        color: '#666',
        fontSize: 12,
        marginTop: 2,
    },
    scoreText: {
        color: '#3B82F6',
        fontSize: 14,
        fontWeight: '700',
        textAlign: 'right',
    },
});
