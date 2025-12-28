import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Globe3DProps {
    userLocation?: { latitude: number; longitude: number };
    territories?: {
        coordinates: { latitude: number; longitude: number }[];
        color: string;
    }[];
    onGlobeReady?: () => void;
}

// HTML/JS for 3D Globe using Three.js via CDN
const getGlobeHTML = (userLat: number, userLng: number) => `
<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            background: #05090d; 
            overflow: hidden;
            touch-action: none;
        }
        canvas { display: block; }
        #loading {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: #4a9eff;
            font-family: Arial, sans-serif;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div id="loading">Loading Globe...</div>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <script>
        const userLat = ${userLat};
        const userLng = ${userLng};
        
        // Hide loading
        document.getElementById('loading').style.display = 'none';
        
        // Scene setup
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 4;
        
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0x05090d, 1);
        renderer.setPixelRatio(window.devicePixelRatio);
        document.body.appendChild(renderer.domElement);
        
        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 3, 5);
        scene.add(directionalLight);
        
        // Stars
        const starsGeometry = new THREE.BufferGeometry();
        const starPositions = new Float32Array(3000);
        for (let i = 0; i < 1000; i++) {
            const radius = 50 + Math.random() * 50;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            starPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
            starPositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            starPositions[i * 3 + 2] = radius * Math.cos(phi);
        }
        starsGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
        const starsMaterial = new THREE.PointsMaterial({ size: 0.3, color: 0xffffff });
        const stars = new THREE.Points(starsGeometry, starsMaterial);
        scene.add(stars);
        
        // Load real Earth texture
        const textureLoader = new THREE.TextureLoader();
        
        // Earth sphere (will update with texture when loaded)
        const earthGeometry = new THREE.SphereGeometry(1.5, 64, 64);
        const earthMaterial = new THREE.MeshStandardMaterial({
            color: 0x1a4538, // Fallback color while loading
            roughness: 0.7,
            metalness: 0.1,
        });
        const earth = new THREE.Mesh(earthGeometry, earthMaterial);
        scene.add(earth);
        
        // Load NASA Blue Marble Earth texture
        // Dark/night side Earth texture for game aesthetic
        textureLoader.load(
            'https://unpkg.com/three-globe@2.31.1/example/img/earth-night.jpg',
            function(texture) {
                earthMaterial.map = texture;
                earthMaterial.color.setHex(0xffffff);
                earthMaterial.needsUpdate = true;
            },
            undefined,
            function(error) {
                console.log('Texture load failed, using fallback');
                // Create fallback dark earth texture with canvas
                const earthCanvas = document.createElement('canvas');
                earthCanvas.width = 2048;
                earthCanvas.height = 1024;
                const ctx = earthCanvas.getContext('2d');
                
                // Dark ocean
                ctx.fillStyle = '#0a1525';
                ctx.fillRect(0, 0, 2048, 1024);
                
                // Simplified continent outlines
                ctx.fillStyle = '#1a4030';
                ctx.strokeStyle = '#2a6050';
                ctx.lineWidth = 3;
                
                // North America
                ctx.beginPath();
                ctx.moveTo(180, 180);
                ctx.lineTo(280, 150);
                ctx.lineTo(380, 180);
                ctx.lineTo(450, 280);
                ctx.lineTo(480, 380);
                ctx.lineTo(420, 450);
                ctx.lineTo(320, 420);
                ctx.lineTo(220, 380);
                ctx.lineTo(160, 280);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                
                // South America
                ctx.beginPath();
                ctx.moveTo(380, 500);
                ctx.lineTo(420, 520);
                ctx.lineTo(450, 620);
                ctx.lineTo(420, 780);
                ctx.lineTo(370, 850);
                ctx.lineTo(340, 780);
                ctx.lineTo(360, 620);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                
                // Africa
                ctx.beginPath();
                ctx.moveTo(980, 380);
                ctx.lineTo(1080, 350);
                ctx.lineTo(1150, 420);
                ctx.lineTo(1130, 580);
                ctx.lineTo(1080, 720);
                ctx.lineTo(980, 680);
                ctx.lineTo(920, 550);
                ctx.lineTo(940, 420);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                
                // Europe
                ctx.beginPath();
                ctx.moveTo(950, 250);
                ctx.lineTo(1050, 230);
                ctx.lineTo(1100, 280);
                ctx.lineTo(1080, 350);
                ctx.lineTo(1000, 360);
                ctx.lineTo(940, 320);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                
                // Asia
                ctx.beginPath();
                ctx.moveTo(1100, 200);
                ctx.lineTo(1300, 160);
                ctx.lineTo(1500, 200);
                ctx.lineTo(1700, 280);
                ctx.lineTo(1750, 400);
                ctx.lineTo(1650, 480);
                ctx.lineTo(1450, 460);
                ctx.lineTo(1300, 500);
                ctx.lineTo(1280, 600);
                ctx.lineTo(1200, 550);
                ctx.lineTo(1150, 400);
                ctx.lineTo(1100, 320);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                
                // Australia
                ctx.beginPath();
                ctx.moveTo(1500, 650);
                ctx.lineTo(1620, 620);
                ctx.lineTo(1700, 680);
                ctx.lineTo(1680, 780);
                ctx.lineTo(1580, 800);
                ctx.lineTo(1500, 750);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                
                const fallbackTexture = new THREE.CanvasTexture(earthCanvas);
                earthMaterial.map = fallbackTexture;
                earthMaterial.color.setHex(0xffffff);
                earthMaterial.needsUpdate = true;
            }
        );
        
        // Atmosphere glow
        const glowGeometry = new THREE.SphereGeometry(1.58, 64, 64);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0x4a9eff,
            transparent: true,
            opacity: 0.12,
            side: THREE.BackSide,
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        scene.add(glow);
        
        // Outer glow ring
        const outerGlowGeometry = new THREE.SphereGeometry(1.68, 64, 64);
        const outerGlowMaterial = new THREE.MeshBasicMaterial({
            color: 0x4a9eff,
            transparent: true,
            opacity: 0.05,
            side: THREE.BackSide,
        });
        const outerGlow = new THREE.Mesh(outerGlowGeometry, outerGlowMaterial);
        scene.add(outerGlow);
        
        // Convert lat/lng to 3D position
        function latLngToVector3(lat, lng, radius) {
            const phi = (90 - lat) * (Math.PI / 180);
            const theta = (lng + 180) * (Math.PI / 180);
            const x = -(radius * Math.sin(phi) * Math.cos(theta));
            const z = radius * Math.sin(phi) * Math.sin(theta);
            const y = radius * Math.cos(phi);
            return new THREE.Vector3(x, y, z);
        }
        
        // User location marker
        const markerPos = latLngToVector3(userLat, userLng, 1.55);
        const markerGeometry = new THREE.SphereGeometry(0.04, 16, 16);
        const markerMaterial = new THREE.MeshBasicMaterial({ color: 0x3B82F6 });
        const marker = new THREE.Mesh(markerGeometry, markerMaterial);
        marker.position.copy(markerPos);
        scene.add(marker);
        
        // Marker glow
        const markerGlowGeometry = new THREE.SphereGeometry(0.08, 16, 16);
        const markerGlowMaterial = new THREE.MeshBasicMaterial({
            color: 0x3B82F6,
            transparent: true,
            opacity: 0.4,
        });
        const markerGlow = new THREE.Mesh(markerGlowGeometry, markerGlowMaterial);
        markerGlow.position.copy(markerPos);
        scene.add(markerGlow);
        
        // Touch controls
        let isDragging = false;
        let isPinching = false;
        let previousTouchX = 0;
        let previousTouchY = 0;
        let previousPinchDistance = 0;
        let rotationVelocityX = 0;
        let rotationVelocityY = 0.002; // Auto rotation
        let targetCameraZ = 4; // Target zoom level
        const minZoom = 2.5; // Closest zoom
        const maxZoom = 8; // Farthest zoom
        
        // Calculate distance between two touch points
        function getTouchDistance(touches) {
            const dx = touches[0].clientX - touches[1].clientX;
            const dy = touches[0].clientY - touches[1].clientY;
            return Math.sqrt(dx * dx + dy * dy);
        }
        
        document.addEventListener('touchstart', (e) => {
            if (e.touches.length === 2) {
                // Pinch start
                isPinching = true;
                isDragging = false;
                previousPinchDistance = getTouchDistance(e.touches);
            } else if (e.touches.length === 1) {
                // Single finger drag
                isDragging = true;
                isPinching = false;
                previousTouchX = e.touches[0].clientX;
                previousTouchY = e.touches[0].clientY;
                rotationVelocityY = 0;
            }
        });
        
        document.addEventListener('touchmove', (e) => {
            if (isPinching && e.touches.length === 2) {
                // Handle pinch zoom
                const currentDistance = getTouchDistance(e.touches);
                const delta = currentDistance - previousPinchDistance;
                
                // Zoom in/out based on pinch
                targetCameraZ -= delta * 0.01;
                targetCameraZ = Math.max(minZoom, Math.min(maxZoom, targetCameraZ));
                
                previousPinchDistance = currentDistance;
            } else if (isDragging && e.touches.length === 1) {
                // Handle rotation
                const deltaX = e.touches[0].clientX - previousTouchX;
                const deltaY = e.touches[0].clientY - previousTouchY;
                earth.rotation.y += deltaX * 0.005;
                glow.rotation.y += deltaX * 0.005;
                outerGlow.rotation.y += deltaX * 0.005;
                previousTouchX = e.touches[0].clientX;
                previousTouchY = e.touches[0].clientY;
                rotationVelocityY = deltaX * 0.001;
            }
        });
        
        document.addEventListener('touchend', (e) => {
            if (e.touches.length === 0) {
                isDragging = false;
                isPinching = false;
                if (Math.abs(rotationVelocityY) < 0.001) {
                    rotationVelocityY = 0.002; // Resume auto rotation
                }
            } else if (e.touches.length === 1) {
                // Switched from pinch to single finger
                isPinching = false;
                isDragging = true;
                previousTouchX = e.touches[0].clientX;
                previousTouchY = e.touches[0].clientY;
            }
        });
        
        // Animation
        let time = 0;
        function animate() {
            requestAnimationFrame(animate);
            time += 0.016;
            
            // Smooth camera zoom
            camera.position.z += (targetCameraZ - camera.position.z) * 0.1;
            
            // Auto rotation when not dragging
            if (!isDragging && !isPinching) {
                earth.rotation.y += rotationVelocityY;
                glow.rotation.y += rotationVelocityY;
                outerGlow.rotation.y += rotationVelocityY;
                
                // Gradually slow down
                if (Math.abs(rotationVelocityY) > 0.002) {
                    rotationVelocityY *= 0.98;
                }
            }
            
            // Pulse marker
            const scale = 1 + Math.sin(time * 3) * 0.3;
            marker.scale.set(scale, scale, scale);
            markerGlow.scale.set(scale, scale, scale);
            
            // Update marker position with earth rotation
            const rotatedMarkerPos = markerPos.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), earth.rotation.y);
            marker.position.copy(rotatedMarkerPos);
            markerGlow.position.copy(rotatedMarkerPos);
            
            renderer.render(scene, camera);
        }
        
        animate();
        
        // Handle resize
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
        
        // Notify React Native that globe is ready
        if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage('GLOBE_READY');
        }
    </script>
</body>
</html>
`;

export default function Globe3DWebView({ userLocation, territories, onGlobeReady }: Globe3DProps) {
    const [isLoading, setIsLoading] = useState(true);
    const webViewRef = useRef<WebView>(null);

    // Default to Mumbai if no location
    const lat = userLocation?.latitude ?? 19.076;
    const lng = userLocation?.longitude ?? 72.8777;

    const handleMessage = (event: any) => {
        if (event.nativeEvent.data === 'GLOBE_READY') {
            setIsLoading(false);
            onGlobeReady?.();
        }
    };

    return (
        <View style={styles.container}>
            <WebView
                ref={webViewRef}
                source={{ html: getGlobeHTML(lat, lng) }}
                style={styles.webview}
                scrollEnabled={false}
                bounces={false}
                javaScriptEnabled={true}
                onMessage={handleMessage}
                originWhitelist={['*']}
            />
            {isLoading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#4a9eff" />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#05090d',
    },
    webview: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#05090d',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
