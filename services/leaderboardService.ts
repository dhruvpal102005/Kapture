// Leaderboard Service - Fetch and aggregate user area data
import { db } from '@/config/firebase';
import {
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    where
} from 'firebase/firestore';

export interface LeaderboardEntry {
    rank: number;
    userId: string;
    name: string;
    totalArea: number; // in square meters
    runCount: number;
    avatarUrl?: string;
}

/**
 * Gets the area leaderboard - users ranked by total captured territory
 * Aggregates all completed runs per user and sums their capturedArea
 */
export async function getAreaLeaderboard(limitCount: number = 50): Promise<LeaderboardEntry[]> {
    try {
        // Get all completed runs (sorting done client-side to avoid index requirement)
        const runsRef = collection(db, 'runs');
        const q = query(
            runsRef,
            where('status', '==', 'completed')
        );

        const snapshot = await getDocs(q);

        // Aggregate by user
        const userStats = new Map<string, { totalArea: number; runCount: number }>();

        snapshot.forEach(doc => {
            const data = doc.data();
            const userId = data.userId;
            const area = data.capturedArea || 0;

            if (userId) {
                const existing = userStats.get(userId) || { totalArea: 0, runCount: 0 };
                userStats.set(userId, {
                    totalArea: existing.totalArea + area,
                    runCount: existing.runCount + 1,
                });
            }
        });

        // Convert to array and sort by total area
        const sortedUsers = Array.from(userStats.entries())
            .map(([userId, stats]) => ({
                userId,
                totalArea: stats.totalArea,
                runCount: stats.runCount,
            }))
            .sort((a, b) => b.totalArea - a.totalArea)
            .slice(0, limitCount);

        // Fetch user names from users collection
        const leaderboard: LeaderboardEntry[] = [];

        for (let i = 0; i < sortedUsers.length; i++) {
            const user = sortedUsers[i];
            let name = 'Anonymous';
            let avatarUrl: string | undefined;

            try {
                const userDoc = await getDoc(doc(db, 'users', user.userId));
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    name = userData.name || userData.firstName || 'Anonymous';
                    avatarUrl = userData.imageUrl || userData.avatarUrl;
                }
            } catch (e) {
                // User doc might not exist, use default name
            }

            leaderboard.push({
                rank: i + 1,
                userId: user.userId,
                name,
                totalArea: user.totalArea,
                runCount: user.runCount,
                avatarUrl,
            });
        }

        return leaderboard;
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        return [];
    }
}

/**
 * Gets a specific user's rank and stats
 */
export async function getUserRankAndStats(userId: string): Promise<{
    rank: number | null;
    totalArea: number;
    runCount: number;
}> {
    try {
        // Get all user's completed runs
        const runsRef = collection(db, 'runs');
        const userQuery = query(
            runsRef,
            where('userId', '==', userId),
            where('status', '==', 'completed')
        );

        const userSnapshot = await getDocs(userQuery);

        let userTotalArea = 0;
        let userRunCount = 0;

        userSnapshot.forEach(doc => {
            const data = doc.data();
            userTotalArea += data.capturedArea || 0;
            userRunCount++;
        });

        // Get full leaderboard to determine rank
        const leaderboard = await getAreaLeaderboard(1000);
        const userEntry = leaderboard.find(entry => entry.userId === userId);

        return {
            rank: userEntry?.rank || null,
            totalArea: userTotalArea,
            runCount: userRunCount,
        };
    } catch (error) {
        console.error('Error getting user rank:', error);
        return { rank: null, totalArea: 0, runCount: 0 };
    }
}

/**
 * Format area for display (converts to appropriate unit)
 */
export function formatArea(areaInSquareMeters: number): string {
    if (areaInSquareMeters >= 1000000) {
        // Show in km²
        return `${(areaInSquareMeters / 1000000).toFixed(2)}KM²`;
    } else if (areaInSquareMeters >= 1000) {
        // Show in thousands of m²
        return `${(areaInSquareMeters / 1000).toFixed(1)}KM²`;
    } else {
        // Show in m²
        return `${Math.round(areaInSquareMeters)}M²`;
    }
}
