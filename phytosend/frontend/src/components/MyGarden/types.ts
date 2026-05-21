export interface CareEventItem {
    id: number;
    programmedDate: string;
    type: string;
    completed: boolean;
    completedDate?: string;
    notes?: string;
}

export interface PlantItem {
    id: number;
    plantName?: string;
    urlPhoto?: string;
    purchaseDate: string;
    deathDate?: string;
    nextWateringDate?: string;
    careEvents?: CareEventItem[];
    card: {
        id?: number;
        commonName: string;
        scientificName: string;
        family: string;
        urlDefaultPhoto: string;
        exposure?: string;
        waterFrequencyDays?: string;
        fertilization?: string;
        soil?: string;
    };
}

export interface PostItem {
    id: number;
    title: string;
    description: string;
    urlphoto?: string;
    URLPhoto?: string;
    creationDate: string;
    likesCount: number;
    commentsCount: number;
    author?: { username: string; profileImage?: string };
}

export interface PlantSuggestion {
    id: number;
    commonName: string;
    scientificName: string;
    urlDefaultPhoto: string;
}
