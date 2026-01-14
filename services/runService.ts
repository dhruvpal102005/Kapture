// Run Service - Firebase operations for run tracking
import { db } from '@/config/firebase';
import {
    collection,
    doc,
    getDocs,
    limit,
    orderBy,
    query,
    serverTimestamp,
    setDoc,
    Timestamp,
    updateDoc,
    where
} from 'firebase/firestore';
import { LocationPoint } from './types';

// Types for run data stored in Firestore
export interface RunSession {
    id: string;
    userId: string;
    status: 'active' | 'paused' | 'completed';
    startTime: Timestamp;
    endTime?: Timestamp;
    totalDistance: number;
    totalDuration: number;
    averagePace: number;
    capturedArea: number;
    pausedDuration: number;
    createdAt: any;
    updatedAt: any;
}

export interface LocationBatch {
    points: LocationPoint[];
    batchIndex: number;
    savedAt: any;
}

/**
 * Starts a new run session in Firestore
 */
export async function startRunSession(userId: string): Promise<string> {
    try {
        if (!userId) {
            throw new Error('User ID is required to start a run session');
        }

        const runsRef = collection(db, 'runs');
        const runDoc = doc(runsRef);

        const runData: Omit<RunSession, 'id'> = {
            userId,
            status: 'active',
            startTime: Timestamp.now(),
            totalDistance: 0,
            totalDuration: 0,
            averagePace: 0,
            capturedArea: 0,
            pausedDuration: 0,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        };

        await setDoc(runDoc, runData);
        console.log('Run session started:', runDoc.id);

        return runDoc.id;
    } catch (error) {
        console.error('Error starting run session:', error);
        throw error;
    }
}

/**
 * Saves a batch of location points
 */
export async function saveLocationBatch(
    sessionId: string,
    locations: LocationPoint[],
    batchIndex: number
): Promise<void> {
    try {
        if (!sessionId || locations.length === 0) return;

        const locationsRef = collection(db, 'runs', sessionId, 'locations');
        const batchDoc = doc(locationsRef, `batch_${batchIndex.toString().padStart(6, '0')}`);

        const batchData: LocationBatch = {
            points: locations.map(loc => ({
                latitude: loc.latitude,
                longitude: loc.longitude,
                timestamp: loc.timestamp,
                accuracy: loc.accuracy,
            })),
            batchIndex,
            savedAt: serverTimestamp(),
        };

        await setDoc(batchDoc, batchData);
        console.log(`Location batch ${batchIndex} saved with ${locations.length} points`);
    } catch (error) {
        console.error('Error saving location batch:', error);
    }
}

/**
 * Updates the run status
 */
export async function updateRunStatus(
    sessionId: string,
    status: 'active' | 'paused' | 'completed',
    pausedDuration?: number
): Promise<void> {
    try {
        if (!sessionId) return;

        const runRef = doc(db, 'runs', sessionId);
        const updateData: any = {
            status,
            updatedAt: serverTimestamp(),
        };

        if (pausedDuration !== undefined) {
            updateData.pausedDuration = pausedDuration;
        }

        await updateDoc(runRef, updateData);
        console.log('Run status updated:', status);
    } catch (error) {
        console.error('Error updating run status:', error);
    }
}

/**
 * Finishes a run session
 */
export async function finishRunSession(
    sessionId: string,
    stats: {
        totalDistance: number;
        totalDuration: number;
        averagePace: number;
        capturedArea: number;
        pausedDuration: number;
    }
): Promise<void> {
    try {
        if (!sessionId) return;

        const runRef = doc(db, 'runs', sessionId);

        await updateDoc(runRef, {
            status: 'completed',
            endTime: Timestamp.now(),
            totalDistance: stats.totalDistance,
            totalDuration: stats.totalDuration,
            averagePace: stats.averagePace,
            capturedArea: stats.capturedArea,
            pausedDuration: stats.pausedDuration,
            updatedAt: serverTimestamp(),
        });

        console.log('Run session completed:', sessionId);
    } catch (error) {
        console.error('Error finishing run session:', error);
    }
}

/**
 * Gets a user's run history
 */
export async function getUserRunHistory(
    userId: string,
    limitCount: number = 20
): Promise<RunSession[]> {
    try {
        if (!userId) return [];

        const runsRef = collection(db, 'runs');
        const q = query(
            runsRef,
            where('userId', '==', userId),
            where('status', '==', 'completed'),
            orderBy('startTime', 'desc'),
            limit(limitCount)
        );

        const snapshot = await getDocs(q);
        const runs: RunSession[] = [];

        snapshot.forEach(doc => {
            runs.push({
                id: doc.id,
                ...doc.data(),
            } as RunSession);
        });

        return runs;
    } catch (error) {
        console.error('Error getting run history:', error);
        return [];
    }
}
