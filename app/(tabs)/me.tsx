import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    StatusBar,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { useUser } from '@clerk/clerk-expo';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';

export default function MeScreen() {
    const { user } = useUser();

    // Mock Data for UI
    const challenges = [
        {
            id: 1,
            title: 'Add a profile picture',
            xp: 10,
            icon: 'person-circle-outline' as const,
        },
        {
            id: 2,
            title: 'Enter referral code',
            xp: 30,
            icon: 'gift-outline' as const,
        },
        {
            id: 3,
            title: 'Add geofence privacy',
            xp: 10,
            icon: 'earth-outline' as const,
        },
    ];

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <SafeAreaView style={styles.safeArea}>
                {/* Header */}
                <View style={styles.headerRow}>
                    <TouchableOpacity style={styles.iconButton}>
                        <Ionicons name="notifications-outline" size={24} color="#FFFFFF" />
                    </TouchableOpacity>

                    <Text style={styles.headerTitle}>ME</Text>

                    <TouchableOpacity style={styles.avatarSmall}>
                        <Image
                            source={user?.imageUrl} // Fallback handled by component if null
                            style={styles.avatarImageSmall}
                            contentFit="cover"
                        />
                        {!user?.imageUrl && <Ionicons name="person" size={20} color="#000" />}
                    </TouchableOpacity>
                </View>

                <ScrollView
                    style={styles.content}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {/* Profile Section */}
                    <View style={styles.profileSection}>
                        <View style={styles.largeAvatarContainer}>
                            {user?.imageUrl ? (
                                <Image
                                    source={{ uri: user.imageUrl }}
                                    style={styles.largeAvatar}
                                    contentFit="cover"
                                />
                            ) : (
                                <View style={[styles.largeAvatar, styles.avatarFallback]}>
                                    <Text style={styles.avatarText}>{user?.firstName?.[0] || 'U'}</Text>
                                </View>
                            )}
                            <View style={styles.levelBadge}>
                                <Text style={styles.levelBadgeText}>LO</Text>
                            </View>
                        </View>

                        {/* Progress Info */}
                        <View style={styles.progressInfoRow}>
                            <Text style={styles.xpText}>10XP to next level</Text>
                            <Text style={styles.levelText}>Level 1</Text>
                        </View>
                        {/* Progress Bar */}
                        <View style={styles.progressBarBg}>
                            <View style={[styles.progressBarFill, { width: '10%' }]} />
                        </View>

                        {/* Next Unlock Card */}
                        <TouchableOpacity style={styles.nextUnlockCard}>
                            <View>
                                <Text style={styles.nextUnlockTitle}>Next unlock: Level 2</Text>
                                <Text style={styles.nextUnlockSubtitle}>Community Feed</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#000" />
                        </TouchableOpacity>
                    </View>

                    {/* XP Challenges */}
                    <View style={styles.sectionContainer}>
                        <View style={styles.sectionHeader}>
                            <View style={styles.iconBadge}>
                                <Ionicons name="ribbon-outline" size={20} color="#000" />
                            </View>
                            <View>
                                <Text style={styles.sectionTitle}>XP Challenges</Text>
                                <Text style={styles.sectionSubtitle}>earn XP to level up</Text>
                            </View>
                        </View>

                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.challengesScroll}>
                            {challenges.map((challenge) => (
                                <TouchableOpacity key={challenge.id} style={styles.challengeCard}>
                                    <Ionicons name={challenge.icon} size={32} color="#000" style={{ marginBottom: 12 }} />
                                    <Text style={styles.challengeCardTitle}>{challenge.title}</Text>
                                    <View style={styles.xpPill}>
                                        <Text style={styles.xpPillText}>+ {challenge.xp} XP</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    {/* Competitions */}
                    <View style={styles.sectionContainer}>
                        <View style={styles.sectionHeader}>
                            <View style={styles.iconBadge}>
                                <Ionicons name="trophy-outline" size={20} color="#000" />
                            </View>
                            <View>
                                <Text style={styles.sectionTitle}>Competitions</Text>
                                <Text style={styles.sectionSubtitle}>Unlocks at level 7</Text>
                            </View>
                        </View>

                        <View style={styles.competitionCard}>
                            <Text style={styles.compTitle}>Terra Comp 26.1 | $1,277 AUD in Prizes</Text>
                            <Text style={styles.compSubtitle}>Starts in: 2d 12h 44m 11s</Text>

                            <View style={styles.brandRow}>
                                <View style={styles.brandBox}><Text style={styles.brandText}>GARMIN.</Text></View>
                                <View style={styles.brandBox}><Text style={styles.brandText}>GARMIN.</Text></View>
                                <View style={styles.brandBox}><Text style={styles.brandText}>WHOOP</Text></View>
                            </View>

                            <Text style={styles.compDesc}>
                                Start 2026 with some wearables to track your runs, this competition includes Garmin watches and Whoop, available to enter from anywhere in the world.
                            </Text>

                            <TouchableOpacity style={styles.viewCompButton}>
                                <Text style={styles.viewCompText}>View competition</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Entry Vault */}
                    <View style={styles.sectionContainer}>
                        <View style={styles.sectionHeader}>
                            <View style={styles.iconBadge}>
                                <Ionicons name="ticket-outline" size={20} color="#000" />
                            </View>
                            <View>
                                <Text style={styles.sectionTitle}>Entry Vault</Text>
                                <Text style={styles.sectionSubtitle}>Unlocks at level 8</Text>
                            </View>
                        </View>

                        <View style={styles.vaultCard}>
                            <View style={styles.vaultStatsRow}>
                                <View style={styles.vaultStatItem}>
                                    <Text style={styles.vaultStatValue}>0</Text>
                                    <Text style={styles.vaultStatLabel}>Entries in vault</Text>
                                </View>
                                <View style={styles.vaultStatItem}>
                                    <Text style={styles.vaultStatValue}>0</Text>
                                    <Text style={styles.vaultStatLabel}>Active Entries</Text>
                                </View>
                                <View style={styles.vaultStatItem}>
                                    <Text style={styles.vaultStatValue}>0</Text>
                                    <Text style={styles.vaultStatLabel}>Used Entries</Text>
                                </View>
                            </View>

                            <Text style={styles.vaultMilestoneLabel}>Vault milestones</Text>
                            {/* Simple visual for milestones timeline */}
                            <View style={styles.milestoneTimeline}>
                                <View style={styles.timelineLine} />
                                <View style={styles.milestoneItem}>
                                    <View style={[styles.milestoneDot, { backgroundColor: '#FF8888' }]} />
                                    <Text style={styles.milestoneText}>Level 0</Text>
                                </View>
                                <View style={styles.milestoneItem}>
                                    <Ionicons name="gift-outline" size={24} color="#AAA" />
                                    <Text style={styles.milestoneText}>Level 10</Text>
                                </View>
                                <View style={styles.milestoneItem}>
                                    <Ionicons name="gift-outline" size={24} color="#AAA" />
                                    <Text style={styles.milestoneText}>Level 12</Text>
                                </View>
                            </View>

                            <TouchableOpacity style={styles.openVaultButton} disabled>
                                <Text style={styles.openVaultText}>Open vault</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Local Battles (Locked) */}
                    <View style={styles.sectionContainer}>
                        <View style={styles.sectionHeader}>
                            <View style={styles.iconBadge}>
                                <Ionicons name="close" size={20} color="#000" />
                            </View>
                            <View>
                                <Text style={styles.sectionTitle}>Local battles</Text>
                                <Text style={styles.sectionSubtitle}>Unlocks at level 9</Text>
                            </View>
                        </View>

                        <View style={styles.emptyStateCard}>
                            <Text style={styles.emptyStateTitle}>No local battles yet</Text>
                            <Text style={styles.emptyStateDesc}>Once you steal someone's territory or they steal yours, it will show up here</Text>
                        </View>
                    </View>

                    {/* Insights (Locked) */}
                    <View style={styles.sectionContainer}>
                        <View style={styles.sectionHeader}>
                            <View style={styles.iconBadge}>
                                <Ionicons name="pie-chart-outline" size={20} color="#000" />
                            </View>
                            <View>
                                <Text style={styles.sectionTitle}>Insights</Text>
                                <Text style={styles.sectionSubtitle}>Unlocks at level 18</Text>
                            </View>
                            <View style={styles.proBadge}><Text style={styles.proText}>PRO</Text></View>
                        </View>

                        <View style={styles.insightCard}>
                            <View style={styles.insightRow}>
                                <Ionicons name="pie-chart-outline" size={20} color="#AAA" />
                                <Text style={styles.insightPlaceholder}>Insights</Text>
                            </View>
                            <View style={styles.arrowBox}>
                                <Ionicons name="arrow-forward" size={20} color="#AAA" />
                            </View>
                        </View>
                    </View>

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
        paddingTop: 40,
    },
    scrollContent: {
        paddingBottom: 80,
    },
    content: {
        flex: 1,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    headerTitle: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: '900',
        letterSpacing: 1,
    },
    iconButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarSmall: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    avatarImageSmall: {
        width: '100%',
        height: '100%',
    },
    // Profile
    profileSection: {
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 32,
    },
    largeAvatarContainer: {
        position: 'relative',
        marginBottom: 16,
    },
    largeAvatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    avatarFallback: {
        backgroundColor: '#333',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: '#FFF',
        fontSize: 32,
        fontWeight: 'bold',
    },
    levelBadge: {
        position: 'absolute',
        bottom: -5,
        alignSelf: 'center',
        backgroundColor: '#000',
        paddingHorizontal: 6,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#FFF',
    },
    levelBadgeText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: 'bold',
    },
    progressInfoRow: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    xpText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '700',
    },
    levelText: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 14,
        fontWeight: '600',
    },
    progressBarBg: {
        width: '100%',
        height: 8,
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 4,
        marginBottom: 16,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#FF5555', // Red/Pink accent
        borderRadius: 4,
    },
    nextUnlockCard: {
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    nextUnlockTitle: {
        color: '#000',
        fontSize: 16,
        fontWeight: '700',
    },
    nextUnlockSubtitle: {
        color: 'rgba(0,0,0,0.6)',
        fontSize: 14,
        marginTop: 2,
    },

    // Sections
    sectionContainer: {
        marginBottom: 32,
        paddingHorizontal: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 16,
    },
    iconBadge: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    sectionTitle: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '700',
    },
    sectionSubtitle: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 14,
    },

    // XP Challenges
    challengesScroll: {
        gap: 12,
        paddingRight: 20,
    },
    challengeCard: {
        width: 140,
        height: 180,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 16,
        justifyContent: 'space-between',
    },
    challengeCardTitle: {
        color: '#000',
        fontSize: 16,
        fontWeight: '700',
    },
    xpPill: {
        backgroundColor: '#FFE5E5',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        alignSelf: 'flex-start',
    },
    xpPillText: {
        color: '#FF5555',
        fontSize: 12,
        fontWeight: '700',
    },

    // Competitions
    competitionCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 16,
        overflow: 'hidden',
    },
    compTitle: {
        color: '#000',
        fontSize: 18,
        fontWeight: '800',
        marginBottom: 4,
    },
    compSubtitle: {
        color: '#555',
        fontSize: 14,
        marginBottom: 16,
    },
    brandRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 16,
    },
    brandBox: {
        width: 70,
        height: 70,
        backgroundColor: '#111',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    brandText: {
        color: '#FFF',
        fontWeight: '700',
        fontSize: 10,
    },
    compDesc: {
        color: '#333',
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 16,
    },
    viewCompButton: {
        backgroundColor: '#111',
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center',
    },
    viewCompText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '700',
    },

    // Entry Vault
    vaultCard: {
        backgroundColor: '#F5F5F5',
        borderRadius: 20,
        padding: 16,
    },
    vaultStatsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    vaultStatItem: {
        alignItems: 'center',
        flex: 1,
    },
    vaultStatValue: {
        color: '#AAA',
        fontSize: 24,
        fontWeight: '700',
    },
    vaultStatLabel: {
        color: '#AAA',
        fontSize: 12,
        textAlign: 'center',
        marginTop: 4,
    },
    vaultMilestoneLabel: {
        color: '#AAA',
        fontSize: 14,
        marginBottom: 12,
    },
    milestoneTimeline: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
        paddingHorizontal: 10,
        position: 'relative',
    },
    timelineLine: {
        position: 'absolute',
        top: 12,
        left: 20,
        right: 20,
        height: 4,
        backgroundColor: 'rgba(255,0,0,0.1)',
        zIndex: 0,
    },
    milestoneItem: {
        alignItems: 'center',
        zIndex: 1,
    },
    milestoneDot: {
        width: 24,
        height: 24,
        borderRadius: 12,
        marginBottom: 8,
    },
    milestoneText: {
        color: '#AAA',
        fontSize: 12,
    },
    openVaultButton: {
        backgroundColor: '#BBB',
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center',
    },
    openVaultText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
    },

    // Locked Sections
    emptyStateCard: {
        backgroundColor: '#F5F5F5',
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
    },
    emptyStateTitle: {
        color: '#555',
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 8,
    },
    emptyStateDesc: {
        color: '#AAA',
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
    },
    proBadge: {
        backgroundColor: '#C5A365', // Gold-ish
        borderRadius: 4,
        paddingHorizontal: 6,
        paddingVertical: 2,
        marginLeft: 'auto',
    },
    proText: {
        color: '#000',
        fontSize: 12,
        fontWeight: '900',
    },
    insightCard: {
        backgroundColor: '#F5F5F5',
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        overflow: 'hidden',
    },
    insightRow: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 12,
    },
    insightPlaceholder: {
        color: '#AAA',
        fontSize: 16,
        fontWeight: '600',
    },
    arrowBox: {
        backgroundColor: '#DDD',
        width: 50,
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
