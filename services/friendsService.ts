// Friends Service - Follow/Unfollow and User Search
import { db } from '@/config/firebase';
import {
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    increment,
    limit,
    query,
    serverTimestamp,
    setDoc,
    updateDoc,
    where
} from 'firebase/firestore';

export interface UserProfile {
    id: string;
    name: string;
    email?: string;
    imageUrl?: string;
    followingCount: number;
    followersCount: number;
}

export interface FollowRelation {
    followerId: string;
    followingId: string;
    createdAt: any;
}

/**
 * Follow a user
 * Creates a document in the 'follows' collection and updates counts
 */
export async function followUser(currentUserId: string, targetUserId: string): Promise<boolean> {
    try {
        if (!currentUserId || !targetUserId || currentUserId === targetUserId) {
            return false;
        }

        // Check if already following
        const followDocId = `${currentUserId}_${targetUserId}`;
        const followRef = doc(db, 'follows', followDocId);
        const existingFollow = await getDoc(followRef);

        if (existingFollow.exists()) {
            return true; // Already following
        }

        // Create follow relationship
        await setDoc(followRef, {
            followerId: currentUserId,
            followingId: targetUserId,
            createdAt: serverTimestamp(),
        });

        // Update following count for current user
        const currentUserRef = doc(db, 'users', currentUserId);
        await updateDoc(currentUserRef, {
            followingCount: increment(1),
        }).catch(() => {
            // If field doesn't exist, set it
            setDoc(currentUserRef, { followingCount: 1 }, { merge: true });
        });

        // Update followers count for target user
        const targetUserRef = doc(db, 'users', targetUserId);
        await updateDoc(targetUserRef, {
            followersCount: increment(1),
        }).catch(() => {
            setDoc(targetUserRef, { followersCount: 1 }, { merge: true });
        });

        console.log(`User ${currentUserId} followed ${targetUserId}`);
        return true;
    } catch (error) {
        console.error('Error following user:', error);
        return false;
    }
}

/**
 * Unfollow a user
 */
export async function unfollowUser(currentUserId: string, targetUserId: string): Promise<boolean> {
    try {
        if (!currentUserId || !targetUserId) {
            return false;
        }

        const followDocId = `${currentUserId}_${targetUserId}`;
        const followRef = doc(db, 'follows', followDocId);
        const existingFollow = await getDoc(followRef);

        if (!existingFollow.exists()) {
            return true; // Not following anyway
        }

        // Delete follow relationship
        await deleteDoc(followRef);

        // Decrement following count for current user
        const currentUserRef = doc(db, 'users', currentUserId);
        await updateDoc(currentUserRef, {
            followingCount: increment(-1),
        }).catch(() => { });

        // Decrement followers count for target user
        const targetUserRef = doc(db, 'users', targetUserId);
        await updateDoc(targetUserRef, {
            followersCount: increment(-1),
        }).catch(() => { });

        console.log(`User ${currentUserId} unfollowed ${targetUserId}`);
        return true;
    } catch (error) {
        console.error('Error unfollowing user:', error);
        return false;
    }
}

/**
 * Check if current user is following target user
 */
export async function isFollowing(currentUserId: string, targetUserId: string): Promise<boolean> {
    try {
        if (!currentUserId || !targetUserId) {
            return false;
        }

        const followDocId = `${currentUserId}_${targetUserId}`;
        const followRef = doc(db, 'follows', followDocId);
        const followDoc = await getDoc(followRef);

        return followDoc.exists();
    } catch (error) {
        console.error('Error checking follow status:', error);
        return false;
    }
}

/**
 * Get user's following and followers counts
 */
export async function getUserCounts(userId: string): Promise<{ following: number; followers: number }> {
    try {
        if (!userId) {
            return { following: 0, followers: 0 };
        }

        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
            const data = userDoc.data();
            return {
                following: data.followingCount || 0,
                followers: data.followersCount || 0,
            };
        }

        return { following: 0, followers: 0 };
    } catch (error) {
        console.error('Error getting user counts:', error);
        return { following: 0, followers: 0 };
    }
}

/**
 * Search for users by name
 * Uses a simple prefix search (name starts with query)
 */
