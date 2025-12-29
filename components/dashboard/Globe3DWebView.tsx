import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { ActivityIndicator, Dimensions, StyleSheet, View } from 'react-native';
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

export interface Globe3DWebViewRef {
    zoomToLocation: (lat: number, lng: number) => void;
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
        let rotationVelocityX = 0; // Vertical rotation velocity
        let rotationVelocityY = 0.002; // Horizontal auto rotation
        let targetCameraZ = 4; // Target zoom level
        const minZoom = 2.5; // Closest zoom
        const maxZoom = 8; // Farthest zoom
        const maxRotationX = Math.PI / 3; // Limit vertical rotation to ±60 degrees
        
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
                rotationVelocityX = 0;
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
                // Handle rotation - both horizontal and vertical
                const deltaX = e.touches[0].clientX - previousTouchX;
                const deltaY = e.touches[0].clientY - previousTouchY;
                
                // Horizontal rotation (Y-axis)
                earth.rotation.y += deltaX * 0.005;
                glow.rotation.y += deltaX * 0.005;
                outerGlow.rotation.y += deltaX * 0.005;
                
                // Vertical rotation (X-axis) with limits
                const newRotationX = earth.rotation.x + deltaY * 0.005;
                if (Math.abs(newRotationX) < maxRotationX) {
                    earth.rotation.x = newRotationX;
                    glow.rotation.x = newRotationX;
                    outerGlow.rotation.x = newRotationX;
                }
                
                previousTouchX = e.touches[0].clientX;
                previousTouchY = e.touches[0].clientY;
                rotationVelocityY = deltaX * 0.001;
                rotationVelocityX = deltaY * 0.001;
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
                // Horizontal rotation
                earth.rotation.y += rotationVelocityY;
                glow.rotation.y += rotationVelocityY;
                outerGlow.rotation.y += rotationVelocityY;
                
                // Vertical rotation with limits
                const newRotationX = earth.rotation.x + rotationVelocityX;
                if (Math.abs(newRotationX) < maxRotationX) {
                    earth.rotation.x = newRotationX;
                    glow.rotation.x = newRotationX;
                    outerGlow.rotation.x = newRotationX;
                } else {
                    rotationVelocityX = 0; // Stop vertical velocity if at limit
                }
                
