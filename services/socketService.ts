// Socket Service - Stub for real-time run tracking
// This is a minimal implementation without WebSocket for now
import { LocationPoint, RunStats } from './types';

class SocketService {
    private currentRunId: string | null = null;

    /**
     * Connect to server (stub - returns true for now)
     */
    async connect(): Promise<boolean> {
        console.log('[Socket] Connection skipped - running in local mode');
        return true;
    }

    /**
     * Disconnect (stub)
     */
    disconnect(): void {
        this.currentRunId = null;
    }

    /**
     * Start a run (stub)
     */
    startRun(userId: string, runId: string, userName?: string): void {
        this.currentRunId = runId;
        console.log('[Socket] Run started (local mode):', runId);
    }

    /**
     * Send location update (stub - logs only)
     */
    sendLocation(location: LocationPoint, stats: RunStats): void {
        // In local mode, we just log
        // The actual data is saved via Firebase
    }

    /**
     * Pause the run (stub)
     */
    pauseRun(): void {
        console.log('[Socket] Run paused (local mode)');
    }

    /**
     * Resume the run (stub)
     */
    resumeRun(): void {
        console.log('[Socket] Run resumed (local mode)');
    }

    /**
     * Finish the run (stub)
     */
    finishRun(finalStats: RunStats): void {
        console.log('[Socket] Run finished (local mode)');
        this.currentRunId = null;
    }

    /**
     * Get connection status
     */
    getConnectionStatus(): boolean {
        return false; // Always false in local mode
    }
}

export const socketService = new SocketService();