export async function searchUsers(
    searchQuery: string,
    currentUserId: string,
    limitCount: number = 20
): Promise<(UserProfile & { isFollowing: boolean })[]> {
    try {
        if (!searchQuery || searchQuery.length < 2) {
            return [];
        }

        const usersRef = collection(db, 'users');

        // Firebase doesn't support full-text search, so we use a range query
        // This finds names that start with the search query
        const searchLower = searchQuery.toLowerCase();
        const searchUpper = searchLower + '\uf8ff';

        const q = query(
            usersRef,
            where('nameLower', '>=', searchLower),
            where('nameLower', '<=', searchUpper),
            limit(limitCount)
        );

        const snapshot = await getDocs(q);
        const users: (UserProfile & { isFollowing: boolean })[] = [];

        for (const docSnapshot of snapshot.docs) {
            const data = docSnapshot.data();
            const userId = docSnapshot.id;

            // Don't show current user in search results
            if (userId === currentUserId) continue;

            // Check if following this user
            const following = await isFollowing(currentUserId, userId);

            users.push({
                id: userId,
                name: data.name || data.firstName || 'Anonymous',
                email: data.email,
                imageUrl: data.imageUrl,
                followingCount: data.followingCount || 0,
                followersCount: data.followersCount || 0,
                isFollowing: following,
            });
        }

        return users;
    } catch (error) {
        console.error('Error searching users:', error);

        // Fallback: search by name field directly
        try {
            const usersRef = collection(db, 'users');
            const snapshot = await getDocs(usersRef);
            const users: (UserProfile & { isFollowing: boolean })[] = [];

            for (const docSnapshot of snapshot.docs) {
                const data = docSnapshot.data();
                const userId = docSnapshot.id;
                const name = (data.name || data.firstName || '').toLowerCase();

                if (name.includes(searchQuery.toLowerCase()) && userId !== currentUserId) {
                    const following = await isFollowing(currentUserId, userId);
                    users.push({
                        id: userId,
                        name: data.name || data.firstName || 'Anonymous',
                        email: data.email,
                        imageUrl: data.imageUrl,
                        followingCount: data.followingCount || 0,
                        followersCount: data.followersCount || 0,
                        isFollowing: following,
                    });
                }
            }

            return users.slice(0, limitCount);
        } catch (e) {
            console.error('Fallback search also failed:', e);
            return [];
        }
    }
}

/**
 * Get suggested users to follow (users with most followers)
 */
export async function getSuggestedUsers(
    currentUserId: string,
    limitCount: number = 10
): Promise<(UserProfile & { isFollowing: boolean })[]> {
    try {
        const usersRef = collection(db, 'users');
        const snapshot = await getDocs(usersRef);

        const users: (UserProfile & { isFollowing: boolean })[] = [];

        for (const docSnapshot of snapshot.docs) {
            const data = docSnapshot.data();
            const userId = docSnapshot.id;

            // Don't show current user
            if (userId === currentUserId) continue;

            const following = await isFollowing(currentUserId, userId);

            users.push({
                id: userId,
                name: data.name || data.firstName || 'Anonymous',
                email: data.email,
                imageUrl: data.imageUrl,
                followingCount: data.followingCount || 0,
                followersCount: data.followersCount || 0,
                isFollowing: following,
            });
        }

        // Sort by followers count and return top N
        return users
            .sort((a, b) => b.followersCount - a.followersCount)
            .slice(0, limitCount);
    } catch (error) {
        console.error('Error getting suggested users:', error);
        return [];
    }
}

/**
 * Get list of users that current user is following
 */
export async function getFollowing(
    userId: string,
    limitCount: number = 50
): Promise<UserProfile[]> {
    try {
        const followsRef = collection(db, 'follows');
        const q = query(
            followsRef,
            where('followerId', '==', userId),
            limit(limitCount)
        );

        const snapshot = await getDocs(q);
        const following: UserProfile[] = [];

        for (const docSnapshot of snapshot.docs) {
            const data = docSnapshot.data();
            const targetUserId = data.followingId;

            const userDoc = await getDoc(doc(db, 'users', targetUserId));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                following.push({
                    id: targetUserId,
                    name: userData.name || userData.firstName || 'Anonymous',
                    email: userData.email,
                    imageUrl: userData.imageUrl,
                    followingCount: userData.followingCount || 0,
                    followersCount: userData.followersCount || 0,
                });
            }
        }

        return following;
    } catch (error) {
        console.error('Error getting following list:', error);
        return [];
    }
}
