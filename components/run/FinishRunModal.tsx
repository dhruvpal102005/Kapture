import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Animated, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface FinishRunModalProps {
    visible: boolean;
    onFinish: () => void;
    onClose: () => void;
}

export default function FinishRunModal({ visible, onFinish, onClose }: FinishRunModalProps) {
    const [holdProgress, setHoldProgress] = useState(0);
    const [isHolding, setIsHolding] = useState(false);
    const progressAnim = React.useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (isHolding) {
            // Animate progress over 2 seconds
            Animated.timing(progressAnim, {
                toValue: 1,
                duration: 2000,
                useNativeDriver: false,
            }).start(() => {
                if (isHolding) {
                    onFinish();
                }
            });
        } else {
            // Reset progress
            Animated.timing(progressAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: false,
            }).start();
        }
    }, [isHolding]);

    const handlePressIn = () => {
        setIsHolding(true);
    };

    const handlePressOut = () => {
        setIsHolding(false);
    };

    const progressWidth = progressAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%'],
    });

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Ionicons name="close" size={24} color="#1A1A1A" />
                    </TouchableOpacity>
                    <Text style={styles.title}>I'M FINISHED RUNNING</Text>
                    <Text style={styles.message}>
                        Great job! Well done on finishing your run. Let's just confirm you're done
                        so we don't end it early.
                    </Text>
                    <TouchableOpacity
                        style={styles.finishButton}
                        onPressIn={handlePressIn}
                        onPressOut={handlePressOut}
                        activeOpacity={0.9}
                    >
                        <View style={styles.progressBarContainer}>
                            <Animated.View style={[styles.progressBar, { width: progressWidth }]} />
                        </View>
                        <Ionicons name="square" size={20} color="#FFFFFF" style={styles.finishIcon} />
                        <Text style={styles.finishText}>Finish my run</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={onClose}>
                        <Text style={styles.discardText}>Discard run</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modal: {
        backgroundColor: '#FF6B6B',
        borderRadius: 16,
        padding: 24,
        width: '100%',
        maxWidth: 400,
        position: 'relative',
    },
    closeButton: {
        position: 'absolute',
        top: 16,
        right: 16,
        width: 32,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 16,
        textAlign: 'center',
        textTransform: 'uppercase',
    },
    message: {
        fontSize: 14,
        color: '#FFFFFF',
        lineHeight: 20,
        marginBottom: 24,
        textAlign: 'center',
    },
    finishButton: {
        backgroundColor: '#1A1A1A',
        borderRadius: 12,
        paddingVertical: 16,
        paddingHorizontal: 24,
        marginBottom: 16,
        overflow: 'hidden',
        position: 'relative',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    progressBarContainer: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        right: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    progressBar: {
        height: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
    },
    finishIcon: {
        marginRight: 8,
    },
    finishText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    discardText: {
        fontSize: 14,
        color: '#FFFFFF',
        textAlign: 'center',
        textDecorationLine: 'underline',
    },
});

