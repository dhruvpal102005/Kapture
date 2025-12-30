import { RunStats } from '@/services/runTrackingService';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface PostRunModalProps {
    visible: boolean;
    stats: RunStats;
    onSave: () => void;
    onDiscard: () => void;
}

export default function PostRunModal({ visible, stats, onSave, onDiscard }: PostRunModalProps) {
    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const formatPace = (paceSeconds: number): string => {
        if (paceSeconds === 0 || !isFinite(paceSeconds)) return '0:00';
        const mins = Math.floor(paceSeconds / 60);
        const secs = Math.floor(paceSeconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <Modal visible={visible} transparent animationType="slide">
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    <Text style={styles.title}>Run Complete!</Text>

                    <View style={styles.statsContainer}>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{stats.distance.toFixed(2)}</Text>
                            <Text style={styles.statUnit}>km</Text>
                            <Text style={styles.statLabel}>Distance</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{formatTime(stats.duration)}</Text>
                            <Text style={styles.statLabel}>Duration</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{formatPace(stats.averagePace)}</Text>
                            <Text style={styles.statLabel}>Avg Pace</Text>
                        </View>
                    </View>

                    <View style={styles.buttonRow}>
                        <TouchableOpacity style={styles.discardButton} onPress={onDiscard}>
                            <Text style={styles.discardText}>Discard run</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.saveButton} onPress={onSave}>
                            <Text style={styles.saveText}>Save run</Text>
                        </TouchableOpacity>
                    </View>
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
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 24,
        width: '100%',
        maxWidth: 400,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 24,
        textAlign: 'center',
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 32,
        paddingVertical: 16,
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 28,
        fontWeight: '700',
        color: '#1A1A1A',
    },
    statUnit: {
        fontSize: 14,
        fontWeight: '500',
        color: '#666',
        marginTop: -4,
    },
    statLabel: {
        fontSize: 12,
        color: '#888',
        marginTop: 4,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 12,
    },
    discardButton: {
        flex: 1,
        paddingVertical: 14,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E5E5',
        borderRadius: 12,
    },
    discardText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
    },
    saveButton: {
        flex: 1,
        paddingVertical: 14,
        alignItems: 'center',
        backgroundColor: '#1A1A1A',
        borderRadius: 12,
    },
    saveText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
});

