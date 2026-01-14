require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// Configure Socket.IO with CORS
const io = new Server(server, {
    cors: {
        origin: process.env.CORS_ORIGIN || '*',
        methods: ['GET', 'POST'],
    },
});

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Active runs storage (in-memory for simplicity)
// In production, use Redis or similar
const activeRuns = new Map();

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    // User starts a run
    socket.on('run:start', (data) => {
        const { userId, runId, userName } = data;

        if (!runId) {
            socket.emit('error', { message: 'runId is required' });
            return;
        }

        // Create run room
        const roomName = `run:${runId}`;
        socket.join(roomName);

        // Store run data
        activeRuns.set(runId, {
            runId,
            odId: socket.id,
            userName: userName || 'Anonymous',
            startTime: Date.now(),
            lastLocation: null,
            status: 'active',
            spectators: [],
        });

        console.log(`[Run] Started: ${runId} by ${userName}`);
        socket.emit('run:started', { runId, roomName });
    });

    // User sends location update
    socket.on('run:location', (data) => {
        const { runId, location, stats } = data;

        if (!runId || !location) return;

        const run = activeRuns.get(runId);
        if (run) {
            run.lastLocation = location;
            run.lastStats = stats;
            run.lastUpdate = Date.now();

            // Broadcast to all spectators in the room
            const roomName = `run:${runId}`;
            socket.to(roomName).emit('run:update', {
                runId,
                location,
                stats,
                timestamp: Date.now(),
            });
        }
    });

    // User pauses run
    socket.on('run:pause', (data) => {
        const { runId } = data;
        const run = activeRuns.get(runId);
        if (run) {
            run.status = 'paused';
            const roomName = `run:${runId}`;
            socket.to(roomName).emit('run:paused', { runId });
            console.log(`[Run] Paused: ${runId}`);
        }
    });

    // User resumes run
    socket.on('run:resume', (data) => {
        const { runId } = data;
        const run = activeRuns.get(runId);
        if (run) {
            run.status = 'active';
            const roomName = `run:${runId}`;
            socket.to(roomName).emit('run:resumed', { runId });
            console.log(`[Run] Resumed: ${runId}`);
        }
    });

    // User finishes run
    socket.on('run:finish', (data) => {
        const { runId, finalStats } = data;
        const run = activeRuns.get(runId);
        if (run) {
            run.status = 'completed';
            run.finalStats = finalStats;

            const roomName = `run:${runId}`;
            socket.to(roomName).emit('run:finished', { runId, finalStats });

            // Clean up after a delay
            setTimeout(() => {
                activeRuns.delete(runId);
            }, 60000); // Keep for 1 minute for late spectators

            console.log(`[Run] Finished: ${runId}`);
        }
    });

    // Spectator joins a run
    socket.on('spectate:join', (data) => {
        const { runId } = data;
        const run = activeRuns.get(runId);

        if (run) {
            const roomName = `run:${runId}`;
            socket.join(roomName);
            run.spectators.push(socket.id);

            // Send current run state to new spectator
            socket.emit('spectate:joined', {
                runId,
                location: run.lastLocation,
                stats: run.lastStats,
                status: run.status,
                userName: run.userName,
            });

            console.log(`[Spectate] ${socket.id} joined run ${runId}`);
        } else {
            socket.emit('spectate:error', { message: 'Run not found' });
        }
    });

    // Spectator leaves
    socket.on('spectate:leave', (data) => {
        const { runId } = data;
        const roomName = `run:${runId}`;
        socket.leave(roomName);

        const run = activeRuns.get(runId);
        if (run) {
            run.spectators = run.spectators.filter(id => id !== socket.id);
        }
    });

    // Get list of active runs
    socket.on('runs:list', () => {
        const runsList = Array.from(activeRuns.values()).map(run => ({
            runId: run.runId,
            userName: run.userName,
            status: run.status,
            lastLocation: run.lastLocation,
            spectatorCount: run.spectators.length,
        }));
        socket.emit('runs:list', runsList);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
        console.log(`[Socket] Client disconnected: ${socket.id}`);

        // Clean up any runs owned by this socket
        for (const [runId, run] of activeRuns) {
            if (run.socketId === socket.id && run.status === 'active') {
                run.status = 'disconnected';
                const roomName = `run:${runId}`;
                io.to(roomName).emit('run:disconnected', { runId });
            }
            // Remove from spectators
            run.spectators = run.spectators.filter(id => id !== socket.id);
        }
    });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║           Kapture Real-Time Tracking Server                ║
╠════════════════════════════════════════════════════════════╣
║  Status: Running                                           ║
║  Port: ${PORT.toString().padEnd(52)}║
║  WebSocket: Ready                                          ║
╚════════════════════════════════════════════════════════════╝
    `);
});
