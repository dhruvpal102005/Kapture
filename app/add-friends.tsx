import {
    followUser,
    getSuggestedUsers,
    searchUsers,
    unfollowUser,
    UserProfile,
} from '@/services/friendsService';
import { useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type UserWithFollow = UserProfile & { isFollowing: boolean };

export default function AddFriendsScreen() {
    const { user } = useUser();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<UserWithFollow[]>([]);
    const [suggestedUsers, setSuggestedUsers] = useState<UserWithFollow[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchMode, setSearchMode] = useState(false);

    // Load suggested users on mount
    useEffect(() => {
        if (user?.id) {
            loadSuggestedUsers();
        }
    }, [user?.id]);

    const loadSuggestedUsers = async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const users = await getSuggestedUsers(user.id, 10);
            setSuggestedUsers(users);
        } catch (error) {
            console.error('Error loading suggested users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        if (!user?.id || searchQuery.length < 2) return;

        setLoading(true);
        setSearchMode(true);
        try {
            const results = await searchUsers(searchQuery, user.id, 20);
            setSearchResults(results);
        } catch (error) {
            console.error('Error searching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFollow = async (targetUserId: string, index: number, isSearch: boolean) => {
        if (!user?.id) return;

        const list = isSearch ? searchResults : suggestedUsers;
        const setList = isSearch ? setSearchResults : setSuggestedUsers;
        const targetUser = list[index];

        if (targetUser.isFollowing) {
            // Unfollow
            const success = await unfollowUser(user.id, targetUserId);
            if (success) {
                const newList = [...list];
                newList[index] = { ...targetUser, isFollowing: false };
                setList(newList);
            }
        } else {
            // Follow
            const success = await followUser(user.id, targetUserId);
            if (success) {
                const newList = [...list];
                newList[index] = { ...targetUser, isFollowing: true };
                setList(newList);
            }
        }
    };

    const clearSearch = () => {
        setSearchQuery('');
        setSearchResults([]);
        setSearchMode(false);
    };

    const renderUserCard = (item: UserWithFollow, index: number, isSearch: boolean) => (
        <View style={styles.userCard}>
            <View style={styles.avatarContainer}>
                {item.imageUrl ? (
                    <Image source={{ uri: item.imageUrl }} style={styles.avatar} />
                ) : (
                    <View style={styles.avatarPlaceholder}>
                        <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
                    </View>
                )}
            </View>
            <View style={styles.userInfo}>
                <Text style={styles.userName}>{item.name}</Text>
                <Text style={styles.userStatus}>
                    {item.isFollowing ? 'Following' : 'Not following'}
                </Text>
            </View>
            <TouchableOpacity
                style={[styles.followButton, item.isFollowing && styles.followingButton]}
                onPress={() => handleFollow(item.id, index, isSearch)}
            >
                <Ionicons
                    name={item.isFollowing ? 'checkmark' : 'person-add-outline'}
                    size={20}
                    color={item.isFollowing ? '#666' : '#FF6E6E'}
                />
            </TouchableOpacity>
        </View>
    );

    const renderSuggestedCard = (item: UserWithFollow, index: number) => (
        <View style={styles.suggestedCard}>
            <View style={styles.suggestedAvatarContainer}>
                {item.imageUrl ? (
                    <Image source={{ uri: item.imageUrl }} style={styles.suggestedAvatar} />
                ) : (
                    <View style={styles.suggestedAvatarPlaceholder}>
                        <Text style={styles.suggestedAvatarText}>
                            {item.name.charAt(0).toUpperCase()}
                        </Text>
                    </View>
                )}
            </View>
            <Text style={styles.suggestedName}>{item.name}</Text>
            <Text style={styles.suggestedSubtitle}>Kapture User</Text>
            <TouchableOpacity
                style={[styles.suggestedFollowBtn, item.isFollowing && styles.suggestedFollowingBtn]}
                onPress={() => handleFollow(item.id, index, false)}
            >
                <Text style={[styles.suggestedFollowText, item.isFollowing && styles.suggestedFollowingText]}>
                    {item.isFollowing ? 'Following' : 'Follow'}
                </Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>
                    {searchMode ? 'SEARCH FOR FRIENDS' : 'ADD FRIENDS'}
                </Text>
                <View style={styles.headerSpacer} />
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                    <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search by name..."
                        placeholderTextColor="#999"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        onSubmitEditing={handleSearch}
                        returnKeyType="search"
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={clearSearch}>
                            <Ionicons name="close-circle" size={20} color="#999" />
                        </TouchableOpacity>
                    )}
                </View>
                <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
                    <Ionicons name="search" size={20} color="#FFF" />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#FF6E6E" />
                </View>
            ) : searchMode && searchResults.length > 0 ? (
                <View style={styles.resultsContainer}>
                    <Text style={styles.sectionTitle}>results</Text>
                    <FlatList
                        data={searchResults}
                        renderItem={({ item, index }) => renderUserCard(item, index, true)}
                        keyExtractor={(item) => item.id}
                        showsVerticalScrollIndicator={false}
                    />
                </View>
            ) : searchMode && searchQuery.length >= 2 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="search-outline" size={48} color="#666" />
                    <Text style={styles.emptyText}>No users found</Text>
                </View>
            ) : (
                <View style={styles.suggestedContainer}>
                    <Text style={styles.sectionTitle}>Not sure who to follow?</Text>
                    <Text style={styles.sectionSubtitle}>Follow some Kapture users</Text>

                    {suggestedUsers.length > 0 ? (
                        <FlatList
                            data={suggestedUsers}
                            renderItem={({ item, index }) => renderSuggestedCard(item, index)}
                            keyExtractor={(item) => item.id}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.suggestedList}
                        />
                    ) : (
                        <Text style={styles.noUsersText}>No suggested users yet</Text>
                    )}
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0D0D0D',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 1,
    },
    headerSpacer: {
        width: 40,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginBottom: 20,
        gap: 8,
    },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 48,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#000',
    },
    searchButton: {
        width: 48,
        height: 48,
        backgroundColor: '#333',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    resultsContainer: {
        flex: 1,
        paddingHorizontal: 16,
    },
    sectionTitle: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 12,
    },
    sectionSubtitle: {
        color: '#999',
        fontSize: 12,
        marginBottom: 16,
    },
    userCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 12,
        marginBottom: 8,
    },
    avatarContainer: {
        marginRight: 12,
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
    },
    avatarPlaceholder: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#FF6E6E',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '600',
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        color: '#000',
        fontSize: 16,
        fontWeight: '600',
    },
    userStatus: {
        color: '#999',
        fontSize: 12,
        marginTop: 2,
    },
    followButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        borderWidth: 2,
        borderColor: '#FF6E6E',
        justifyContent: 'center',
        alignItems: 'center',
    },
    followingButton: {
        borderColor: '#666',
        backgroundColor: '#F0F0F0',
    },
    suggestedContainer: {
        paddingHorizontal: 16,
    },
    suggestedList: {
        paddingVertical: 8,
    },
    suggestedCard: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        width: 160,
        marginRight: 12,
    },
    suggestedAvatarContainer: {
        marginBottom: 12,
    },
    suggestedAvatar: {
        width: 64,
        height: 64,
        borderRadius: 32,
    },
    suggestedAvatarPlaceholder: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#FF6E6E',
        justifyContent: 'center',
        alignItems: 'center',
    },
    suggestedAvatarText: {
        color: '#FFF',
        fontSize: 24,
        fontWeight: '600',
    },
    suggestedName: {
        color: '#000',
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
    },
    suggestedSubtitle: {
        color: '#999',
        fontSize: 11,
        marginTop: 2,
        marginBottom: 12,
    },
    suggestedFollowBtn: {
        backgroundColor: '#FF6E6E',
        borderRadius: 8,
        paddingHorizontal: 24,
        paddingVertical: 10,
    },
    suggestedFollowingBtn: {
        backgroundColor: '#E0E0E0',
    },
    suggestedFollowText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '600',
    },
    suggestedFollowingText: {
        color: '#666',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        color: '#999',
        fontSize: 16,
        marginTop: 12,
    },
    noUsersText: {
        color: '#666',
        fontSize: 14,
        textAlign: 'center',
        marginTop: 20,
    },
});
