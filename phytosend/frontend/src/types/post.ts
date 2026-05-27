export interface AuthorDto {
    id: number;
    name: string;
    surname: string;
    email: string;
    role: string;
    profilePhotoUrl?: string;
}

export interface PostProps {
    id: number;
    title: string;
    description: string;
    urlphoto: string;
    creationDate: string;
    author: AuthorDto;
    plant?: {
        id: number;
        name?: string;
        card?: {
            id: number;
            commonName: string;
        }
    };
    likesCount?: number;
    isLikedByMe?: boolean;
    isSavedByMe?: boolean;
    commentsCount?: number;
    onCommentUpdate: () => void;
}

export interface PostCardLayoutProps extends PostProps {
    onLike?: (id: number) => void;
    onDelete?: (id: number) => void;
    onSave?: (id: number) => void;
    defaultOpenComments?: boolean;
    defaultOpenLikes?: boolean;
    highlightCommentId?: number;
    highlightLikeUserId?: number;
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
