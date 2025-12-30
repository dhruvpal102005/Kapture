import { COUNTRIES, Country } from '@/constants/countries';
import { clubService, CreateClubData } from '@/services/clubService';
import { useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function CreateClubScreen() {
    const router = useRouter();
    const { user } = useUser();
    const [clubName, setClubName] = useState('');
    const [logoUri, setLogoUri] = useState<string | null>(null);
    const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
    const [isPublic, setIsPublic] = useState(true);
    const [showCountryPicker, setShowCountryPicker] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const handlePickLogo = async () => {
        const uri = await clubService.pickImage();
        if (uri) {
            setLogoUri(uri);
        }
    };

    const handleSubmit = async () => {
        if (!clubName.trim()) {
            Alert.alert('Error', 'Please enter a club name');
            return;
        }

        if (!selectedCountry) {
            Alert.alert('Error', 'Please select a country');
            return;
        }

        if (!user?.id) {
            Alert.alert('Error', 'User not authenticated');
            return;
        }

        setSubmitting(true);

        try {
            const clubData: CreateClubData = {
                name: clubName.trim(),
                logoUri: logoUri || undefined,
                country: selectedCountry.name,
                countryCode: selectedCountry.code,
                isPublic,
                createdBy: user.id,
            };

            const clubId = await clubService.createClub(clubData);

            if (clubId) {
                // Navigate to success screen after a brief delay
                setTimeout(() => {
                    router.push('/clubs/success');
                }, 1000);
            } else {
                Alert.alert('Error', 'Failed to create club. Please try again.');
                setSubmitting(false);
            }
        } catch (error) {
            console.error('Error creating club:', error);
            Alert.alert('Error', 'Failed to create club. Please try again.');
            setSubmitting(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>TERRA CLUBS MODE FORM</Text>
                    <View style={styles.placeholder} />
                </View>

                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    {/* Club name input */}
                    <View style={styles.section}>
                        <Text style={styles.label}>Name of terra club</Text>
                        <TextInput
                            style={styles.input}
                            value={clubName}
                            onChangeText={setClubName}
                            placeholder="Enter club name"
                            placeholderTextColor="#999"
                        />
                    </View>

                    {/* Logo upload */}
                    <View style={styles.section}>
                        <Text style={styles.label}>Upload club logo</Text>
                        <View style={styles.logoContainer}>
                            {logoUri ? (
                                <Image source={{ uri: logoUri }} style={styles.logoPreview} />
                            ) : (
                                <View style={styles.logoPlaceholder}>
                                    <Ionicons name="cloud-upload-outline" size={40} color="#999" />
                                </View>
                            )}
                            <TouchableOpacity style={styles.uploadButton} onPress={handlePickLogo}>
                                <Text style={styles.uploadButtonText}>Upload club logo</Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.logoGuideline}>
                            Make sure your logo is a square image and doesn't have transparent edges
                            as it won't display properly on the Terra map.
                        </Text>
                        <Text style={styles.logoGuideline}>
                            If your logo has transparent edges, we will have to attempt to manually
                            fix it for you which will be time consuming and your application might
                            be denied.
                        </Text>

                        {/* Logo examples */}
                        <View style={styles.examplesContainer}>
                            <View style={styles.example}>
                                <View style={styles.goodExample}>
                                    <Text style={styles.exampleText}>INTVL</Text>
                                </View>
                                <View style={styles.exampleLabel}>
                                    <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                                    <Text style={styles.exampleLabelText}>Good photo</Text>
                                </View>
                            </View>
                            <View style={styles.example}>
                                <View style={styles.badExample}>
                                    <Text style={styles.exampleText}>INTVL</Text>
                                </View>
                                <View style={styles.exampleLabel}>
                                    <Ionicons name="close-circle" size={16} color="#EF4444" />
                                    <Text style={styles.exampleLabelText}>Bad photo</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Country selection */}
                    <View style={styles.section}>
                        <Text style={styles.label}>Select the Country your club is from</Text>
                        <TouchableOpacity
                            style={styles.countryButton}
                            onPress={() => setShowCountryPicker(!showCountryPicker)}
                        >
                            {selectedCountry ? (
                                <>
                                    <Text style={styles.countryFlag}>{selectedCountry.flag}</Text>
                                    <Text style={styles.countryButtonText}>{selectedCountry.name}</Text>
                                </>
                            ) : (
                                <Text style={styles.countryButtonPlaceholder}>Select country</Text>
                            )}
                            <Ionicons name="chevron-forward" size={20} color="#666" />
                        </TouchableOpacity>

                        {showCountryPicker && (
                            <View style={styles.countryPicker}>
                                <ScrollView style={styles.countryList} nestedScrollEnabled>
                                    {COUNTRIES.map((country) => (
                                        <TouchableOpacity
                                            key={country.code}
                                            style={styles.countryOption}
                                            onPress={() => {
                                                setSelectedCountry(country);
                                                setShowCountryPicker(false);
                                            }}
                                        >
                                            <Text style={styles.countryFlag}>{country.flag}</Text>
                                            <Text style={styles.countryOptionText}>{country.name}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>
                        )}
                    </View>

                    {/* Privacy setting */}
                    <View style={styles.section}>
                        <Text style={styles.label}>
                            Is your Terra club open to the public for anyone to join or invite only?
                        </Text>
                        <View style={styles.radioContainer}>
                            <TouchableOpacity
                                style={styles.radioOption}
                                onPress={() => setIsPublic(true)}
                            >
                                <View style={styles.radioButton}>
                                    {isPublic && <View style={styles.radioButtonInner} />}
                                </View>
                                <Text style={styles.radioLabel}>Open to the public</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.radioOption}
                                onPress={() => setIsPublic(false)}
                            >
                                <View style={styles.radioButton}>
                                    {!isPublic && <View style={styles.radioButtonInner} />}
                                </View>
                                <Text style={styles.radioLabel}>Invite only</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Submit button */}
                    <TouchableOpacity
                        style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
                        onPress={handleSubmit}
                        disabled={submitting}
                    >
                        {submitting ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <Text style={styles.submitButtonText}>Submit Application</Text>
                        )}
                    </TouchableOpacity>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#000000',
        borderBottomWidth: 1,
        borderBottomColor: '#1A1A1A',
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
        textTransform: 'uppercase',
    },
    placeholder: {
        width: 40,
    },
    content: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    section: {
        marginBottom: 24,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1A1A1A',
        marginBottom: 12,
    },
    input: {
        backgroundColor: '#F5F5F5',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: '#1A1A1A',
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 16,
    },
    logoPlaceholder: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#F5F5F5',
        borderWidth: 1,
        borderColor: '#E5E5E5',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    logoPreview: {
        width: 120,
        height: 120,
        borderRadius: 60,
        marginBottom: 16,
    },
    uploadButton: {
        backgroundColor: '#1A1A1A',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 24,
    },
    uploadButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    logoGuideline: {
        fontSize: 12,
        color: '#666',
        lineHeight: 18,
        marginBottom: 8,
    },
    examplesContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 16,
    },
    example: {
        flex: 1,
        alignItems: 'center',
    },
    goodExample: {
        width: 80,
        height: 80,
        backgroundColor: '#FF6B6B',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    badExample: {
        width: 80,
        height: 80,
        backgroundColor: '#FF6B6B',
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    exampleText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    exampleLabel: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    exampleLabelText: {
        fontSize: 12,
        color: '#666',
    },
    countryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 14,
        gap: 12,
    },
    countryButtonText: {
        flex: 1,
        fontSize: 16,
        color: '#1A1A1A',
    },
    countryButtonPlaceholder: {
        flex: 1,
        fontSize: 16,
        color: '#999',
    },
    countryFlag: {
        fontSize: 24,
    },
    countryPicker: {
        marginTop: 8,
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E5E5',
        maxHeight: 200,
    },
    countryList: {
        maxHeight: 200,
    },
    countryOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
    },
    countryOptionText: {
        flex: 1,
        fontSize: 16,
        color: '#1A1A1A',
    },
    radioContainer: {
        gap: 16,
    },
    radioOption: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    radioButton: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#EF4444',
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioButtonInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#EF4444',
    },
    radioLabel: {
        fontSize: 16,
        color: '#1A1A1A',
    },
    submitButton: {
        backgroundColor: '#1A1A1A',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 32,
    },
    submitButtonDisabled: {
        opacity: 0.6,
    },
    submitButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});

