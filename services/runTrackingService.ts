import * as Location from 'expo-location';
import * as runService from './runService';
import { socketService } from './socketService';
import { CapturedPolygon, LocationPoint, RunStats } from './types';

// Re-export types for backward compatibility
export type { CapturedPolygon, LocationPoint, RunStats } from './types';

// Constants for area capture
const LOOP_THRESHOLD_METERS = 50; // Distance to consider start/end as a loop

class RunTrackingService {
    private locationSubscription: Location.LocationSubscription | null = null;
    private startTime: number = 0;
    private pauseTime: number = 0;
    private totalPausedDuration: number = 0;
    private locations: LocationPoint[] = [];
    private validLocations: LocationPoint[] = []; // Only locations that passed filtering
    private onLocationUpdate?: (location: LocationPoint) => void;
    private onStatsUpdate?: (stats: RunStats) => void;
    private updateInterval: ReturnType<typeof setInterval> | null = null;

    // Firebase sync properties
    private sessionId: string | null = null;
    private userId: string | null = null;
    private locationBatchBuffer: LocationPoint[] = [];
    private batchSaveInterval: ReturnType<typeof setInterval> | null = null;
    private batchIndex: number = 0;
    private readonly BATCH_INTERVAL = 5000; // Save every 5 seconds

    // GPS filtering constants
    private readonly MIN_DISTANCE_THRESHOLD = 0.005; // ~5 meters in kilometers (filters GPS noise)
    private readonly MAX_ACCURACY = 30; // Ignore readings with accuracy worse than 30 meters
    private readonly MIN_ACCURACY = 3; // Prefer readings with accuracy better than 3 meters
    private readonly PACE_SMOOTHING_WINDOW = 10; // Number of recent pace values for smoothing
    private readonly MIN_DISTANCE_FOR_PACE = 0.01; // Minimum 10m before calculating pace

    private recentPaces: number[] = []; // For pace smoothing
    private lastCalculatedDistance: number = 0; // Last distance used for pace calculation
    private cachedDistance: number = 0; // Cached total distance for stability
    private lastValidLocationTime: number = 0; // Time of last valid location
    private smoothedLocations: LocationPoint[] = []; // Smoothed locations for route display

    async requestPermissions(): Promise<boolean> {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                return false;
            }

