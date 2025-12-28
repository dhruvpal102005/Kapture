// Onboarding screen data configuration
// Each step defines the message, map region, and any shapes to display

export interface OnboardingStep {
    id: number;
    message: string;
    mapRegion: {
        latitude: number;
        longitude: number;
        latitudeDelta: number;
        longitudeDelta: number;
    };
    shapes?: ShapeConfig[];
    showAreaCounter?: boolean;
    areaValue?: number;
    areaColor?: string;
    showOptions?: boolean;
    options?: { label: string; value: string }[];
    optionType?: 'unit' | 'color';
}

export interface ShapeConfig {
    type: 'polygon' | 'polyline' | 'circle';
    coordinates: { latitude: number; longitude: number }[];
    strokeColor: string;
    fillColor: string;
    animate?: boolean;
    pulse?: boolean;
    centerCoordinate?: { latitude: number; longitude: number };
    radius?: number;
}

// Mumbai, India coordinates
const MUMBAI_CENTER = {
    latitude: 19.0760,
    longitude: 72.8777,
};

export const onboardingSteps: OnboardingStep[] = [
    // Screen 1: Welcome
    {
        id: 1,
        message: "Welcome [NAME]! This is a game of territory. Let's get you started!",
        mapRegion: {
            latitude: MUMBAI_CENTER.latitude,
            longitude: MUMBAI_CENTER.longitude,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
        },
    },
    // Screen 2: Claim territory (pink polygon) - Real roads from OSRM API
    {
        id: 2,
        message: "Run to claim territory, but make sure your start and end points are within 200 metres for it to count!",
        mapRegion: {
            // Shivaji Park area - centered on the route
            latitude: 19.027,
            longitude: 72.839,
            latitudeDelta: 0.012,
            longitudeDelta: 0.012,
        },
        shapes: [
            {
                type: 'polygon',
                coordinates: [
                    // Real road coordinates from OSRM walking route
                    // Following: Dr Madhukar B. Raut Marg → Lady Jamshedji Road → N C Kelkar Marg → Swatantrya Veer Savarkar Marg
                    { latitude: 19.030519, longitude: 72.836922 },
                    { latitude: 19.029822, longitude: 72.838147 },
                    { latitude: 19.028856, longitude: 72.839809 },
                    { latitude: 19.028276, longitude: 72.840745 },
                    { latitude: 19.028556, longitude: 72.841347 },
                    { latitude: 19.029488, longitude: 72.841566 },
                    { latitude: 19.030378, longitude: 72.841756 },
                    { latitude: 19.031533, longitude: 72.842002 },
                    { latitude: 19.029987, longitude: 72.841764 },
                    { latitude: 19.028553, longitude: 72.841461 },
                    { latitude: 19.026544, longitude: 72.841041 },
                    { latitude: 19.025602, longitude: 72.840868 },
                    { latitude: 19.025077, longitude: 72.840595 },
                    { latitude: 19.025507, longitude: 72.840007 },
                    { latitude: 19.025179, longitude: 72.840456 },
                    { latitude: 19.023652, longitude: 72.839326 },
                    { latitude: 19.022771, longitude: 72.838586 },
                    { latitude: 19.023241, longitude: 72.838313 },
                    { latitude: 19.024288, longitude: 72.837704 },
                    { latitude: 19.024857, longitude: 72.836803 },
                    { latitude: 19.025309, longitude: 72.836036 },
                    { latitude: 19.025974, longitude: 72.836052 },
                    { latitude: 19.026426, longitude: 72.836305 },
                    { latitude: 19.027891, longitude: 72.83709 },
                    { latitude: 19.028368, longitude: 72.837351 },
                    { latitude: 19.02871, longitude: 72.837537 },
                    { latitude: 19.028965, longitude: 72.836976 },
                    { latitude: 19.029313, longitude: 72.837866 },
                    { latitude: 19.029822, longitude: 72.838147 },
                ],
                strokeColor: '#FF6B6B',
                fillColor: 'rgba(255, 107, 107, 0.4)',
                animate: true,
            },
        ],
    },
    // Screen 3: Others can steal (blue polygon) - Juhu area
    {
        id: 3,
        message: "However! others can steal some or all of your territory if they run after you.",
        mapRegion: {
            latitude: 19.1075,
            longitude: 72.8263,
            latitudeDelta: 0.012,
            longitudeDelta: 0.012,
        },
        shapes: [
            {
                type: 'polygon',
                coordinates: [
                    { latitude: 19.1100, longitude: 72.8220 },
                    { latitude: 19.1120, longitude: 72.8280 },
                    { latitude: 19.1060, longitude: 72.8320 },
                    { latitude: 19.1040, longitude: 72.8260 },
                    { latitude: 19.1080, longitude: 72.8200 },
                ],
                strokeColor: '#4A7CFF',
                fillColor: 'rgba(74, 124, 255, 0.4)',
                animate: true,
            },
        ],
    },
    // Screen 4: Unit preference - Same as Screen 3
    {
        id: 4,
        message: "What is your preferred unit of measurement for distance?",
        mapRegion: {
            latitude: 19.1075,
            longitude: 72.8263,
            latitudeDelta: 0.012,
            longitudeDelta: 0.012,
        },
        showOptions: true,
        options: [
            { label: 'Kilometers', value: 'km' },
            { label: 'Miles', value: 'mi' },
        ],
        optionType: 'unit',
    },
    // Screen 5: Circle = most territory - Oval Maidan area
    {
        id: 5,
        message: "Running in a circle will capture the most territory.",
        mapRegion: {
            latitude: 18.9322,
            longitude: 72.8264,
            latitudeDelta: 0.008,
            longitudeDelta: 0.008,
        },
        shapes: [
            {
                type: 'circle',
                coordinates: [],
                centerCoordinate: { latitude: 18.9322, longitude: 72.8264 },
                radius: 150,
                strokeColor: '#7CFF6B',
                fillColor: 'rgba(124, 255, 107, 0.3)',
                animate: true,
            },
        ],
        showAreaCounter: true,
        areaValue: 875,
        areaColor: '#7CFF6B',
    },
    // Screen 6: Square = good too - Shivaji Park area
    {
        id: 6,
        message: "Running in a square shape will still get you a good amount of territory.",
        mapRegion: {
            latitude: 19.0285,
            longitude: 72.8385,
            latitudeDelta: 0.008,
            longitudeDelta: 0.008,
        },
        shapes: [
            {
                type: 'polygon',
                coordinates: [
                    { latitude: 19.0300, longitude: 72.8360 },
                    { latitude: 19.0300, longitude: 72.8410 },
                    { latitude: 19.0260, longitude: 72.8410 },
                    { latitude: 19.0260, longitude: 72.8360 },
                ],
                strokeColor: '#FFA500',
                fillColor: 'rgba(255, 165, 0, 0.3)',
                animate: true,
            },
        ],
        showAreaCounter: true,
        areaValue: 625,
        areaColor: '#FFA500',
    },
    // Screen 7: Avoid out and back - Marine Drive
    {
        id: 7,
        message: "Try to avoid running out and back as it won't capture much territory.",
        mapRegion: {
            latitude: 18.9440,
            longitude: 72.8230,
            latitudeDelta: 0.012,
            longitudeDelta: 0.012,
        },
        shapes: [
            {
                type: 'polygon',
                coordinates: [
                    { latitude: 18.9480, longitude: 72.8225 },
                    { latitude: 18.9480, longitude: 72.8235 },
                    { latitude: 18.9400, longitude: 72.8235 },
                    { latitude: 18.9400, longitude: 72.8225 },
                ],
                strokeColor: '#FF4444',
                fillColor: 'rgba(255, 68, 68, 0.4)',
                animate: true,
                pulse: true,
            },
        ],
        showAreaCounter: true,
        areaValue: 78,
        areaColor: '#FF4444',
    },
    // Screen 8: Color picker - South Mumbai
    {
        id: 8,
        message: "Your territories will be marked in a colour of your choice. Pick one that stands out to you.",
        mapRegion: {
            latitude: 18.9388,
            longitude: 72.8354,
            latitudeDelta: 0.018,
            longitudeDelta: 0.018,
        },
        showOptions: true,
        optionType: 'color',
    },
];

// Color options for the color picker
export const colorOptions = [
    '#4ADE80', // Green
    '#FB923C', // Orange
    '#3B82F6', // Blue
    '#FACC15', // Yellow
    '#F472B6', // Pink
    '#A78BFA', // Purple
    '#6B7280', // Gray
    '#D97706', // Amber
    '#14B8A6', // Teal
    '#06B6D4', // Cyan
    '#F87171', // Red
    '#34D399', // Emerald
];
