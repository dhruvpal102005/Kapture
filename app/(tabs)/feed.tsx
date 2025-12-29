import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

type FeedTab = 'explore' | 'groups' | 'following';

export default function FeedScreen() {
    const [activeTab, setActiveTab] = useState<FeedTab>('explore');

    const renderTabContent = () => {
        if (activeTab === 'following') {
            return (
                <View style={styles.followingContainer}>
                    <TouchableOpacity style={styles.addFriendsButton}>
                        <Text style={styles.addFriendsText}>Add friends</Text>
                    </TouchableOpacity>

                    <View style={styles.emptyCard}>
                        <Ionicons
                            name="people-outline"
                            size={40}
                            color="rgba(255, 255, 255, 0.4)"
                        />
                        <Text style={styles.emptyTitle}>Share your thoughts or ask a question…</Text>
                    </View>
                </View>
            );
        }

        if (activeTab === 'groups') {
            return (
                <View style={styles.groupsContainer}>
                    <Text style={styles.groupsSubtitle}>
                        Enter a group code or join an existing group below!
                    </Text>

                    <View style={styles.groupCodeRow}>
                        {Array.from({ length: 6 }).map((_, index) => (
                            <View key={index} style={styles.groupCodeBox} />
                        ))}
                    </View>

                    <Text style={styles.suggestedLabel}>Suggested groups</Text>

                    <View style={styles.groupCard}>
                        <View style={styles.groupImagePlaceholder} />
                        <View style={styles.groupInfo}>
                            <Text style={styles.groupName}>Kapture Runners</Text>
                            <TouchableOpacity>
                                <Text style={styles.joinGroupText}>JOIN GROUP</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.viewAllGroupsButton}>
                        <Text style={styles.viewAllGroupsText}>View all groups</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        // Explore tab
        return (
            <View style={styles.exploreContainer}>
                <TouchableOpacity style={styles.leaderboardButton}>
                    <Ionicons name="trophy-outline" size={18} color="#FFFFFF" />
                    <Text style={styles.leaderboardText}>Country territory leaderboards</Text>
                    <Ionicons name="chevron-forward" size={18} color="#FFFFFF" />
                </TouchableOpacity>

                <View style={styles.pinnedPostCard}>
                    <View style={styles.pinnedHeader}>
                        <View style={styles.brandAvatar} />
                        <View>
                            <Text style={styles.brandName}>Kapture</Text>
                            <Text style={styles.pinnedLabel}>Pinned post</Text>
                        </View>
                    </View>

                    <View style={styles.progressCard}>
                        <View style={styles.progressBarBackground}>
                            <View style={styles.progressBarFill} />
                        </View>
                        <View style={styles.levelRow}>
                            <Text style={styles.progressLabel}>257XP to next level</Text>
                            <Text style={styles.levelText}>Level 135</Text>
                        </View>

                        <View style={styles.nextUnlockCard}>
                            <Text style={styles.nextUnlockTitle}>Next unlock: Level 150</Text>
                            <Text style={styles.nextUnlockSubtitle}>Diamond skin</Text>
                        </View>
                    </View>

                    <Text style={styles.challengeTitle}>🎉 New Year's Day Challenge 🎉</Text>
                    <Text style={styles.challengeBody}>
                        To kick off 2026, we're giving you a reason to get moving. Run with Kapture on
                        New Year's Day, and you'll unlock a limited-edition NYD Skin for your
                        profile, only available for this one day.
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <SafeAreaView style={styles.safeArea}>
                {/* Top header with spacing from nav bar */}
                <View style={styles.headerRow}>
                    <TouchableOpacity style={styles.iconButton}>
                        <Ionicons name="notifications-outline" size={22} color="#FFFFFF" />
                    </TouchableOpacity>

                    <Text style={styles.headerTitle}>FEED</Text>

                    <TouchableOpacity style={styles.avatar}>
                        <Ionicons name="person-outline" size={20} color="#0D0D0D" />
                    </TouchableOpacity>
                </View>

                {/* Tabs row */}
                <View style={styles.tabsRow}>
                    {(['explore', 'groups', 'following'] as FeedTab[]).map((tab) => (
                        <TouchableOpacity
                            key={tab}
                            style={styles.tabButton}
                            onPress={() => setActiveTab(tab)}
                        >
                            <Text
                                style={[
                                    styles.tabLabel,
                                    activeTab === tab && styles.tabLabelActive,
                                ]}
                            >
                                {tab === 'explore'
                                    ? 'Explore'
                                    : tab === 'groups'
                                      ? 'Groups'
                                      : 'Following'}
                            </Text>
                            {activeTab === tab && <View style={styles.tabUnderline} />}
                        </TouchableOpacity>
                    ))}
                </View>

                <ScrollView
                    style={styles.scroll}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {renderTabContent()}
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0D0D0D',
    },
    safeArea: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 36, // extra space from top/notification bar
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    headerTitle: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '700',
        letterSpacing: 1.5,
    },
    iconButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    tabsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    tabButton: {
        flex: 1,
        alignItems: 'center',
    },
    tabLabel: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 4,
    },
    tabLabelActive: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
    tabUnderline: {
        height: 2,
        width: '60%',
        backgroundColor: '#FFFFFF',
        borderRadius: 999,
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    // Following tab
    followingContainer: {
        marginTop: 16,
    },
    addFriendsButton: {
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        paddingVertical: 14,
        alignItems: 'center',
        marginBottom: 16,
    },
    addFriendsText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    emptyCard: {
        backgroundColor: '#151515',
        borderRadius: 16,
        paddingVertical: 24,
        alignItems: 'center',
    },
    emptyTitle: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 14,
        textAlign: 'center',
        marginTop: 12,
    },
    // Groups tab
    groupsContainer: {
        marginTop: 24,
    },
    groupsSubtitle: {
        color: '#FFFFFF',
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 20,
    },
    groupCodeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 28,
    },
    groupCodeBox: {
        width: 42,
        height: 56,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.1)',
        backgroundColor: '#FFFFFF',
    },
    suggestedLabel: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 12,
    },
    groupCard: {
        backgroundColor: '#151515',
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 16,
    },
    groupImagePlaceholder: {
        height: 80,
        backgroundColor: '#333333',
    },
    groupInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    groupName: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    joinGroupText: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '700',
        textDecorationLine: 'underline',
    },
    viewAllGroupsButton: {
        borderRadius: 12,
        backgroundColor: '#151515',
        paddingVertical: 14,
        alignItems: 'center',
    },
    viewAllGroupsText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '600',
    },
    // Explore tab
    exploreContainer: {
        marginTop: 16,
    },
    leaderboardButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#151515',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginBottom: 16,
    },
    leaderboardText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '500',
        flex: 1,
        marginLeft: 8,
    },
    pinnedPostCard: {
        backgroundColor: '#151515',
        borderRadius: 18,
        padding: 16,
    },
    pinnedHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 12,
    },
    brandAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#FF6E6E',
    },
    brandName: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '700',
    },
    pinnedLabel: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 12,
    },
    progressCard: {
        backgroundColor: '#F5F5F5',
        borderRadius: 14,
        padding: 14,
        marginBottom: 16,
    },
    progressBarBackground: {
        height: 10,
        borderRadius: 999,
        backgroundColor: '#E0E0E0',
        overflow: 'hidden',
        marginBottom: 8,
    },
    progressBarFill: {
        width: '70%',
        height: '100%',
        backgroundColor: '#FF6E6E',
    },
    levelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    progressLabel: {
        fontSize: 11,
        color: '#555555',
        fontWeight: '500',
    },
    levelText: {
        fontSize: 11,
        color: '#555555',
        fontWeight: '600',
    },
    nextUnlockCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        paddingVertical: 8,
        paddingHorizontal: 10,
    },
    nextUnlockTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: '#111111',
    },
    nextUnlockSubtitle: {
        fontSize: 11,
        color: '#555555',
        marginTop: 2,
    },
    challengeTitle: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 8,
    },
    challengeBody: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 14,
        lineHeight: 20,
    },
});
