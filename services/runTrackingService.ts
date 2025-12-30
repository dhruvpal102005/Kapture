import * as Location from 'expo-location';

export interface LocationPoint {
    latitude: number;
    longitude: number;
    timestamp: number;
    accuracy?: number;
}

export interface RunStats {
    distance: number; // in kilometers
    duration: number; // in seconds
    averagePace: number; // in seconds per kilometer
    capturedArea: number; // in square meters
    locations: LocationPoint[];
}

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

    // GPS filtering constants
    private readonly MIN_DISTANCE_THRESHOLD = 0.008; // ~8 meters in kilometers (filters GPS noise)
    private readonly MAX_ACCURACY = 50; // Ignore readings with accuracy worse than 50 meters
    private readonly MIN_ACCURACY = 3; // Prefer readings with accuracy better than 3 meters
    private readonly PACE_SMOOTHING_WINDOW = 5; // Number of recent pace values for smoothing

    private recentPaces: number[] = []; // For pace smoothing

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
                        // Update stats only when we have valid movement
                        this.updateStats();
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

        const finalStats = this.getStats();
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
        let distance = 0;
        for (let i = 1; i < this.validLocations.length; i++) {
            const prev = this.validLocations[i - 1];
            const curr = this.validLocations[i];
            distance += this.calculateDistance(prev, curr);
        }

        // Calculate smoothed average pace
        let averagePace = 0;
        if (distance > 0 && duration > 0) {
            const currentPace = duration / distance; // seconds per kilometer

            // Add to recent paces for smoothing
            this.recentPaces.push(currentPace);
            if (this.recentPaces.length > this.PACE_SMOOTHING_WINDOW) {
                this.recentPaces.shift(); // Remove oldest
            }

            // Calculate smoothed pace (average of recent paces)
            const sum = this.recentPaces.reduce((a, b) => a + b, 0);
            averagePace = sum / this.recentPaces.length;
        } else {
            // If no distance, pace should be 0 or undefined
            averagePace = 0;
            this.recentPaces = []; // Reset when stationary
        }

        // Calculate captured area using valid locations
        const capturedArea = this.calculateArea(this.validLocations);

        return {
            distance,
            duration,
            averagePace,
            capturedArea,
            locations: [...this.locations], // Return all locations for route display
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

    private calculateArea(locations: LocationPoint[]): number {
        if (locations.length < 3) return 0;

        // Calculate bounding box area (simplified)
        const lats = locations.map((l) => l.latitude);
        const lngs = locations.map((l) => l.longitude);
        const minLat = Math.min(...lats);
        const maxLat = Math.max(...lats);
        const minLng = Math.min(...lngs);
        const maxLng = Math.max(...lngs);

        // Approximate area using bounding box
        const latDiff = maxLat - minLat;
        const lngDiff = maxLng - minLng;
        const avgLat = (minLat + maxLat) / 2;

        // Convert to meters
        const latMeters = latDiff * 111320; // 1 degree latitude ≈ 111320 meters
        const lngMeters = lngDiff * 111320 * Math.cos(this.toRad(avgLat));

        return latMeters * lngMeters;
    }

    private reset(): void {
        this.startTime = 0;
        this.pauseTime = 0;
        this.totalPausedDuration = 0;
        this.locations = [];
        this.validLocations = [];
        this.recentPaces = [];
        this.onLocationUpdate = undefined;
        this.onStatsUpdate = undefined;
    }
}

export const runTrackingService = new RunTrackingService();
