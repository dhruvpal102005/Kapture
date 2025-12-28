import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '@clerk/clerk-expo';
import { Image } from 'expo-image';

interface SideActionButtonsProps {
    onNotificationPress?: () => void;
    onProfilePress?: () => void;
    onLocationPress?: () => void;
    onHelpPress?: () => void;
    onAddPress?: () => void;
}

export default function SideActionButtons({
    onNotificationPress,
    onProfilePress,
    onLocationPress,
    onHelpPress,
    onAddPress,
}: SideActionButtonsProps) {
    const { user } = useUser();

    // Get user initials for avatar fallback
    const initials = user?.firstName?.[0]?.toUpperCase() || 'U';

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

            {/* Location marker */}
            <TouchableOpacity style={styles.actionButton} onPress={onLocationPress}>
                <View style={styles.locationIcon}>
                    <View style={styles.locationPin} />
                    <View style={styles.locationDot} />
                </View>
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
    actionButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    locationIcon: {
        alignItems: 'center',
    },
    locationPin: {
        width: 18,
        height: 24,
        backgroundColor: '#8B5CF6',
        borderRadius: 9,
        borderBottomLeftRadius: 3,
        borderBottomRightRadius: 3,
    },
    locationDot: {
        position: 'absolute',
        top: 6,
        width: 6,
        height: 6,
        backgroundColor: '#FFFFFF',
        borderRadius: 3,
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
