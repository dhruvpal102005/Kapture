import { createPost } from '@/services/postsService';
import { useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type PostTab = 'status' | 'poll';

export default function CreatePostScreen() {
    const { user } = useUser();
    const [activeTab, setActiveTab] = useState<PostTab>('status');
    const [content, setContent] = useState('');
    const [posting, setPosting] = useState(false);

    const handlePost = async () => {
        if (!user?.id || !content.trim()) return;

        setPosting(true);
        try {
            const postId = await createPost({
                userId: user.id,
                userName: user.firstName || user.username || 'Anonymous',
                userImage: user.imageUrl,
                content: content.trim(),
                type: activeTab,
            });

            if (postId) {
                router.back();
            }
        } catch (error) {
            console.error('Error posting:', error);
        } finally {
            setPosting(false);
        }
    };

    const userName = user?.firstName || user?.username || 'User';

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#000" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>CREATE POST</Text>
                    <View style={styles.headerSpacer} />
                </View>

                <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                    {/* Tabs */}
                    <View style={styles.tabsContainer}>
                        <TouchableOpacity
                            style={[styles.tab, activeTab === 'status' && styles.activeTab]}
                            onPress={() => setActiveTab('status')}
                        >
                            <Text style={[styles.tabText, activeTab === 'status' && styles.activeTabText]}>
                                Status
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tab, activeTab === 'poll' && styles.activeTab]}
                            onPress={() => setActiveTab('poll')}
                        >
                            <Text style={[styles.tabText, activeTab === 'poll' && styles.activeTabText]}>
                                Poll
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* User Info */}
                    <View style={styles.userRow}>
                        {user?.imageUrl ? (
                            <Image source={{ uri: user.imageUrl }} style={styles.userAvatar} />
                        ) : (
                            <View style={styles.userAvatarPlaceholder}>
                                <View style={styles.avatarGradient} />
                                <Ionicons name="person" size={20} color="#000" style={styles.avatarIcon} />
                            </View>
                        )}
                        <Text style={styles.userName}>{userName}</Text>
                    </View>

                    {/* Text Input */}
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Share your thoughts or ask a question..."
                            placeholderTextColor="#999"
                            multiline
                            value={content}
                            onChangeText={setContent}
                        />
                    </View>

                    {/* Post Button */}
                    <TouchableOpacity
                        style={[styles.postButton, (!content.trim() || posting) && styles.postButtonDisabled]}
                        onPress={handlePost}
                        disabled={!content.trim() || posting}
                    >
                        <Text style={styles.postButtonText}>
                            {posting ? 'Posting...' : 'Post'}
                        </Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    keyboardView: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#F5F5F5',
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        color: '#000',
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 1,
    },
    headerSpacer: {
        width: 40,
    },
    scrollView: {
        flex: 1,
        paddingHorizontal: 16,
    },
    tabsContainer: {
        flexDirection: 'row',
        backgroundColor: '#E8E8E8',
        borderRadius: 12,
        padding: 4,
        marginBottom: 24,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 10,
    },
    activeTab: {
        backgroundColor: '#FFF',
    },
    tabText: {
        color: '#666',
        fontSize: 14,
        fontWeight: '500',
    },
    activeTabText: {
        color: '#000',
        fontWeight: '600',
    },
    userRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    userAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    userAvatarPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFF',
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 20,
        backgroundColor: '#FF6E6E',
        opacity: 0.5,
    },
    avatarIcon: {
        marginTop: 8,
    },
    userName: {
        marginLeft: 12,
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
    },
    inputContainer: {
        marginBottom: 24,
    },
    textInput: {
        fontSize: 16,
        color: '#000',
        minHeight: 80,
        textAlignVertical: 'top',
    },
    lockCard: {
        backgroundColor: '#1A1A1A',
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
    },
    lockIcon: {
        marginBottom: 16,
    },
    lockTitle: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 24,
    },
    progressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
    },
    miniAvatar: {
        width: 36,
        height: 36,
        position: 'relative',
    },
    miniAvatarImage: {
        width: 36,
        height: 36,
        borderRadius: 18,
    },
    miniAvatarPlaceholder: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#FFF',
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
    },
    miniAvatarGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 18,
        backgroundColor: '#FF6E6E',
        opacity: 0.5,
    },
    levelBadge: {
        position: 'absolute',
        bottom: -4,
        left: '50%',
        marginLeft: -12,
        backgroundColor: '#333',
        borderRadius: 8,
        paddingHorizontal: 6,
        paddingVertical: 2,
    },
    levelBadgeText: {
        color: '#FFF',
        fontSize: 8,
        fontWeight: '600',
    },
    progressBarContainer: {
        flex: 1,
        height: 6,
        backgroundColor: '#333',
        borderRadius: 3,
        marginHorizontal: 12,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#FF6E6E',
        borderRadius: 3,
    },
    levelTarget: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
    },
    postButton: {
        backgroundColor: '#FF6E6E',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 24,
    },
    postButtonDisabled: {
        opacity: 0.5,
    },
    postButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
});
