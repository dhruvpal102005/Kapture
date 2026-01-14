// Socket Service - Real-time run tracking via WebSocket
// Using native WebSocket instead of socket.io-client for React Native compatibility
import { LocationPoint, RunStats } from './types';

// Default to localhost for development
const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL || 'ws://localhost:3001';

interface SocketMessage {
    event: string;
    data: any;
}

class SocketService {
    private ws: WebSocket | null = null;
    private isConnected: boolean = false;
    private currentRunId: string | null = null;
    private reconnectAttempts: number = 0;
    private maxReconnectAttempts: number = 5;
    private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
    private listeners: Map<string, Set<Function>> = new Map();
    private messageQueue: SocketMessage[] = [];

    /**
     * Connect to the WebSocket server
     */
    connect(): Promise<boolean> {
        return new Promise((resolve) => {
            if (this.ws && this.isConnected) {
                resolve(true);
                return;
            }

            try {
                // Use native WebSocket with Socket.IO handshake
                const wsUrl = `${SOCKET_URL}/socket.io/?EIO=4&transport=websocket`;
                this.ws = new WebSocket(wsUrl);

                this.ws.onopen = () => {
                    console.log('[Socket] Connected to server');
                    this.isConnected = true;
                    this.reconnectAttempts = 0;

                    // Send any queued messages
                    this.flushMessageQueue();
                    resolve(true);
                };

                this.ws.onmessage = (event) => {
                    this.handleMessage(event.data);
                };

                this.ws.onclose = (event) => {
                    console.log('[Socket] Disconnected:', event.reason);
                    this.isConnected = false;
                    this.attemptReconnect();
                };

                this.ws.onerror = (error) => {
                    console.log('[Socket] Connection error');
                    this.reconnectAttempts++;
                    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
                        console.log('[Socket] Max reconnection attempts reached');
                        resolve(false);
                    }
                };

                // Timeout for initial connection
                setTimeout(() => {
                    if (!this.isConnected) {
                        resolve(false);
                    }
                }, 10000);

            } catch (error) {
                console.error('[Socket] Failed to connect:', error);
                resolve(false);
            }
        });
    }

    /**
     * Handle incoming WebSocket message
     */
    private handleMessage(data: string): void {
        try {
            // Socket.IO protocol: messages start with a number
            // 0 = open, 2 = ping, 3 = pong, 4 = message
            if (data.startsWith('0')) {
                // Connection established, send Socket.IO handshake
                return;
            }

            if (data === '2') {
                // Ping - respond with pong
                this.ws?.send('3');
                return;
            }

            if (data.startsWith('42')) {
                // Socket.IO message format: 42["event", data]
                const payload = data.substring(2);
                const parsed = JSON.parse(payload);

                if (Array.isArray(parsed) && parsed.length >= 2) {
                    const [event, eventData] = parsed;
                    this.notifyListeners(event, eventData);
                }
            }
        } catch (error) {
            console.error('[Socket] Error parsing message:', error);
        }
    }

    /**
     * Notify registered listeners
     */
    private notifyListeners(event: string, data: any): void {
        const eventListeners = this.listeners.get(event);
        if (eventListeners) {
            eventListeners.forEach(callback => callback(data));
        }
    }

    /**
     * Attempt to reconnect
     */
    private attemptReconnect(): void {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            return;
        }

        const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000);
        this.reconnectTimeout = setTimeout(() => {
            this.reconnectAttempts++;
            this.connect();
        }, delay);
    }

    /**
     * Send message to server
     */
    private emit(event: string, data: any): void {
        const message = `42${JSON.stringify([event, data])}`;

        if (this.ws && this.isConnected) {
            this.ws.send(message);
        } else {
            // Queue message for when connection is established
            this.messageQueue.push({ event, data });
        }
    }

    /**
     * Flush queued messages
     */
    private flushMessageQueue(): void {
        while (this.messageQueue.length > 0) {
            const msg = this.messageQueue.shift();
            if (msg) {
                this.emit(msg.event, msg.data);
            }
        }
    }

    /**
     * Disconnect from the server
     */
    disconnect(): void {
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }
        if (this.ws) {
            this.ws.close();
            this.ws = null;
            this.isConnected = false;
            this.currentRunId = null;
        }
    }

    /**
     * Start a run and create a room
     */
    startRun(userId: string, runId: string, userName?: string): void {
        this.currentRunId = runId;
        this.emit('run:start', {
            userId,
            runId,
            userName: userName || 'Anonymous Runner',
        });
    }

    /**
     * Send location update
     */
    sendLocation(location: LocationPoint, stats: RunStats): void {
        if (!this.currentRunId) return;

        this.emit('run:location', {
            runId: this.currentRunId,
            location,
            stats,
        });
    }

    /**
     * Pause the run
     */
    pauseRun(): void {
        if (!this.currentRunId) return;
        this.emit('run:pause', { runId: this.currentRunId });
    }

    /**
     * Resume the run
     */
    resumeRun(): void {
        if (!this.currentRunId) return;
        this.emit('run:resume', { runId: this.currentRunId });
    }

    /**
     * Finish the run
     */
    finishRun(finalStats: RunStats): void {
        if (!this.currentRunId) return;
        this.emit('run:finish', {
            runId: this.currentRunId,
            finalStats,
        });
        this.currentRunId = null;
    }

    /**
     * Join as spectator to watch a run
     */
    spectateRun(runId: string): void {
        this.emit('spectate:join', { runId });
    }

    /**
     * Leave spectating a run
     */
    leaveSpectate(runId: string): void {
        this.emit('spectate:leave', { runId });
    }

    /**
     * Get list of active runs
     */
    getActiveRuns(): void {
        this.emit('runs:list', {});
    }

    /**
     * Add event listener
     */
    on(event: string, callback: (data: any) => void): void {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event)!.add(callback);
    }

    /**
     * Remove event listener
     */
    off(event: string, callback: (data: any) => void): void {
        const eventListeners = this.listeners.get(event);
        if (eventListeners) {
            eventListeners.delete(callback);
        }
    }

    /**
     * Check connection status
     */
    getConnectionStatus(): boolean {
        return this.isConnected;
    }

    /**
     * Get current run ID
     */
    getCurrentRunId(): string | null {
        return this.currentRunId;
    }
}

export const socketService = new SocketService();
