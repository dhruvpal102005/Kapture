import { COUNTRIES } from '@/constants/countries';
import { Club, clubService } from '@/services/clubService';
import { useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Image,
    PanResponder,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MAX_TRANSLATE_Y = -SCREEN_HEIGHT * 0.85;
const MIN_TRANSLATE_Y = -SCREEN_HEIGHT * 0.25;
const MIDDLE_TRANSLATE_Y = -SCREEN_HEIGHT * 0.50;

interface MyClubBottomSheetProps {
    visible: boolean;
    onCreateClub: () => void;
}

export default function MyClubBottomSheet({ visible, onCreateClub }: MyClubBottomSheetProps) {
    const [clubs, setClubs] = useState<Club[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const { user } = useUser();
    const router = useRouter();

    const translateY = useSharedValue(0);
    const startY = useRef(0);

    useEffect(() => {
        if (visible) {
            loadClubs();
            // Animate to middle position when opened
            translateY.value = withSpring(MIDDLE_TRANSLATE_Y, { damping: 50 });
        } else {
            // Animate to closed position
            translateY.value = withSpring(0, { damping: 50 });
        }
    }, [visible]);

    const loadClubs = async () => {
        setLoading(true);
        try {
            const allClubs = await clubService.getAllClubs();
            setClubs(allClubs);
        } catch (error) {
            console.error('Error loading clubs:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredClubs = clubs.filter((club) =>
        club.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: () => {
                startY.current = translateY.value;
            },
            onPanResponderMove: (_, gestureState) => {
                const newY = startY.current + gestureState.dy;
                translateY.value = Math.max(Math.min(newY, 0), MAX_TRANSLATE_Y);
            },
            onPanResponderRelease: (_, gestureState) => {
                const velocity = gestureState.vy;
                const currentY = translateY.value;

                // Snap to nearest position based on velocity and position
                if (velocity > 0.5) {
                    // Swipe down - snap to lower position
                    if (currentY > MIDDLE_TRANSLATE_Y) {
                        translateY.value = withSpring(MIN_TRANSLATE_Y, { damping: 50 });
                    } else {
                        translateY.value = withSpring(MIDDLE_TRANSLATE_Y, { damping: 50 });
                    }
                } else if (velocity < -0.5) {
                    // Swipe up - snap to higher position
                    if (currentY < MIDDLE_TRANSLATE_Y) {
                        translateY.value = withSpring(MAX_TRANSLATE_Y, { damping: 50 });
                    } else {
                        translateY.value = withSpring(MIDDLE_TRANSLATE_Y, { damping: 50 });
                    }
                } else {
                    // Snap to nearest position based on current position
                    if (currentY < MAX_TRANSLATE_Y + (MIDDLE_TRANSLATE_Y - MAX_TRANSLATE_Y) / 2) {
                        translateY.value = withSpring(MAX_TRANSLATE_Y, { damping: 50 });
                    } else if (currentY < MIDDLE_TRANSLATE_Y + (MIN_TRANSLATE_Y - MIDDLE_TRANSLATE_Y) / 2) {
                        translateY.value = withSpring(MIDDLE_TRANSLATE_Y, { damping: 50 });
                    } else {
                        translateY.value = withSpring(MIN_TRANSLATE_Y, { damping: 50 });
                    }
                }
            },
        })
    ).current;

    const rBottomSheetStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: translateY.value }],
        };
    });

    if (!visible) return null;

    return (
        <Animated.View style={[styles.container, rBottomSheetStyle]}>
            <View style={styles.handleContainer} {...panResponder.panHandlers}>
                <View style={styles.handle} />
            </View>

            <View style={styles.header}>
                <Text style={styles.title}>Join a Club</Text>
            </View>

            {/* Search bar */}
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search for a club..."
                    placeholderTextColor="#666"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            {/* Action buttons */}
            <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.createButton} onPress={onCreateClub}>
                    <Ionicons name="add" size={18} color="#FFFFFF" />
                    <Text style={styles.createButtonText}>Create a club</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.filterButton}>
                    <Ionicons name="filter" size={18} color="#666" />
                    <Text style={styles.filterButtonText}>Filter</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.sortButton}>
                    <Ionicons name="swap-vertical" size={18} color="#666" />
                    <Text style={styles.sortButtonText}>Sort by</Text>
                </TouchableOpacity>
            </View>

            {/* Clubs list */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#EF4444" />
                </View>
            ) : (
                <ScrollView style={styles.clubsList} showsVerticalScrollIndicator={false}>
                    {filteredClubs.map((club) => (
                        <ClubCard key={club.id} club={club} />
                    ))}
                    {filteredClubs.length === 0 && (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>No clubs found</Text>
                        </View>
                    )}
                </ScrollView>
            )}
        </Animated.View>
    );
}

