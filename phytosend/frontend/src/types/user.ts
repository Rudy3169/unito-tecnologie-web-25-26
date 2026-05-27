/**
 * USER DOMAIN
 * 
 * Interfacce TypeScript che mappano fedelmente i DTO (Data Transfer Object) 
 * restituiti dai controller Spring Boot (Backend). 
 * Forniscono Type Safety "end-to-end" a tempo di compilazione.
 */

export interface UserProfile {
    id: number; // ID dell'utente
    name: string; // Nome dell'utente
    surname: string; // Cognome dell'utente
    email: string; // Email dell'utente
    city?: string; // Città dell'utente
    phoneNumber?: string; // Numero di telefono dell'utente
    bio?: string; // Biografia dell'utente
    birthDate?: string; // Data di nascita dell'utente
    role: string; // Ruolo dell'utente
    postsCount: number; // Numero di post dell'utente
    plantsCount: number; // Numero di piante dell'utente
    profilePhotoUrl?: string; // URL della foto profilo dell'utente
}

export interface UserResult {
    id: number; // ID dell'utente
    name: string; // Nome dell'utente
    surname: string; // Cognome dell'utente
    email: string; // Email dell'utente
    role: string; // Ruolo dell'utente
    profilePhotoUrl?: string; // URL della foto profilo dell'utente
}
