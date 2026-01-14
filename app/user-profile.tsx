import { db } from '@/config/firebase';
import { followUser, getUserCounts, isFollowing, unfollowUser, UserProfile } from '@/services/friendsService';
import { useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface UserStats {
    totalRuns: number;
    totalDistance: number; // in km
    pb1km: string;
    pb5km: string;
    pb10km: string;
    weeklyData: number[];
}

export default function UserProfileScreen() {
    const { user } = useUser();
    const params = useLocalSearchParams<{ userId: string; userName?: string; userImage?: string }>();
    const [loading, setLoading] = useState(true);
    const [profileUser, setProfileUser] = useState<UserProfile | null>(null);
    const [counts, setCounts] = useState({ following: 0, followers: 0 });
    const [following, setFollowing] = useState(false);
    const [stats, setStats] = useState<UserStats>({
        totalRuns: 0,
        totalDistance: 0,
        pb1km: '-',
        pb5km: '-',
        pb10km: '-',
        weeklyData: [0, 0, 0, 0, 0, 0, 0],
    });

    useEffect(() => {
        if (params.userId) {
            loadUserProfile();
        }
    }, [params.userId]);

    const loadUserProfile = async () => {
        setLoading(true);
        try {
            // Load user document
            const userDoc = await getDoc(doc(db, 'users', params.userId));
            if (userDoc.exists()) {
                const data = userDoc.data();
                setProfileUser({
                    id: params.userId,
                    name: data.name || data.firstName || params.userName || 'Anonymous',
                    email: data.email,
                    imageUrl: data.imageUrl || params.userImage,
                    followingCount: data.followingCount || 0,
                    followersCount: data.followersCount || 0,
                });
            } else {
                // Use passed params if doc doesn't exist
                setProfileUser({
                    id: params.userId,
                    name: params.userName || 'Anonymous',
                    imageUrl: params.userImage,
                    followingCount: 0,
                    followersCount: 0,
                });
            }

            // Get counts
            const userCounts = await getUserCounts(params.userId);
            setCounts(userCounts);

            // Check if current user follows this user
            if (user?.id) {
                const isFollowingUser = await isFollowing(user.id, params.userId);
                setFollowing(isFollowingUser);
            }

            // Load run stats
            await loadUserStats();
        } catch (error) {
            console.error('Error loading profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadUserStats = async () => {
        try {
            const runsRef = collection(db, 'runs');
            const q = query(
                runsRef,
                where('userId', '==', params.userId),
                where('status', '==', 'completed')
            );
            const snapshot = await getDocs(q);

            let totalRuns = 0;
            let totalDistance = 0;
            const distances: number[] = [];

            snapshot.forEach(doc => {
                const data = doc.data();
                totalRuns++;
                const dist = data.distance || 0;
                totalDistance += dist;
                distances.push(dist);
            });

            // Calculate PBs (simplified - just showing if they have runs)
            const pb1km = distances.some(d => d >= 1000) ? formatPace(1000) : '-';
            const pb5km = distances.some(d => d >= 5000) ? formatPace(5000) : '-';
            const pb10km = distances.some(d => d >= 10000) ? formatPace(10000) : '-';

            setStats({
                totalRuns,
                totalDistance: totalDistance / 1000, // Convert to km
                pb1km,
                pb5km,
                pb10km,
                weeklyData: [0, 0, 0, 0, 0, 0, 0], // Placeholder for chart
            });
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    };

    const formatPace = (distance: number): string => {
        // Placeholder - would calculate actual PB
        return '-';
    };

    const handleFollowToggle = async () => {
        if (!user?.id || !params.userId) return;

        if (following) {
            const success = await unfollowUser(user.id, params.userId);
            if (success) {
                setFollowing(false);
                setCounts(prev => ({ ...prev, followers: Math.max(0, prev.followers - 1) }));
            }
        } else {
            const success = await followUser(user.id, params.userId);
            if (success) {
                setFollowing(true);
                setCounts(prev => ({ ...prev, followers: prev.followers + 1 }));
            }
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#FF6E6E" />
                </View>
            </SafeAreaView>
        );
    }

    const userName = profileUser?.name || 'Anonymous';
    const initials = userName.substring(0, 2).toUpperCase();

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#FFF" />
                    </TouchableOpacity>
                </View>

                {/* Avatar */}
                <View style={styles.avatarSection}>
                    <View style={styles.avatarContainer}>
                        {profileUser?.imageUrl ? (
                            <Image source={{ uri: profileUser.imageUrl }} style={styles.avatar} />
                        ) : (
                            <View style={styles.avatarPlaceholder}>
                                <View style={styles.avatarGradient} />
                                <Ionicons name="person" size={60} color="#000" style={styles.avatarIcon} />
                            </View>
                        )}
                        <View style={styles.levelBadge}>
                            <Text style={styles.levelText}>{initials}</Text>
                        </View>
                    </View>
                </View>

                {/* Name */}
                <Text style={styles.userName}>{userName}</Text>

                {/* Follow Stats Row */}
                <View style={styles.followRow}>
                    <View style={styles.countItem}>
                        <Text style={styles.countNumber}>{counts.following}</Text>
                        <Text style={styles.countLabel}>Following</Text>
                    </View>
                    <View style={styles.countItem}>
                        <Text style={styles.countNumber}>{counts.followers}</Text>
                        <Text style={styles.countLabel}>Followers</Text>
                    </View>
                    <TouchableOpacity
                        style={[styles.followButton, following && styles.followingButton]}
                        onPress={handleFollowToggle}
                    >
                        <Text style={[styles.followButtonText, following && styles.followingButtonText]}>
                            {following ? 'Following' : 'Follow'}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.moreButton}>
                        <Ionicons name="ellipsis-vertical" size={20} color="#FFF" />
                    </TouchableOpacity>
                </View>

                {/* Stats Row */}
                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{stats.totalRuns}</Text>
                        <Text style={styles.statLabel}>Total runs</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{stats.totalDistance.toFixed(2)}</Text>
                        <Text style={styles.statLabel}>Distance (km)</Text>
                    </View>
                </View>

                {/* Personal Bests */}
                <View style={styles.pbRow}>
                    <View style={styles.pbItem}>
                        <Text style={styles.pbValue}>{stats.pb1km}</Text>
                        <Text style={styles.pbLabel}>1km PB</Text>
                    </View>
                    <View style={styles.pbItem}>
                        <Text style={styles.pbValue}>{stats.pb5km}</Text>
                        <Text style={styles.pbLabel}>5km PB</Text>
                    </View>
                    <View style={styles.pbItem}>
                        <Text style={styles.pbValue}>{stats.pb10km}</Text>
                        <Text style={styles.pbLabel}>10km PB</Text>
                    </View>
                </View>

                {/* Weekly Distance Chart */}
                <View style={styles.chartContainer}>
                    <Text style={styles.chartTitle}>Weekly distance (km)</Text>
                    <View style={styles.chart}>
                        {/* Chart bars */}
                        <View style={styles.chartBars}>
                            {stats.weeklyData.map((value, index) => (
                                <View key={index} style={styles.barContainer}>
                                    <View
                                        style={[
                                            styles.bar,
                                            { height: Math.max(2, (value / 10) * 100) }
                                        ]}
                                    />
                                </View>
                            ))}
                        </View>
                        {/* X-axis line */}
                        <View style={styles.xAxisLine} />
                        {/* Labels */}
                        <View style={styles.chartLabels}>
                            <Text style={styles.chartLabel}>Nov</Text>
                            <Text style={styles.chartLabel}>Dec</Text>
                            <Text style={styles.chartLabel}>Jan</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0D0D0D',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarSection: {
        alignItems: 'center',
        marginTop: 20,
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
    },
    avatarPlaceholder: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    avatarGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 60,
        backgroundColor: '#FF6E6E',
        opacity: 0.6,
    },
    avatarIcon: {
        marginTop: 20,
    },
    levelBadge: {
        position: 'absolute',
        bottom: 0,
        left: '50%',
        marginLeft: -20,
        width: 40,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#333',
        justifyContent: 'center',
        alignItems: 'center',
    },
    levelText: {
        color: '#FFF',
        fontSize: 11,
        fontWeight: '600',
    },
    userName: {
        color: '#FFF',
        fontSize: 24,
        fontWeight: '700',
        textAlign: 'center',
        marginTop: 16,
        marginBottom: 20,
    },
    followRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
        marginBottom: 30,
        gap: 16,
    },
    countItem: {
        alignItems: 'center',
    },
    countNumber: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '700',
    },
    countLabel: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 12,
    },
    followButton: {
        backgroundColor: '#FF6E6E',
        paddingHorizontal: 28,
        paddingVertical: 10,
        borderRadius: 20,
    },
    followingButton: {
        backgroundColor: '#333',
    },
    followButtonText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '600',
    },
    followingButtonText: {
        color: '#999',
    },
    moreButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#333',
        justifyContent: 'center',
        alignItems: 'center',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: 40,
        marginBottom: 24,
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        color: '#FFF',
        fontSize: 32,
        fontWeight: '700',
    },
    statLabel: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 13,
        marginTop: 4,
    },
    pbRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: 20,
        marginBottom: 30,
    },
    pbItem: {
        alignItems: 'center',
    },
    pbValue: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '600',
    },
    pbLabel: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 12,
        marginTop: 4,
    },
    chartContainer: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    chartTitle: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 16,
    },
    chart: {
        height: 160,
        position: 'relative',
    },
    chartBars: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        height: 120,
        paddingHorizontal: 10,
    },
    barContainer: {
        flex: 1,
        alignItems: 'center',
    },
    bar: {
        width: 2,
        backgroundColor: 'rgba(255,255,255,0.3)',
        borderRadius: 1,
    },
    xAxisLine: {
        height: 1,
        backgroundColor: '#FF6E6E',
        marginTop: 8,
    },
    chartLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        marginTop: 8,
    },
    chartLabel: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 12,
    },
});
