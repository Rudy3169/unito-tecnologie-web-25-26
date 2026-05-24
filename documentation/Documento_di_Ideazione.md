# Documento di Ideazione - PhytoSend

## 1. Scenari di Utilizzo
Sulla base della visione di PhytoSend come un social network che unisce la cura del verde al benessere comunitario, sono stati individuati i seguenti scenari principali:

- **Scenario A (Gestione Personale):** Un utente utilizza l'applicazione per gestire il proprio "angolo verde". Vuole registrare una nuova pianta appena acquistata, ricevere consigli sulla cura consultando il catalogo botanico e ricevere notifiche automatiche per le annaffiature per evitare che la pianta muoia.
- **Scenario B (Social & Supporto):** Un utente nota che una delle sue piante ha delle macchie sulle foglie. Condivide una foto nel feed pubblico e chiede consiglio alla community. Un altro utente, esperto coltivatore, visualizza la richiesta e fornisce una diagnosi utile tramite un commento.
- **Scenario C (Moderazione e Amministrazione):** Un amministratore della piattaforma naviga nell'Admin Panel per monitorare le statistiche di sistema e gestire le funzionalità core (come la ricarica dei dati del catalogo e la visione d'insieme) per assicurare la stabilità del servizio.

---

## 2. Attori e Obiettivi

### Scenario A: Gestione Personale
- **Attore:** Giardiniere (Utente Base `USER`).
- **Obiettivo:** Popolare il proprio giardino digitale e ricevere notifiche automatiche e tempestive per la cura.

### Scenario B: Social & Supporto
- **Attori:**
  - **Giardiniere in difficoltà (Utente Base `USER`):** Vuole ricevere un parere affidabile su un problema.
  - **Esperto (Utente Base `USER` con maggiore esperienza):** Vuole condividere la propria conoscenza, commentare e lasciare "Like" per aiutare gli altri.
- **Obiettivo:** Risolvere un problema di cura della pianta tramite l'interazione sociale.

### Scenario C: Moderazione e Amministrazione
- **Attore:** Amministratore (Utente `ADMIN`).
- **Obiettivo:** Gestire la piattaforma, monitorare i dati globali e forzare sincronizzazioni (es. caricamento dei dati di default del catalogo).

---

## 3. Casi d'Uso (Descrizione dei procedimenti)

### Caso d'Uso 1: Adozione di una nuova pianta dal Catalogo (Rif. Scenario A)
1. L'utente effettua il login e accede alla dashboard personale "Il mio Giardino".
2. Clicca per aggiungere un post/pianta e cerca una specie nel Catalogo Botanico integrato.
3. Seleziona la pianta trovata (es. "Ficus") e inserisce opzionalmente un soprannome.
4. L'utente sceglie di aggiungerla anche al proprio giardino tramite un apposito toggle e completa la creazione.
5. Il backend registra la pianta associandola al giardino dell'utente.
6. Le scadenze di cura iniziali vengono generate e l'utente riceverà delle notifiche automatiche generate dal sistema (`CareEventScheduler`) allo scadere del tempo.

### Caso d'Uso 2: Richiesta SOS e Interazione Sociale (Rif. Scenario B)
1. L'utente accede alla bacheca pubblica (Feed).
2. Crea un nuovo post, allegando la foto della pianta malata o scegliendo una pianta dal proprio giardino, aggiungendo una descrizione (es. "Foglie gialle, cosa succede?").
3. Il post viene pubblicato nel feed e diventa visibile a tutti gli iscritti.
4. Un altro utente naviga nel feed, vede il post e lo apre per visualizzare i dettagli.
5. L'utente esperto inserisce un commento con un consiglio pratico (es. "Hai dato troppa acqua!").
6. L'autore originale riceve una notifica push in-app che lo avvisa del nuovo commento.
7. L'autore può rispondere al commento, mettere "Mi Piace" per ringraziare.

---

## 4. Proposta di Implementazione (Proof-of-Concept)
L'implementazione realizzata sviluppa appieno questi casi d'uso, integrando backend strutturato (Spring Boot) e frontend reattivo (React).

### Funzionalità Core Implementate:
- **Gestione Ruoli e Sicurezza:** Sistema di Login/Registrazione con autenticazione JWT e due ruoli distinti (`USER` e `ADMIN`) per differenziare i permessi di accesso, in particolare al pannello di amministrazione (AdminPanel).
- **Gestione "Il mio Giardino" e Piante:** Completa implementazione CRUD (Create, Read, Update, Delete) per il giardino dell'utente. Si distingue tra cancellazione definitiva (Hard Delete) e segnalazione di "Morte" della pianta, mantenendo i ricordi fotografici.
- **Bacheca Sociale Avanzata:** Implementazione della creazione di post (anche legati a piante specifiche del giardino), con funzionalità di Like, salvataggio post (Preferiti), e un sistema di Commenti thread-based.
- **Sistema di Notifiche e Task Asincroni:** Sviluppo di un servizio in background (`@Scheduled`) che analizza ogni notte lo stato delle piante e invia notifiche in-app relative alle necessità di cura (es. innaffiatura).

### Motivazione e Scelte Architetturali: 
Questa selezione di funzionalità ha richiesto lo sviluppo di un'architettura dati complessa e completa:
- **Relazioni Avanzate:** Presenza di schemi relazionali avanzati nel database relazionale (Relazioni `1-N` tra Utente e Piante; `1-N` tra Post e Commenti; `N-M` per i Like e Post Salvati).
- **Interattività del Client:** Utilizzo di React per garantire risposte visive istantanee (es. aggiornamento del badge notifiche e comparsa immediata dei commenti senza ricaricare la pagina).
- **Logica di Business nel Backend:** Delega al server (tramite Spring Data JPA e i layer di Servizio) del calcolo intelligente delle date e della verifica dei permessi/proprietà (es. limitazione cancellazione post).
