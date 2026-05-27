/**
 * POST & FEED DOMAIN
 * 
 * Interfacce centrali per il sistema sociale di PhytoSend.
 * `PostProps` e `PostCardLayoutProps` fungono da contratto per le "Props" dei componenti React,
 * garantendo che le funzioni di callback (es. onLike, onDelete) siano implementate
 * e tipizzate correttamente quando passate da Smart Components a Dumb Components.
 */

export interface AuthorDto {
    id: number; // ID dell'autore
    name: string; // Nome dell'autore
    surname: string; // Cognome dell'autore
    email: string; // Email dell'autore
    role: string; // Ruolo dell'autore
    profilePhotoUrl?: string; // URL della foto profilo
}

export interface PostProps {
    id: number; // ID del post
    title: string; // Titolo del post
    description: string; // Descrizione del post
    urlphoto: string; // URL della foto
    creationDate: string; // Data di creazione
    author: AuthorDto; // Autore del post
    plant?: {
        id: number; // ID della pianta
        name?: string; // Nome della pianta
        card?: {
            id: number; // ID della card botanica
            commonName: string; // Nome comune
        }
    };
    likesCount?: number; // Numero di like
    isLikedByMe?: boolean; // Indica se il post è piaciuto all'utente
    isSavedByMe?: boolean; // Indica se il post è salvato dall'utente
    commentsCount?: number; // Numero di commenti
    onCommentUpdate: () => void; // Funzione da chiamare quando i commenti vengono aggiornati
}

export interface PostCardLayoutProps extends PostProps {
    onLike?: (id: number) => void; // Funzione da chiamare quando si mette like
    onDelete?: (id: number) => void; // Funzione da chiamare quando si elimina il post
    onSave?: (id: number) => void; // Funzione da chiamare quando si salva il post
    defaultOpenComments?: boolean; // Indica se i commenti devono essere aperti di default
    defaultOpenLikes?: boolean; // Indica se i like devono essere aperti di default
    highlightCommentId?: number; // ID del commento da evidenziare
    highlightLikeUserId?: number; // ID dell'utente da evidenziare
}

export interface PostItem {
    id: number; // ID del post
    title: string; // Titolo del post
    description: string; // Descrizione del post
    urlphoto?: string; // URL della foto
    URLPhoto?: string; // URL della foto
    creationDate: string; // Data di creazione
    likesCount: number; // Numero di like
    commentsCount: number; // Numero di commenti
    author?: { username: string; profileImage?: string }; // Autore del post
}
