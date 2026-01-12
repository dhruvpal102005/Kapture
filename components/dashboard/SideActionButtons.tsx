import { useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface SideActionButtonsProps {
    onNotificationPress?: () => void;
    onProfilePress?: () => void;
    onHelpPress?: () => void;
    onAddPress?: () => void;
    onVisibilityToggle?: (visible: boolean) => void;
}

export default function SideActionButtons({
    onNotificationPress,
    onProfilePress,
    onHelpPress,
    onAddPress,
    onVisibilityToggle,
}: SideActionButtonsProps) {
    const { user } = useUser();
    const [isVisible, setIsVisible] = useState(true);

    // Get user initials for avatar fallback
    const initials = user?.firstName?.[0]?.toUpperCase() || 'U';

    const handleVisibilityToggle = () => {
        const newState = !isVisible;
        setIsVisible(newState);
        onVisibilityToggle?.(newState);
    };

    return (
        <View style={styles.container}>
            {/* Profile avatar */}
            <TouchableOpacity style={styles.avatarButton} onPress={onProfilePress}>
                {user?.imageUrl ? (
                    <Image
                        source={{ uri: user.imageUrl }}
                        style={styles.avatar}
                        contentFit="cover"
                    />
                ) : (
                    <View style={styles.avatarFallback}>
                        <Text style={styles.avatarText}>{initials}</Text>
                    </View>
                )}
            </TouchableOpacity>

            {/* Visibility toggle button */}
            <TouchableOpacity
                style={[
                    styles.visibilityButton,
                    isVisible ? styles.visibilityButtonExpanded : styles.visibilityButtonCollapsed
                ]}
                onPress={handleVisibilityToggle}
            >
                <Ionicons
                    name={isVisible ? 'eye' : 'eye-off'}
                    size={16}
                    color="#FFFFFF"
                />
            </TouchableOpacity>


            {/* Help button */}
            <TouchableOpacity style={styles.actionButton} onPress={onHelpPress}>
                <View style={styles.helpIcon}>
                    <Text style={styles.helpText}>?</Text>
                </View>
            </TouchableOpacity>

            {/* Add button */}
            <TouchableOpacity style={styles.addButton} onPress={onAddPress}>
                <Ionicons name="add" size={18} color="#00D9FF" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        right: 16,
        top: 100,
        alignItems: 'center',
        gap: 16,
    },
    avatarButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    avatar: {
        width: '100%',
        height: '100%',
    },
    avatarFallback: {
        width: '100%',
        height: '100%',
        backgroundColor: '#333',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    visibilityButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#8B5CF6', // Purple color
    },
    visibilityButtonExpanded: {
        // Active state - full purple
        backgroundColor: '#8B5CF6',
    },
    visibilityButtonCollapsed: {
        // Inactive state - dimmer purple
        backgroundColor: 'rgba(139, 92, 246, 0.6)',
    },
    actionButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    helpIcon: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        borderColor: '#FF6B6B',
        justifyContent: 'center',
        alignItems: 'center',
    },
    helpText: {
        color: '#FF6B6B',
        fontSize: 12,
        fontWeight: '600',
    },
    addButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(0, 217, 255, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
});

