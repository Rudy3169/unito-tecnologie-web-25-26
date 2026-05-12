# PhytoSend - Social Network & Giardinaggio Virtuale

<p align="center">
  <img src="https://img.shields.io/badge/Spring_Boot-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white" alt="Spring Boot" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/PrimeReact-06B6D4?style=for-the-badge&logo=primereact&logoColor=white" alt="PrimeReact" />
  <img src="https://img.shields.io/badge/Apache_Maven-C71A36?style=for-the-badge&logo=apache-maven&logoColor=white" alt="Maven" />
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
  <img src="https://img.shields.io/badge/Nginx-009639?style=for-the-badge&logo=nginx&logoColor=white" alt="Nginx" />
</p>

PhytoSend è un'applicazione web full-stack progettata per gli amanti del giardinaggio e delle piante. La piattaforma combina le funzionalità di un social network interattivo (condivisione di post, foto, commenti e "mi piace") con uno strumento di gestione personale del proprio giardino virtuale ("My Garden").

---

## 📂 Struttura del Progetto

Il repository è organizzato come segue:

```txt
.
├── documentation/         # Documentazione di progetto (Ideazione, Visione, Diagramma ER)
└── phytosend/             # Codice sorgente dell'applicazione
    ├── backend/           # API REST sviluppate con Spring Boot (Java + Maven)
    └── frontend/          # Applicazione Client in React + TypeScript (Vite + PrimeReact)
```

---

## 🛠️ Prerequisiti

Prima di iniziare, assicurati di avere installato sul tuo sistema:

- **Java Development Kit (JDK)** 17 o superiore (consigliato JDK 21+)
- **Node.js** v18+ e **npm**
- **DBMS SQL** (es. PostgreSQL o MySQL) o database H2 in memoria (a seconda della tua configurazione in `application.properties`/`application.yml`)

---

## ⚙️ Configurazione e Avvio

### 1. Backend (Spring Boot)

Il backend gestisce la logica di business, l'autenticazione tramite JWT, il database e il caricamento delle immagini di profilo e dei post.

1. **Configura il Database**:

   - Assicurati che il database configurato in `phytosend/backend/src/main/resources/application.properties` (o `.yml`) sia attivo e raggiungibile.
   - Modifica le credenziali di accesso nel file di configurazione se necessario.
2. **Avvia il server backend**:

   - Entra nella directory del backend:
     ```bash
     cd phytosend/backend
     ```
   - Esegui l'applicazione utilizzando il Maven Wrapper fornito:
     * **Su Windows (PowerShell/CMD):**
       ```powershell
       ./mvnw.cmd spring-boot:run
       ```
     * **Su macOS/Linux:**
       ```bash
       ./mvnw spring-boot:run
       ```

Il backend sarà disponibile all'indirizzo: `http://localhost:8080` (o la porta configurata).

---

### 2. Frontend (React + Vite)

Il frontend offre un'interfaccia utente moderna, reattiva ed elegante, arricchita con i componenti grafici di **PrimeReact**.

1. **Installa le dipendenze**:

   - Entra nella directory del frontend:
     ```bash
     cd phytosend/frontend
     ```
   - Installa i pacchetti necessari:
     ```bash
     npm install
     ```
2. **Avvia il server di sviluppo**:

   - Avvia Vite in modalità di sviluppo locale:
     ```bash
     npm run dev
     ```

Il frontend sarà raggiungibile nel browser all'indirizzo indicato nel terminale (solitamente `http://localhost:5173` o `http://localhost:3000`).

---

## 🌿 Funzionalità Principali

- **Home Feed**: Condividi post e foto sulle tue piante preferite, commenta i post della community e lascia un "mi piace".
- **My Garden (Il Mio Giardino)**: Un'area personale dove monitorare lo stato di salute delle tue piante. Puoi aggiungere nuove piante al tuo giardino partendo da un catalogo o direttamente dai post del feed.
- **Gestione Profilo**: Personalizzazione del profilo utente con caricamento nativo della foto profilo, bio e riepilogo delle attività.
- **Pannello Amministratore**: Strumenti dedicati alla sincronizzazione del catalogo botanico e alla gestione del sistema.

---

## 🐳 Containerizzazione e Orchestrazione (Docker)

Sia il backend che il frontend sono dotati di file `DockerFile` dedicati per semplificare la compilazione e la distribuzione in container. Inoltre, viene fornito un file di orchestrazione con **Docker Compose** per avviare l'intera suite di servizi (Database, Backend e Frontend) con un solo comando.

### Avvio Rapido con Docker Compose

La soluzione più rapida per eseguire l'applicazione in locale è posizionarsi nella cartella delle configurazioni docker del backend ed avviare l'orchestrazione:

```bash
cd phytosend/backend/docker
docker compose up --build
```

Questo comando avvierà in modo automatico:

1. **Database PostgreSQL** (`phytosend-db`) sulla porta standard `5432`.
2. **Backend Spring Boot** (`phytosend-backend`) sulla porta `8080`.
3. **Frontend Nginx + React** (`phytosend-frontend`) sulla porta `5173`.

---

## 🌐 Architettura di Rete & Reverse Proxy (Nginx)

In ambiente Docker, il client React viene servito tramite un web server **Nginx**. Quest'ultimo funge anche da **Reverse Proxy** per semplificare la comunicazione con le API del backend ed evitare blocchi relativi al CORS.

Il file di configurazione `nginx.conf` definisce le seguenti regole di routing:

* Tutte le richieste statiche alla root `/` caricano l'applicazione React.
* Qualsiasi chiamata verso `/api` viene intercettata da Nginx e inoltrata internamente al container del backend (`http://backend:8080`), nascondendo la complessità di rete al browser dell'utente.

```nginx
server {
    listen 80;
    server_name localhost;

    location / {
        root /usr/share/nginx/html;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## 🔑 Utenti di Test (Auto-Seed)

All'avvio dell'applicazione, il database viene automaticamente popolato con un catalogo botanico esteso e diversi profili utente pre-configurati con giardini fittizi, post, commenti e mi piace.

Puoi utilizzare uno dei seguenti account di test pronti all'uso per esplorare le funzionalità dell'app:

|      Ruolo      |  Nome e Cognome  |            Email            |   Password   |
| :-------------: | :--------------: | :--------------------------: | :----------: |
| **ADMIN** | Salvatore Rudisi |   `admin@phytosend.com`   | `password` |
| **BASE** |   Miriam Zito   |   `miriam@phytosend.com`   | `password` |
| **BASE** |   Marco Verdi   |   `marco@phytosend.com`   | `password` |
| **BASE** |  Federica Gallo  |  `federica@phytosend.com`  | `password` |
| **BASE** | Alessandro Costa | `alessandro@phytosend.com` | `password` |
| **BASE** |   Elena Romano   |   `elena@phytosend.com`   | `password` |

---

## 👥 Autori e Informazioni Accademiche

Progetto sviluppato per il corso di **Tecnologie Web** (A.A. 2025/2026).

**Università degli Studi di Torino (UNITO)** - Corso di Laurea in Informatica.
