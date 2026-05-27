/**
 * NOTIFICATION DOMAIN
 * 
 * Definisce la struttura delle Notifiche recuperate tramite Polling.
 * Particolarità: l'uso degli Union Types per il campo `type` (es. 'LIKE_POST' | 'COMMENT')
 * abilita la Type Guard in TypeScript e vincola lo sviluppatore a gestire unicamente
 * i tipi di notifica validi nello switch statement del componente UI.
 */

export interface NotificationData {
    id: number; // ID della notifica
    actorId?: number; // ID di chi ha effettuato l'azione
    actorName?: string; // Nome di chi ha effettuato l'azione
    actorProfilePhotoUrl?: string; // URL della foto profilo di chi ha effettuato l'azione
    type: 'LIKE_POST' | 'COMMENT' | 'REPLY' | 'LIKE_COMMENT' | 'CARE_WATER'; // Tipo di notifica
    referenceId?: number; // ID del post a cui si riferisce la notifica
    secondaryReferenceId?: number; // ID del commento a cui si riferisce la notifica
    postAuthorId?: number; // ID dell'autore del post
    message: string; // Messaggio della notifica
    read: boolean; // Indica se la notifica è stata letta
    createdAt: string; // Data e ora di creazione della notifica
}
