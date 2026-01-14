// Shared types for run tracking

export interface LocationPoint {
    latitude: number;
    longitude: number;
    timestamp: number;
    accuracy?: number;
}

export interface CapturedPolygon {
    coordinates: { latitude: number; longitude: number }[];
    area: number; // in square meters
    isLoop: boolean; // true if user completed a loop, false if auto-closed
}

export interface RunStats {
    distance: number; // in kilometers
    duration: number; // in seconds
    averagePace: number; // in seconds per kilometer
    capturedArea: number; // in square meters
    locations: LocationPoint[];
    capturedPolygon?: CapturedPolygon; // Territory captured during run
}