                // Gradually slow down both rotations
                if (Math.abs(rotationVelocityY) > 0.002) {
                    rotationVelocityY *= 0.98;
                }
                if (Math.abs(rotationVelocityX) > 0.001) {
                    rotationVelocityX *= 0.98;
                } else {
                    rotationVelocityX = 0;
                }
            }
            
            // Pulse marker
            const scale = 1 + Math.sin(time * 3) * 0.3;
            marker.scale.set(scale, scale, scale);
            markerGlow.scale.set(scale, scale, scale);
            
            // Update marker position with earth rotation (both X and Y)
            const rotatedMarkerPos = markerPos.clone()
                .applyAxisAngle(new THREE.Vector3(0, 1, 0), earth.rotation.y)
                .applyAxisAngle(new THREE.Vector3(1, 0, 0), earth.rotation.x);
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
        
        // Expose zoom function to React Native
        window.zoomToLocation = function(lat, lng) {
            console.log('Zooming to location:', lat, lng);
            
            // Stop auto rotation during zoom
            rotationVelocityY = 0;
            rotationVelocityX = 0;
            
            // Store initial values for animation
            const startRotationY = earth.rotation.y;
            const startRotationX = earth.rotation.x;
            const startCameraZ = camera.position.z;
            const targetCameraZValue = 2.8; // Zoom level (closer = more zoomed in)
            
            // Calculate the target rotation to bring the marker to the front
            // The marker's initial theta is (lng + 180) degrees
            // We want it at 90 degrees (facing camera on +Z axis)
            const markerTheta = (lng + 180) * Math.PI / 180;
            const targetTheta = Math.PI / 2; // 90 degrees - facing camera
            const targetRotationY = targetTheta - markerTheta;
            
            // For vertical rotation, we want to center the view (X rotation = 0)
            const targetRotationX = 0;
            
            // Calculate rotation differences
            let rotationDiffY = targetRotationY - startRotationY;
            let rotationDiffX = targetRotationX - startRotationX;
            
            // Normalize rotation difference to shortest path (-PI to PI)
            while (rotationDiffY > Math.PI) rotationDiffY -= Math.PI * 2;
            while (rotationDiffY < -Math.PI) rotationDiffY += Math.PI * 2;
            
            console.log('Current rotation Y:', startRotationY, 'X:', startRotationX);
            console.log('Target rotation Y:', targetRotationY, 'X:', targetRotationX);
            console.log('Rotation diff Y:', rotationDiffY, 'X:', rotationDiffX);
            
            // Animation variables
            let progress = 0;
            const duration = 1200; // 1.2 second animation
            const startTime = Date.now();
            
            // Calculate base marker position (before any rotation)
            const baseMarkerPos = latLngToVector3(lat, lng, 1.55);
            
            function animateZoom() {
                const elapsed = Date.now() - startTime;
                progress = Math.min(elapsed / duration, 1);
                
                // Easing function (ease-in-out for smoother animation)
                const eased = progress < 0.5 
                    ? 4 * progress * progress * progress 
                    : 1 - Math.pow(-2 * progress + 2, 3) / 2;
                
                // Calculate current rotations
                const currentRotY = startRotationY + rotationDiffY * eased;
                const currentRotX = startRotationX + rotationDiffX * eased;
                
                // Rotate globe (both axes)
                earth.rotation.y = currentRotY;
                earth.rotation.x = currentRotX;
                glow.rotation.y = currentRotY;
                glow.rotation.x = currentRotX;
                outerGlow.rotation.y = currentRotY;
                outerGlow.rotation.x = currentRotX;
                
                // Zoom camera smoothly (move closer to globe)
                camera.position.z = startCameraZ + (targetCameraZValue - startCameraZ) * eased;
                
                // Update marker position based on current rotation (both axes)
                const rotatedMarkerPos = baseMarkerPos.clone()
                    .applyAxisAngle(new THREE.Vector3(0, 1, 0), currentRotY)
                    .applyAxisAngle(new THREE.Vector3(1, 0, 0), currentRotX);
                marker.position.copy(rotatedMarkerPos);
                markerGlow.position.copy(rotatedMarkerPos);
                
                if (progress < 1) {
                    requestAnimationFrame(animateZoom);
                } else {
                    // Ensure final positions are correct
                    const finalRotationY = startRotationY + rotationDiffY;
                    const finalRotationX = startRotationX + rotationDiffX;
                    earth.rotation.y = finalRotationY;
                    earth.rotation.x = finalRotationX;
                    glow.rotation.y = finalRotationY;
                    glow.rotation.x = finalRotationX;
                    outerGlow.rotation.y = finalRotationY;
                    outerGlow.rotation.x = finalRotationX;
                    
                    const finalRotatedPos = baseMarkerPos.clone()
                        .applyAxisAngle(new THREE.Vector3(0, 1, 0), finalRotationY)
                        .applyAxisAngle(new THREE.Vector3(1, 0, 0), finalRotationX);
                    marker.position.copy(finalRotatedPos);
                    markerGlow.position.copy(finalRotatedPos);
                    
                    // Update target camera Z for smooth zoom controls after animation
                    targetCameraZ = targetCameraZValue;
                    
                    console.log('Zoom animation complete');
                    
                    // Reset auto rotation after a delay
                    setTimeout(() => {
                        rotationVelocityY = 0.002;
                    }, 500);
                }
            }
            
            animateZoom();
        };
        
        // Notify React Native that globe is ready
        if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage('GLOBE_READY');
        }
    </script>
</body>
</html>
`;

const Globe3DWebView = forwardRef<Globe3DWebViewRef, Globe3DProps>(
    ({ userLocation, territories, onGlobeReady }, ref) => {
        const [isLoading, setIsLoading] = useState(true);
        const webViewRef = useRef<WebView>(null);

        // Default to Mumbai if no location
        const lat = userLocation?.latitude ?? 19.076;
        const lng = userLocation?.longitude ?? 72.8777;

        // Expose methods to parent component
        useImperativeHandle(ref, () => ({
            zoomToLocation: (targetLat: number, targetLng: number) => {
                if (webViewRef.current) {
                    // Use injectJavaScript to call the function in the WebView
                    webViewRef.current.injectJavaScript(
                        `window.zoomToLocation(${targetLat}, ${targetLng}); true;`
                    );
                }
            },
        }));

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
                    onError={(syntheticEvent) => {
                        const { nativeEvent } = syntheticEvent;
                        console.warn('WebView error: ', nativeEvent);
                    }}
                />
                {isLoading && (
                    <View style={styles.loadingOverlay}>
                        <ActivityIndicator size="large" color="#4a9eff" />
                    </View>
                )}
            </View>
        );
    }
);

Globe3DWebView.displayName = 'Globe3DWebView';

export default Globe3DWebView;

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