function ClubCard({ club }: { club: Club }) {
    const getCountryFlag = (countryCode: string): string => {
        const country = COUNTRIES.find((c) => c.code === countryCode);
        return country?.flag || '🏳️';
    };

    return (
        <View style={styles.clubCard}>
            {club.logoUrl ? (
                <Image source={{ uri: club.logoUrl }} style={styles.clubLogo} />
            ) : (
                <View style={styles.clubLogoPlaceholder}>
                    <Text style={styles.clubLogoText}>{club.name.charAt(0)}</Text>
                </View>
            )}
            <View style={styles.clubInfo}>
                <Text style={styles.clubName}>{club.name}</Text>
                {club.name === 'INTVL Run Club' && (
                    <Text style={styles.officialBadge}>Official Run Club</Text>
                )}
                <Text style={styles.memberCount}>{club.memberCount.toLocaleString()} members</Text>
            </View>
            <View style={styles.countryInfo}>
                <Text style={styles.countryFlag}>{getCountryFlag(club.countryCode)}</Text>
                <Text style={styles.countryName}>{club.country}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: SCREEN_HEIGHT,
        left: 0,
        right: 0,
        height: SCREEN_HEIGHT,
        backgroundColor: '#1A1A1A',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 20,
    },
    handleContainer: {
        alignItems: 'center',
        paddingVertical: 12,
    },
    handle: {
        width: 40,
        height: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        borderRadius: 2,
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2A2A2A',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginHorizontal: 20,
        marginBottom: 16,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        color: '#FFFFFF',
        fontSize: 14,
    },
    actionButtons: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        marginBottom: 16,
        gap: 8,
    },
    createButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#EF4444',
        borderRadius: 8,
        paddingVertical: 10,
        gap: 6,
    },
    createButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#2A2A2A',
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 12,
        gap: 6,
    },
    filterButtonText: {
        color: '#666',
        fontSize: 14,
        fontWeight: '500',
    },
    sortButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#2A2A2A',
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 12,
        gap: 6,
    },
    sortButtonText: {
        color: '#666',
        fontSize: 14,
        fontWeight: '500',
    },
    clubsList: {
        paddingHorizontal: 20,
    },
    loadingContainer: {
        paddingVertical: 40,
        alignItems: 'center',
    },
    emptyContainer: {
        paddingVertical: 40,
        alignItems: 'center',
    },
    emptyText: {
        color: '#666',
        fontSize: 14,
    },
    clubCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2A2A2A',
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
    },
    clubLogo: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#333',
    },
    clubLogoPlaceholder: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#EF4444',
        justifyContent: 'center',
        alignItems: 'center',
    },
    clubLogoText: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: '700',
    },
    clubInfo: {
        flex: 1,
        marginLeft: 12,
    },
    clubName: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    officialBadge: {
        color: '#EF4444',
        fontSize: 12,
        fontWeight: '500',
        marginBottom: 4,
    },
    memberCount: {
        color: '#999',
        fontSize: 12,
    },
    countryInfo: {
        alignItems: 'flex-end',
    },
    countryFlag: {
        fontSize: 24,
        marginBottom: 4,
    },
    countryName: {
        color: '#999',
        fontSize: 12,
    },
});
