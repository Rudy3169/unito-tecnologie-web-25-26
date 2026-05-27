/**
 * PLANT & GARDEN DOMAIN
 * 
 * Definisce i contratti statici per le Entità Pianta e gli Eventi di Cura (Care Events).
 * La tipizzazione rigorosa previene "undefined errors" in runtime durante 
 * il rendering di strutture dati annidate (es. `plant.card.scientificName`).
 */

export interface PlantResult {
    id: number; // ID della pianta
    commonName: string; // Nome comune
    scientificName: string; // Nome scientifico
    family: string; // Famiglia
    urlDefaultPhoto?: string; // URL della foto di default
    createdAt?: string; // Data di creazione
}

export interface BotanicalCard {
    id: number; // ID della card botanica
    commonName: string; // Nome comune
    scientificName: string; // Nome scientifico
    family: string; // Famiglia
    exposure?: string; // Esposizione
    irrigation?: string; // Irrigazione
    waterFrequencyDays?: string; // Frequenza di irrigazione
    fertilization?: string; // Concimazione
    soil?: string; // Terreno
    urlDefaultPhoto?: string; // URL della foto di default
    createdAt?: string; // Data di creazione
}

export interface CareEventItem {
    id: number; // ID dell'evento di cura
    programmedDate: string; // Data programmata
    type: string; // Tipo di evento
    completed: boolean; // Indica se l'evento è stato completato
    completedDate?: string; // Data di completamento
    notes?: string; // Note aggiuntive
}

export interface PlantItem {
    id: number; // ID della pianta
    plantName?: string; // Nome della pianta
    urlPhoto?: string; // URL della foto
    purchaseDate: string; // Data di acquisto
    deathDate?: string; // Data di morte
    nextWateringDate?: string; // Data del prossimo watering
    careEvents?: CareEventItem[]; // Eventi di cura
    card: {
        id?: number; // ID della card botanica
        commonName: string; // Nome comune
        scientificName: string; // Nome scientifico
        family: string; // Famiglia
        urlDefaultPhoto: string; // URL della foto di default
        exposure?: string; // Esposizione
        waterFrequencyDays?: string; // Frequenza di irrigazione
        fertilization?: string; // Concimazione
        soil?: string; // Terreno
    };
}

export interface PlantSuggestion {
    id: number; // ID della pianta
    commonName: string; // Nome comune
    scientificName: string; // Nome scientifico
    urlDefaultPhoto: string; // URL della foto di default
}
