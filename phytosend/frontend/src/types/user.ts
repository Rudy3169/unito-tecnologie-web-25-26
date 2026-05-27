export interface UserProfile {
    id: number;
    name: string;
    surname: string;
    email: string;
    city?: string;
    phoneNumber?: string;
    bio?: string;
    birthDate?: string;
    role: string;
    postsCount: number;
    plantsCount: number;
    profilePhotoUrl?: string;
}

export interface UserResult {
    id: number;
    name: string;
    surname: string;
    email: string;
    role: string;
    profilePhotoUrl?: string;
}
