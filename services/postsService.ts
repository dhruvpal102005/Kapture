// Posts Service - Create and fetch posts for the feed
import { db } from '@/config/firebase';
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    limit,
    orderBy,
    query,
    serverTimestamp,
    Timestamp,
    where,
} from 'firebase/firestore';

export interface Post {
    id: string;
    userId: string;
    userName: string;
    userImage?: string;
    content: string;
    type: 'status' | 'poll';
    createdAt: Timestamp | Date;
    likes: number;
    comments: number;
}

export interface CreatePostData {
    userId: string;
    userName: string;
    userImage?: string;
    content: string;
    type: 'status' | 'poll';
}

/**
 * Create a new post
 */
export async function createPost(data: CreatePostData): Promise<string | null> {
    try {
        if (!data.content.trim()) {
            return null;
        }

        const postsRef = collection(db, 'posts');
        const docRef = await addDoc(postsRef, {
            userId: data.userId,
            userName: data.userName,
            userImage: data.userImage || null,
            content: data.content.trim(),
            type: data.type,
            createdAt: serverTimestamp(),
            likes: 0,
            comments: 0,
        });

        console.log('Post created:', docRef.id);
        return docRef.id;
    } catch (error) {
        console.error('Error creating post:', error);
        return null;
    }
}

/**
 * Get all posts for explore feed (most recent first)
 */
export async function getExplorePosts(limitCount: number = 20): Promise<Post[]> {
    try {
        const postsRef = collection(db, 'posts');
        const q = query(
            postsRef,
            orderBy('createdAt', 'desc'),
            limit(limitCount)
        );

        const snapshot = await getDocs(q);
        const posts: Post[] = [];

        snapshot.forEach(docSnapshot => {
            const data = docSnapshot.data();
            posts.push({
                id: docSnapshot.id,
                userId: data.userId,
                userName: data.userName,
                userImage: data.userImage,
                content: data.content,
                type: data.type,
                createdAt: data.createdAt,
                likes: data.likes || 0,
                comments: data.comments || 0,
            });
        });

        return posts;
    } catch (error) {
        console.error('Error fetching explore posts:', error);
        return [];
    }
}

/**
 * Get posts from users the current user follows
 */
export async function getFollowingPosts(
    userId: string,
    limitCount: number = 20
): Promise<Post[]> {
    try {
        // First get list of users being followed
        const followsRef = collection(db, 'follows');
        const followsQuery = query(
            followsRef,
            where('followerId', '==', userId)
        );
        const followsSnapshot = await getDocs(followsQuery);

        const followingIds: string[] = [];
        followsSnapshot.forEach(doc => {
            followingIds.push(doc.data().followingId);
        });

        if (followingIds.length === 0) {
            return [];
        }

        // Get posts from followed users
        // Note: Firebase 'in' query limited to 10 items, so we chunk
        const allPosts: Post[] = [];
        const chunks = [];
        for (let i = 0; i < followingIds.length; i += 10) {
            chunks.push(followingIds.slice(i, i + 10));
        }

        for (const chunk of chunks) {
            const postsRef = collection(db, 'posts');
            const q = query(
                postsRef,
                where('userId', 'in', chunk),
                orderBy('createdAt', 'desc'),
                limit(limitCount)
            );

            const snapshot = await getDocs(q);
            snapshot.forEach(docSnapshot => {
                const data = docSnapshot.data();
                allPosts.push({
                    id: docSnapshot.id,
                    userId: data.userId,
                    userName: data.userName,
                    userImage: data.userImage,
                    content: data.content,
                    type: data.type,
                    createdAt: data.createdAt,
                    likes: data.likes || 0,
                    comments: data.comments || 0,
                });
            });
        }

        // Sort by date and limit
        return allPosts
            .sort((a, b) => {
                const aTime = a.createdAt instanceof Timestamp ? a.createdAt.toMillis() : new Date(a.createdAt).getTime();
                const bTime = b.createdAt instanceof Timestamp ? b.createdAt.toMillis() : new Date(b.createdAt).getTime();
                return bTime - aTime;
            })
            .slice(0, limitCount);
    } catch (error) {
        console.error('Error fetching following posts:', error);
        return [];
    }
}

/**
 * Delete a post
 */
export async function deletePost(postId: string, userId: string): Promise<boolean> {
    try {
        const postRef = doc(db, 'posts', postId);
        const postDoc = await getDoc(postRef);

        if (!postDoc.exists()) {
            return false;
        }

        // Only allow deletion by post owner
        if (postDoc.data().userId !== userId) {
            return false;
        }

        await deleteDoc(postRef);
        console.log('Post deleted:', postId);
        return true;
    } catch (error) {
        console.error('Error deleting post:', error);
        return false;
    }
}

/**
 * Format post timestamp for display
 */
export function formatPostTime(timestamp: Timestamp | Date): string {
    const date = timestamp instanceof Timestamp ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
}
