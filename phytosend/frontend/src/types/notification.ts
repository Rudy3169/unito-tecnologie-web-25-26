export interface NotificationData {
    id: number;
    actorId?: number;
    actorName?: string;
    actorProfilePhotoUrl?: string;
    type: 'LIKE_POST' | 'COMMENT' | 'REPLY' | 'LIKE_COMMENT' | 'CARE_WATER';
    referenceId?: number;
    secondaryReferenceId?: number;
    postAuthorId?: number;
    message: string;
    read: boolean;
    createdAt: string;
}
