import React, { useRef, useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, Dimensions, Animated, Easing } from 'react-native';
import { GLView } from 'expo-gl';
import { Renderer } from 'expo-three';
import * as THREE from 'three';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface GlobeProps {
    userLocation?: { latitude: number; longitude: number };
    territories?: {
        coordinates: { latitude: number; longitude: number }[];
        color: string;
    }[];
    onGlobeReady?: () => void;
}

// Convert lat/lng to 3D coordinates on sphere
export function latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);

    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);

    return new THREE.Vector3(x, y, z);
}

// Create procedural Earth texture
function createEarthTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;

    // Deep ocean gradient
    const oceanGradient = ctx.createLinearGradient(0, 0, 2048, 1024);
    oceanGradient.addColorStop(0, '#0a1628');
    oceanGradient.addColorStop(0.5, '#0d1d35');
    oceanGradient.addColorStop(1, '#0a1628');
    ctx.fillStyle = oceanGradient;
    ctx.fillRect(0, 0, 2048, 1024);

    // Draw continent shapes (simplified world map)
    ctx.fillStyle = '#1a4538';

    // North America
    ctx.beginPath();
    ctx.moveTo(200, 200);
    ctx.bezierCurveTo(300, 180, 400, 220, 450, 350);
    ctx.bezierCurveTo(400, 420, 300, 450, 220, 400);
    ctx.bezierCurveTo(150, 350, 180, 250, 200, 200);
    ctx.fill();

    // South America
    ctx.beginPath();
    ctx.moveTo(380, 480);
    ctx.bezierCurveTo(420, 500, 450, 600, 420, 750);
    ctx.bezierCurveTo(380, 820, 340, 780, 350, 680);
    ctx.bezierCurveTo(330, 580, 350, 500, 380, 480);
    ctx.fill();

    // Europe
    ctx.beginPath();
    ctx.ellipse(1000, 280, 100, 60, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Africa
    ctx.beginPath();
    ctx.moveTo(950, 380);
    ctx.bezierCurveTo(1050, 350, 1100, 450, 1080, 600);
    ctx.bezierCurveTo(1040, 700, 950, 680, 920, 580);
    ctx.bezierCurveTo(900, 480, 920, 400, 950, 380);
    ctx.fill();

    // Asia
    ctx.beginPath();
    ctx.moveTo(1100, 200);
    ctx.bezierCurveTo(1300, 180, 1500, 220, 1600, 300);
    ctx.bezierCurveTo(1650, 400, 1600, 480, 1450, 450);
    ctx.bezierCurveTo(1300, 420, 1150, 380, 1100, 300);
    ctx.closePath();
    ctx.fill();

    // India
    ctx.beginPath();
    ctx.moveTo(1250, 420);
    ctx.bezierCurveTo(1280, 440, 1290, 520, 1260, 560);
    ctx.bezierCurveTo(1230, 540, 1220, 480, 1250, 420);
    ctx.fill();

    // Australia
    ctx.beginPath();
    ctx.ellipse(1550, 650, 100, 70, 0.1, 0, Math.PI * 2);
    ctx.fill();

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
}

export default function Globe3D({ userLocation, territories, onGlobeReady }: GlobeProps) {
    const [glContext, setGlContext] = useState<any>(null);
    const animationFrameRef = useRef<number | null>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const rendererRef = useRef<Renderer | null>(null);
    const earthRef = useRef<THREE.Mesh | null>(null);
    const markerRef = useRef<THREE.Mesh | null>(null);
    const glowRef = useRef<THREE.Mesh | null>(null);

    const onContextCreate = useCallback(async (gl: any) => {
        setGlContext(gl);

        // Create scene
        const scene = new THREE.Scene();
        sceneRef.current = scene;

        // Create camera
        const camera = new THREE.PerspectiveCamera(
            45,
            gl.drawingBufferWidth / gl.drawingBufferHeight,
            0.1,
            1000
        );
        camera.position.z = 5;
        cameraRef.current = camera;

        // Create renderer
        const renderer = new Renderer({ gl });
        renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);
        renderer.setClearColor(0x05090d, 1);
        rendererRef.current = renderer;

        // Add lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 3, 5);
        scene.add(directionalLight);

        // Create Earth
        const earthGeometry = new THREE.SphereGeometry(1.5, 64, 64);
        const earthMaterial = new THREE.MeshStandardMaterial({
            color: 0x1a4538,
            roughness: 0.8,
            metalness: 0.1,
        });
        const earth = new THREE.Mesh(earthGeometry, earthMaterial);
        scene.add(earth);
        earthRef.current = earth;

        // Create atmosphere glow
        const glowGeometry = new THREE.SphereGeometry(1.6, 64, 64);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0x4a9eff,
            transparent: true,
            opacity: 0.1,
            side: THREE.BackSide,
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        scene.add(glow);
        glowRef.current = glow;

        // Create stars
        const starsGeometry = new THREE.BufferGeometry();
        const starPositions = new Float32Array(3000);
        for (let i = 0; i < 1000; i++) {
            const radius = 30 + Math.random() * 30;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);

            starPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
            starPositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            starPositions[i * 3 + 2] = radius * Math.cos(phi);
        }
        starsGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
        const starsMaterial = new THREE.PointsMaterial({
            size: 0.1,
            color: 0xffffff,
            transparent: true,
            opacity: 0.8,
        });
        const stars = new THREE.Points(starsGeometry, starsMaterial);
        scene.add(stars);

        // Create user location marker
        if (userLocation) {
            const markerPos = latLngToVector3(userLocation.latitude, userLocation.longitude, 1.55);
            const markerGeometry = new THREE.SphereGeometry(0.04, 16, 16);
            const markerMaterial = new THREE.MeshBasicMaterial({ color: 0x3B82F6 });
            const marker = new THREE.Mesh(markerGeometry, markerMaterial);
            marker.position.copy(markerPos);
            scene.add(marker);
            markerRef.current = marker;

            // Marker glow
            const markerGlowGeometry = new THREE.SphereGeometry(0.08, 16, 16);
            const markerGlowMaterial = new THREE.MeshBasicMaterial({
                color: 0x3B82F6,
                transparent: true,
                opacity: 0.3,
            });
            const markerGlow = new THREE.Mesh(markerGlowGeometry, markerGlowMaterial);
            markerGlow.position.copy(markerPos);
            scene.add(markerGlow);
        }

        // Animation loop
        let time = 0;
        const animate = () => {
            animationFrameRef.current = requestAnimationFrame(animate);
            time += 0.01;

            // Rotate earth slowly
            if (earthRef.current) {
                earthRef.current.rotation.y += 0.002;
            }
            if (glowRef.current) {
                glowRef.current.rotation.y += 0.002;
            }

            // Pulse marker
            if (markerRef.current) {
                const scale = 1 + Math.sin(time * 3) * 0.3;
                markerRef.current.scale.set(scale, scale, scale);
            }

            renderer.render(scene, camera);
            gl.endFrameEXP();
        };

        animate();

        if (onGlobeReady) {
            onGlobeReady();
        }
    }, [userLocation, onGlobeReady]);

    // Cleanup
    useEffect(() => {
        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, []);

    return (
        <View style={styles.container}>
            <GLView
                style={styles.glView}
                onContextCreate={onContextCreate}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#05090d',
    },
    glView: {
        flex: 1,
    },
});
