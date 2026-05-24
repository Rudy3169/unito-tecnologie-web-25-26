# Documento di Sintesi - PhytoSend

## Adeguatezza dei framework utilizzati e difficoltà riscontrate
La scelta obbligata dello stack **React (Vite) + Spring Boot** si è rivelata molto efficace per la natura dell'applicazione. Spring Boot, grazie a Spring Data JPA e alla sua solida architettura a layer (Controller, Service, Repository), ha semplificato enormemente la gestione del modello relazionale (Utenti, Piante, Giardini, Post, Commenti e Notifiche) e lo sviluppo di un task asincrono con `@Scheduled` per il controllo notturno delle annaffiature (`CareEventScheduler`).
Lato client, React ha permesso di sviluppare interfacce molto reattive (come il toggle dei "Like", il salvataggio dei post e la ricerca dinamica nel catalogo botanico) attraverso la scomposizione in componenti riutilizzabili. 
Tuttavia, sono emerse alcune sfide:
- **Gestione dello stato globale in React:** Senza librerie esterne come Redux, il passaggio di funzioni di callback e stati tra componenti distanti (prop drilling) per aggiornare, ad esempio, il badge delle notifiche o il feed dopo la creazione di un post, ha richiesto un'attenta progettazione.
- **Sicurezza e File Upload:** Gestire l'autenticazione stateless con JWT (in `SecurityConfig` e `JwtAuthenticationFilter`) e parallelamente permettere il salvataggio fisico delle immagini caricate dagli utenti nel file system del server (`FileUploadController`), ha richiesto un setup accurato dei permessi e della configurazione dei percorsi statici.

## Idee sul deployment dell'applicazione
Per rendere PhytoSend disponibile al mondo, l'approccio ideale sfrutta la containerizzazione, verso cui il progetto è già parzialmente predisposto (vista la presenza di `DockerFile` e `nginx.conf` nel frontend). 
- **Backend:** Si potrebbe creare un'immagine Docker dell'applicativo Spring Boot e deployarla su un servizio PaaS cloud (es. Render, Heroku, o AWS Elastic Beanstalk). Il database in memoria H2 andrebbe sostituito definitivamente con PostgreSQL (già presente come dipendenza nel `pom.xml`) ospitato su un servizio managed (es. Supabase o AWS RDS).
- **Frontend:** La build generata da Vite (`dist`) può essere servita ottimamente tramite un web server leggero come Nginx (come configurato) ospitato su un servizio come Vercel, Netlify o GitHub Pages, configurando i reverse proxy per puntare alle API del backend.

## Strumenti ulteriori in prospettiva
Per un'espansione e un miglioramento del progetto su scala reale, si potrebbero adottare:
- **Cloud Object Storage (es. AWS S3 o Cloudinary):** Attualmente i file multimediali (foto delle piante e dei post) vengono salvati localmente in una cartella `uploads`. In produzione, servirebbe uno storage esterno per garantire scalabilità e non perdere le immagini ai riavvii dei server.
- **WebSockets (es. Spring WebSocket / STOMP):** Le notifiche attualmente richiedono il refresh o chiamate HTTP per aggiornarsi. Le WebSockets permetterebbero di ricevere notifiche push in tempo reale (es. quando qualcuno commenta un post).
- **State Manager Globale (es. Zustand o Redux):** Per gestire lo stato dell'utente loggato, le notifiche e il giardino in maniera più pulita su React.

## Problematiche su scala reale
Un utilizzo su larga scala di PhytoSend farebbe emergere alcune criticità:
- **Traffico di rete e Storage:** Le immagini caricate per i post e le piante sono risorse "pesanti". Senza un sistema di compressione lato client aggressivo o lato server, i costi di banda e storage salirebbero rapidamente.
- **Privacy e Sicurezza:** Il social network espone dati personali. Sarebbe necessario implementare logiche di profilo privato/pubblico, blocco utenti e assicurarsi che le immagini scattate in casa non contengano metadati (EXIF, coordinate GPS) sensibili.
- **Performance del Database:** Il calcolo delle query complesse (es. la timeline dei post con verifica dei "LikedByMe" per l'utente corrente) andrebbe ottimizzata introducendo paginazione avanzata, caching (es. Redis) o indici mirati sul database.

## Accessibilità e Inclusività Sociale
Il concept benefit di PhytoSend promuove intrinsecamente il benessere psicologico e il legame con la natura. 
- **Inclusività:** Può creare una community sicura (tramite regole di moderazione stringenti sui commenti che ho implementato per la cancellazione) utile a fasce d'età diverse: dalle persone anziane amanti del giardinaggio ai giovani che si avvicinano al tema dell'ecologia.
- **Accessibilità tecnica:** Lo sviluppo UI dovrebbe rispettare le direttive WCAG 2.1: garantire un adeguato contrasto cromatico tra i toni del verde e i testi, utilizzare font leggibili e assicurarsi che elementi interattivi (come il pulsante "Aggiungi al giardino" o il "Cuore" del like) abbiano sempre etichette `aria-label` o attributi `alt` (soprattutto per le foto caricate dagli utenti) in modo da rendere la piattaforma utilizzabile da persone ipovedenti tramite screen reader.