            // Also request background permission for continuous tracking
            const backgroundStatus = await Location.requestBackgroundPermissionsAsync();
            return backgroundStatus.status === 'granted' || backgroundStatus.status === 'undetermined';
        } catch (error) {
            console.error('Error requesting permissions:', error);
            return false;
        }
    }

    async startTracking(
        userId: string | null,
        onLocationUpdate: (location: LocationPoint) => void,
        onStatsUpdate: (stats: RunStats) => void
    ): Promise<boolean> {
        try {
            // Check permissions
            const hasPermission = await this.requestPermissions();
            if (!hasPermission) {
                return false;
            }

            this.onLocationUpdate = onLocationUpdate;
            this.onStatsUpdate = onStatsUpdate;
            this.startTime = Date.now();
            this.totalPausedDuration = 0;
            this.locations = [];
            this.validLocations = [];
            this.recentPaces = [];
            this.userId = userId;
            this.locationBatchBuffer = [];
            this.batchIndex = 0;

            // Create Firebase session if user is logged in
            if (userId) {
                try {
                    this.sessionId = await runService.startRunSession(userId);
                    this.startBatchSaving();

                    // Connect to socket server for real-time streaming
                    const connected = await socketService.connect();
                    if (connected && this.sessionId) {
                        socketService.startRun(userId, this.sessionId);
                    }
                } catch (error) {
                    console.error('Error creating Firebase session:', error);
                    // Continue without Firebase - run will work locally
                    this.sessionId = null;
                }
            }

            // Start location tracking with high accuracy
            this.locationSubscription = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.BestForNavigation,
                    timeInterval: 1000, // Update every second
                    distanceInterval: 5, // Update every 5 meters (helps filter noise)
                },
                (location) => {
                    const point: LocationPoint = {
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                        timestamp: location.timestamp || Date.now(),
                        accuracy: location.coords.accuracy || undefined,
                    };

                    // Always add to all locations for route display
                    this.locations.push(point);
                    this.onLocationUpdate?.(point);

                    // Filter and validate location before adding to valid locations
                    if (this.isValidLocation(point)) {
                        this.validLocations.push(point);
                        // Smooth the location for cleaner route display
                        const smoothedPoint = this.smoothLocation(point);
                        // Add to Firebase batch buffer (use raw point for accuracy)
                        this.addToLocationBuffer(point);
                        // Update stats only when we have valid movement
                        this.updateStats();
                        // Send smoothed location to socket
                        const stats = this.getStats();
                        socketService.sendLocation(smoothedPoint, stats);
                    } else {
                        // Still update stats periodically even if no new valid location
                        // This ensures duration and other stats update correctly
                        this.updateStats();
                    }
                }
            );

            // Update stats every second for smooth UI updates
            this.updateInterval = setInterval(() => {
                this.updateStats();
            }, 1000);

            return true;
        } catch (error) {
            console.error('Error starting tracking:', error);
            return false;
        }
    }

    private isValidLocation(point: LocationPoint): boolean {
        // Check accuracy - ignore readings with poor accuracy
        if (point.accuracy && point.accuracy > this.MAX_ACCURACY) {
            return false;
        }

        // If this is the first location, always accept it
        if (this.validLocations.length === 0) {
            return true;
        }

        // Check if movement is significant enough (filters GPS drift/noise)
        const lastValidLocation = this.validLocations[this.validLocations.length - 1];
        const distance = this.calculateDistance(lastValidLocation, point);

        // Only accept if moved more than threshold (filters stationary GPS drift)
        return distance >= this.MIN_DISTANCE_THRESHOLD;
    }

    /**
     * Smooths a location point using weighted average of recent points
     * This reduces GPS jitter and makes the route look cleaner
     */
    private smoothLocation(point: LocationPoint): LocationPoint {
        const SMOOTHING_WINDOW = 3; // Number of recent points to average

        // Add point to smoothed locations
        this.smoothedLocations.push(point);

        // Not enough points to smooth yet
        if (this.smoothedLocations.length < SMOOTHING_WINDOW) {
            return point;
        }

        // Get the last N points including the new one
        const recentPoints = this.smoothedLocations.slice(-SMOOTHING_WINDOW);

        // Calculate weighted average (newer points have more weight)
        let totalLat = 0;
        let totalLng = 0;
        let totalWeight = 0;

        for (let i = 0; i < recentPoints.length; i++) {
            const weight = i + 1; // Weight increases for more recent points
            totalLat += recentPoints[i].latitude * weight;
            totalLng += recentPoints[i].longitude * weight;
            totalWeight += weight;
        }

        const smoothedPoint: LocationPoint = {
            latitude: totalLat / totalWeight,
            longitude: totalLng / totalWeight,
            timestamp: point.timestamp,
            accuracy: point.accuracy,
        };

        // Update the last point in smoothedLocations with the smoothed value
        this.smoothedLocations[this.smoothedLocations.length - 1] = smoothedPoint;

        return smoothedPoint;
    }

    // Firebase batch saving methods
    private startBatchSaving(): void {
        if (this.batchSaveInterval) return;

        this.batchSaveInterval = setInterval(async () => {
            if (this.sessionId && this.locationBatchBuffer.length > 0) {
                const batchToSave = [...this.locationBatchBuffer];
                this.locationBatchBuffer = [];
                this.batchIndex++;

                try {
                    await runService.saveLocationBatch(
                        this.sessionId,
                        batchToSave,
                        this.batchIndex
                    );
                } catch (error) {
                    console.error('Error saving location batch:', error);
                    // Re-add failed batch to buffer for retry
                    this.locationBatchBuffer = [...batchToSave, ...this.locationBatchBuffer];
                }
            }
        }, this.BATCH_INTERVAL);
    }

    private stopBatchSaving(): void {
        if (this.batchSaveInterval) {
            clearInterval(this.batchSaveInterval);
            this.batchSaveInterval = null;
        }
    }

    private addToLocationBuffer(point: LocationPoint): void {
        this.locationBatchBuffer.push(point);
    }

    pauseTracking(): void {
        if (this.locationSubscription) {
            this.pauseTime = Date.now();
            this.locationSubscription.remove();
            this.locationSubscription = null;
        }
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }

        // Stop batch saving and update Firebase status
        this.stopBatchSaving();
        if (this.sessionId) {
            runService.updateRunStatus(this.sessionId, 'paused', this.totalPausedDuration);
        }
        // Notify socket server
        socketService.pauseRun();
    }

    async resumeTracking(): Promise<void> {
        if (!this.onLocationUpdate || !this.onStatsUpdate) {
            return;
        }

        // Add paused duration to total
        if (this.pauseTime > 0) {
            this.totalPausedDuration += Date.now() - this.pauseTime;
            this.pauseTime = 0;
        }

        // Restart location tracking
        try {
            this.locationSubscription = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.BestForNavigation,
                    timeInterval: 1000,
                    distanceInterval: 5, // 5 meters
                },
                (location) => {
                    const point: LocationPoint = {
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                        timestamp: location.timestamp || Date.now(),
                        accuracy: location.coords.accuracy || undefined,
                    };

                    this.locations.push(point);
                    this.onLocationUpdate?.(point);

                    if (this.isValidLocation(point)) {
                        this.validLocations.push(point);
                        this.updateStats();
                    } else {
                        this.updateStats();
                    }
                }
            );

            // Restart stats update interval
            this.updateInterval = setInterval(() => {
                this.updateStats();
            }, 1000);

            // Restart batch saving and update Firebase status
            this.startBatchSaving();
            if (this.sessionId) {
                runService.updateRunStatus(this.sessionId, 'active', this.totalPausedDuration);
            }
            // Notify socket server
            socketService.resumeRun();
        } catch (error) {
            console.error('Error resuming tracking:', error);
        }
    }

    stopTracking(): RunStats {
        if (this.locationSubscription) {
            this.locationSubscription.remove();
            this.locationSubscription = null;
        }
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }

        // Stop batch saving and save any remaining locations
        this.stopBatchSaving();

        const finalStats = this.getStats();

        // Finalize Firebase session
        if (this.sessionId) {
            // Save remaining buffered locations
            if (this.locationBatchBuffer.length > 0) {
                this.batchIndex++;
                runService.saveLocationBatch(
                    this.sessionId,
                    this.locationBatchBuffer,
                    this.batchIndex
                );
            }

            // Save final stats to Firebase (including captured polygon)
            runService.finishRunSession(this.sessionId, {
                totalDistance: finalStats.distance,
                totalDuration: finalStats.duration,
                averagePace: finalStats.averagePace,
                capturedArea: finalStats.capturedArea,
                pausedDuration: this.totalPausedDuration,
                capturedPolygon: finalStats.capturedPolygon,
            });
        }

        // Notify socket server and disconnect
        socketService.finishRun(finalStats);
        socketService.disconnect();

        this.reset();
        return finalStats;
    }

    private updateStats(): void {
        const stats = this.getStats();
        this.onStatsUpdate?.(stats);
    }

    private getStats(): RunStats {
        const currentTime = Date.now();
        const elapsedTime = currentTime - this.startTime - this.totalPausedDuration;
        const duration = Math.max(0, Math.floor(elapsedTime / 1000));

        // Calculate distance using only valid locations (filtered GPS points)
        // Only recalculate if we have new valid locations
        if (this.validLocations.length > 1) {
            let totalDistance = 0;
            for (let i = 1; i < this.validLocations.length; i++) {
                const prev = this.validLocations[i - 1];
                const curr = this.validLocations[i];
                totalDistance += this.calculateDistance(prev, curr);
            }
            // Only update cached distance if it increased (never decrease)
            if (totalDistance > this.cachedDistance) {
                this.cachedDistance = totalDistance;
            }
        }

        const distance = this.cachedDistance;

        // Calculate smoothed average pace - only update when distance meaningfully changes
        let averagePace = 0;

        if (distance >= this.MIN_DISTANCE_FOR_PACE && duration > 0) {
            // Only update pace if distance has increased by at least 5 meters since last calculation
            const distanceChange = distance - this.lastCalculatedDistance;

            if (distanceChange >= 0.005) {
                const currentPace = duration / distance; // seconds per kilometer

                // Filter out unrealistic paces (less than 2 min/km or more than 30 min/km)
                if (currentPace >= 120 && currentPace <= 1800) {
                    this.recentPaces.push(currentPace);
                    if (this.recentPaces.length > this.PACE_SMOOTHING_WINDOW) {
                        this.recentPaces.shift(); // Remove oldest
                    }
                    this.lastCalculatedDistance = distance;
                }
            }

            // Return smoothed pace if we have enough samples
            if (this.recentPaces.length >= 2) {
                // Use weighted average - recent paces matter more
                let weightedSum = 0;
                let totalWeight = 0;
                for (let i = 0; i < this.recentPaces.length; i++) {
                    const weight = i + 1; // Later values have higher weight
                    weightedSum += this.recentPaces[i] * weight;
                    totalWeight += weight;
                }
                averagePace = weightedSum / totalWeight;
            } else if (this.recentPaces.length === 1) {
                averagePace = this.recentPaces[0];
            }
        }

        // Calculate captured area and polygon using valid locations
        const capturedPolygon = this.getCapturedPolygon(this.validLocations);
        const capturedArea = capturedPolygon.area;

        return {
            distance,
            duration,
            averagePace,
            capturedArea,
            locations: [...this.smoothedLocations], // Return smoothed locations for route display
            capturedPolygon, // Include polygon for territory capture
        };
    }

    private calculateDistance(point1: LocationPoint, point2: LocationPoint): number {
        const R = 6371; // Earth's radius in kilometers
        const dLat = this.toRad(point2.latitude - point1.latitude);
        const dLon = this.toRad(point2.longitude - point1.longitude);
        const lat1 = this.toRad(point1.latitude);
        const lat2 = this.toRad(point2.latitude);

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    private toRad(degrees: number): number {
        return (degrees * Math.PI) / 180;
    }

    /**
     * Check if the route forms a loop (start and end within threshold)
     */
    private isLoop(locations: LocationPoint[]): boolean {
        if (locations.length < 3) return false;

        const start = locations[0];
        const end = locations[locations.length - 1];
        const distanceKm = this.calculateDistance(start, end);
        const distanceMeters = distanceKm * 1000;

        return distanceMeters <= LOOP_THRESHOLD_METERS;
    }

    /**
     * Get closed polygon - if not a loop, close it with a line from end to start
     */
    getCapturedPolygon(locations: LocationPoint[]): CapturedPolygon {
        if (locations.length < 3) {
            return {
                coordinates: [],
                area: 0,
                isLoop: false,
            };
        }

        const isLoop = this.isLoop(locations);

        // Create coordinates array
        const coordinates = locations.map(loc => ({
            latitude: loc.latitude,
            longitude: loc.longitude,
        }));

        // If not a loop, close the polygon by adding start point
        if (!isLoop && coordinates.length > 0) {
            coordinates.push({
                latitude: locations[0].latitude,
                longitude: locations[0].longitude,
            });
        }

        // Calculate area using Shoelace formula
        const area = this.calculatePolygonArea(coordinates);

        return {
            coordinates,
            area,
            isLoop,
        };
    }

    /**
     * Calculate polygon area using Shoelace formula (Surveyor's formula)
     * Returns area in square meters
     */
    private calculatePolygonArea(coordinates: { latitude: number; longitude: number }[]): number {
        if (coordinates.length < 3) return 0;

        // Convert lat/lng to meters relative to first point
        const origin = coordinates[0];
        const metersPerDegreeLat = 111320; // meters per degree of latitude
        const metersPerDegreeLng = 111320 * Math.cos(this.toRad(origin.latitude));

        const points = coordinates.map(coord => ({
            x: (coord.longitude - origin.longitude) * metersPerDegreeLng,
            y: (coord.latitude - origin.latitude) * metersPerDegreeLat,
        }));

        // Shoelace formula
        let area = 0;
        for (let i = 0; i < points.length; i++) {
            const j = (i + 1) % points.length;
            area += points[i].x * points[j].y;
            area -= points[j].x * points[i].y;
        }

        return Math.abs(area / 2);
    }

    /**
     * Calculate area for backwards compatibility (uses polygon area)
     */
    private calculateArea(locations: LocationPoint[]): number {
        const polygon = this.getCapturedPolygon(locations);
        return polygon.area;
    }

    private reset(): void {
        this.startTime = 0;
        this.pauseTime = 0;
        this.totalPausedDuration = 0;
        this.locations = [];
        this.validLocations = [];
        this.smoothedLocations = [];
        this.recentPaces = [];
        this.onLocationUpdate = undefined;
        this.onStatsUpdate = undefined;

        // Reset pace/distance tracking
        this.lastCalculatedDistance = 0;
        this.cachedDistance = 0;
        this.lastValidLocationTime = 0;

        // Reset Firebase sync state
        this.sessionId = null;
        this.userId = null;
        this.locationBatchBuffer = [];
        this.batchIndex = 0;
    }
}

export const runTrackingService = new RunTrackingService();
