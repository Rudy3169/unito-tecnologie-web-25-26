# Struttura Presentazione - PhytoSend
*(Da incollare nel template fornito dal docente)*

## Slide 1: Titolo e Introduzione
- **Titolo Progetto:** PhytoSend
- **Autore:** [Tuo Nome e Cognome]
- **Visione in sintesi:** Un social network e assistente personale dedicato alla cura del verde, volto a unire ecologia, benessere psicologico e spirito di comunità.
- **Obiettivo della Demo:** Mostrare il ciclo di vita di una pianta (aggiunta al giardino, irrigazione) e l'interazione sociale (richiesta di supporto tramite post).

## Slide 2: Architettura Generale
- **Architettura Client-Server:** Separazione netta tra Frontend (Single Page Application) e Backend (API REST).
- **Backend (Spring Boot):**
  - Database relazionale (H2/PostgreSQL).
  - Architettura a 3 livelli: Controller, Service, Repository.
  - Autenticazione Stateless con JWT.
- **Frontend (React + Vite):**
  - Linguaggio: TypeScript.
  - Routing client-side con `react-router-dom`.
  - Fetch API nativa per la comunicazione asincrona.

## Slide 3: Logica di Business e Funzionalità Core
- **Gestione "Il mio Giardino":** Relazioni DB (Utente `1-N` Piante, Pianta `N-1` Scheda Botanica). Calcolo automatico del prossimo evento di cura (es. annaffiatura).
- **Cronjob Server-Side:** Utilizzo di `@Scheduled` per scansionare ogni notte gli eventi di cura scaduti e generare notifiche automatiche per gli utenti.
- **Social Feed:** Implementazione di relazioni `N-M` (es. `LikedBy` e `SavedBy`) e gerarchie complesse (Post `1-N` Commenti, Commento `1-N` Risposte).

## Slide 4: Frontend - Gestione dello Stato e Reattività
- **Componentizzazione:** L'interfaccia è divisa in piccoli componenti riutilizzabili (es. `PostCard`, `PlantCard`, `WarningModal`).
- **Comunicazione asincrona e Aggiornamenti:**
  - Aggiornamento ottimistico o ricaricamento mirato (es. aggiungere un commento aggiorna solo i commenti di quel post senza refresh della pagina).
  - Condivisione dello stato globale del login e ruolo (`USER`/`ADMIN`) a livello di App e propagazione tramite props o localStorage.
- **Upload File:** Gestione nativa dei file (`multipart/form-data`) tramite form per l'upload di immagini di profilo e foto dei post.

## Slide 5: Sicurezza e Gestione Errori
- **Sicurezza:**
  - Endpoint protetti da JWT, validazione token su ogni richiesta (`JwtAuthenticationFilter`).
  - Le password sono hashate con BCrypt.
- **Autorizzazione:** Solo il creatore di un post/commento o un utente Admin può eliminarlo. Controllo permessi implementato sia lato frontend (pulsanti nascosti) che backend (`AccessDeniedException`).
- **Gestione Eccezioni:** Uso di `@ControllerAdvice` (`GlobalExceptionHandler`) nel backend per mappare errori a status code puliti (es. `404 Not Found`, `401 Unauthorized`).

## Slide 6: Sfide Tecniche Affrontate
- **Asincronia e Dati Complessi:** Mappare entità ricche di relazioni dal database verso il frontend evitando "infinite recursion" o caricamenti lenti (risolto tramite l'introduzione della classe `DtoConverter`).
- **Prop Drilling in React:** Sincronizzare il counter delle notifiche e lo stato di login passando funzioni tra componenti distanti senza framework esterni come Redux.
- **Test Unitari:** Sviluppo di oltre 100 test unitari (copertura totale del layer Service) usando JUnit e Mockito per simulare le interazioni col Database.

## Slide 7: Conclusioni e Sviluppi Futuri
- Il framework ci ha permesso di sviluppare velocemente un Proof-of-Concept completo e performante.
- **Sviluppi futuri:** Integrazione di WebSockets per notifiche in real-time, migrazione dello storage immagini su un servizio Cloud (es. AWS S3) e miglioramento accessibilità WCAG.
