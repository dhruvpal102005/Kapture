import { collection, addDoc, getDocs, query, orderBy, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';

export interface Club {
    id: string;
    name: string;
    logoUrl?: string;
    country: string;
    countryCode: string;
    memberCount: number;
    isPublic: boolean;
    createdAt: any;
    createdBy: string;
    status: 'pending' | 'approved' | 'rejected';
}

export interface CreateClubData {
    name: string;
    logoUri?: string;
    country: string;
    countryCode: string;
    isPublic: boolean;
    createdBy: string;
}

class ClubService {
    private readonly COLLECTION_NAME = 'clubs';

    /**
     * Get all approved clubs
     */
    async getAllClubs(): Promise<Club[]> {
        try {
            const clubsRef = collection(db, this.COLLECTION_NAME);
            const q = query(clubsRef, orderBy('memberCount', 'desc'));
            const querySnapshot = await getDocs(q);

            const clubs: Club[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                clubs.push({
                    id: doc.id,
                    name: data.name,
                    logoUrl: data.logoUrl,
                    country: data.country,
                    countryCode: data.countryCode,
                    memberCount: data.memberCount || 0,
                    isPublic: data.isPublic ?? true,
                    createdAt: data.createdAt,
                    createdBy: data.createdBy,
                    status: data.status || 'pending',
                });
            });

            // Filter to show only approved clubs in the list
            const approvedClubs = clubs.filter((club) => club.status === 'approved');

            // If no clubs exist, return sample clubs for display
            if (approvedClubs.length === 0) {
                return this.getSampleClubs();
            }

            return approvedClubs;
        } catch (error) {
            console.error('Error fetching clubs:', error);
            // Return sample clubs on error
            return this.getSampleClubs();
        }
    }

    /**
     * Get sample clubs for display (when Firebase is empty)
     */
    private getSampleClubs(): Club[] {
        return [
            {
                id: 'sample-1',
                name: 'Indian Runners',
                country: 'India',
                countryCode: 'IN',
                memberCount: 5473,
                isPublic: true,
                status: 'approved',
                createdAt: null,
                createdBy: 'system',
            },
            {
                id: 'sample-2',
                name: 'INTVL Run Club',
                country: 'Australia',
                countryCode: 'AU',
                memberCount: 1233,
                isPublic: true,
                status: 'approved',
                createdAt: null,
                createdBy: 'system',
            },
            {
                id: 'sample-3',
                name: 'Track & XC',
                country: 'United States',
                countryCode: 'US',
                memberCount: 1056,
                isPublic: true,
                status: 'approved',
                createdAt: null,
                createdBy: 'system',
            },
            {
                id: 'sample-4',
                name: 'Team Germany',
                country: 'Germany',
                countryCode: 'DE',
                memberCount: 868,
                isPublic: true,
                status: 'approved',
                createdAt: null,
                createdBy: 'system',
            },
            {
                id: 'sample-5',
                name: 'Team France',
                country: 'France',
                countryCode: 'FR',
                memberCount: 500,
                isPublic: true,
                status: 'approved',
                createdAt: null,
                createdBy: 'system',
            },
        ];
    }

    /**
     * Create a new club
     */
    async createClub(clubData: CreateClubData): Promise<string | null> {
        try {
            let logoUrl: string | undefined;

            // Upload logo if provided
            if (clubData.logoUri) {
                logoUrl = await this.uploadClubLogo(clubData.logoUri, clubData.name);
            }

            // Create club document
            const clubRef = await addDoc(collection(db, this.COLLECTION_NAME), {
                name: clubData.name,
                logoUrl,
                country: clubData.country,
                countryCode: clubData.countryCode,
                memberCount: 0,
                isPublic: clubData.isPublic,
                createdBy: clubData.createdBy,
                status: 'pending', // All new clubs start as pending
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });

            return clubRef.id;
        } catch (error) {
            console.error('Error creating club:', error);
            return null;
        }
    }

    /**
     * Upload club logo to Firebase Storage
     */
    private async uploadClubLogo(uri: string, clubName: string): Promise<string> {
        try {
            const storage = getStorage();
            const response = await fetch(uri);
            const blob = await response.blob();
            const fileName = `clubs/${clubName.replace(/\s+/g, '_')}_${Date.now()}.jpg`;
            const storageRef = ref(storage, fileName);

            await uploadBytes(storageRef, blob);
            const downloadURL = await getDownloadURL(storageRef);
            return downloadURL;
        } catch (error) {
            console.error('Error uploading logo:', error);
            throw error;
        }
    }

    /**
     * Pick image from device
     */
    async pickImage(): Promise<string | null> {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                return null;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1], // Square aspect ratio
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                return result.assets[0].uri;
            }

            return null;
        } catch (error) {
            console.error('Error picking image:', error);
            return null;
        }
    }
}

export const clubService = new ClubService();

