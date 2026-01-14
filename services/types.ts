// Shared types for run tracking

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
