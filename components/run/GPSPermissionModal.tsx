import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface GPSPermissionModalProps {
    visible: boolean;
    onAccept: () => void;
    onDeny: () => void;
}

export default function GPSPermissionModal({ visible, onAccept, onDeny }: GPSPermissionModalProps) {
    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    <Text style={styles.title}>Kapture collects location data</Text>
                    <Text style={styles.message}>
                        Kapture collects location data to track your runs using GPS so you can see
                        the distance ran as well as the pace. Even when the phone is locked or the
                        app isn't in the foreground the GPS location will still be collected.
                    </Text>
                    <View style={styles.buttonRow}>
                        <TouchableOpacity style={styles.denyButton} onPress={onDeny}>
                            <Text style={styles.denyText}>DENY</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.acceptButton} onPress={onAccept}>
                            <Text style={styles.acceptText}>ACCEPT</Text>
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
        borderRadius: 16,
        padding: 24,
        width: '100%',
        maxWidth: 400,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 16,
        textAlign: 'center',
    },
    message: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
        marginBottom: 24,
        textAlign: 'center',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    denyButton: {
        flex: 1,
        paddingVertical: 14,
        alignItems: 'center',
    },
    denyText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#EF4444',
    },
    acceptButton: {
        flex: 1,
        paddingVertical: 14,
        alignItems: 'center',
    },
    acceptText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#EF4444',
    },
});

