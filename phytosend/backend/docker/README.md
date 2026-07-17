# Infrastruttura di Containerizzazione & Monitoraggio con Prometheus

Questo documento illustra l'architettura di containerizzazione e il sistema di **monitoraggio** integrato nel progetto **PhytoSend**.

L'obiettivo dell'infrastruttura è garantire la portabilità dell'intero sistema, semplificare l'ambiente di sviluppo locale tramite meccanismi di *hot-reloading* e introdurre un sistema di monitoraggio centralizzato per le metriche applicative.

---

## 1. Architettura del Sistema

L'infrastruttura è interamente orchestrata tramite **Docker Compose** ed è suddivisa in due macro-aree: i **Servizi Core** (necessari all'esecuzione dell'applicazione) e il **Servizio di Monitoraggio** (dedicato alla telemetria).

```mermaid
graph TD
    Client[React + Vite Frontend] -->|API Calls| API[Spring Boot Backend]
    API -->|JPA / JDBC| DB[(PostgreSQL DB)]
  
    subgraph Monitoring
        Prom[Prometheus] -->|Scrapes /actuator/prometheus| API
    end
```

### 1.1. Servizi Core (Applicativi)

* **`phytosend-db` (PostgreSQL 17.6)**:
  DBMS relazionale deputato alla persistenza dei dati. Configurato con volumi Docker permanenti (`db_data`) per garantire l'integrità dei dati utente anche a seguito dell'arresto dei container.
* **`phytosend-backend` (Spring Boot 3.5.8 & JDK 25)**:
  Server applicativo che espone le API RESTful. Include le dipendenze di **Spring Boot Actuator** e **Micrometer Prometheus**, esponendo un endpoint protetto per la telemetria (`/actuator/prometheus`).
* **`phytosend-frontend` (React + Vite)**:
  Interfaccia utente web della SPA (Single Page Application), compilata e servita tramite un server web ottimizzato.

### 1.2. Servizio di Monitoraggio

* **`phytosend-prometheus`**:
  Time-series database preposto al recupero (tramite *scraping* ad intervalli di 5 secondi) e all'archiviazione delle metriche numeriche prestazionali del server Spring Boot.

---

## 2. Porte e Rete di Collegamento

Tutti i servizi comunicano all'interno di una rete virtuale isolata basata su driver bridge (`phytosend-network`). Le porte esposte sull'host locale sono configurate come segue:

| Container / Servizio     | Porta Esterna | Endpoint / Protocollo | Scopo                                                        |
| :----------------------- | :------------ | :-------------------- | :----------------------------------------------------------- |
| `phytosend-frontend`   | `5173`      | HTTP                  | Accesso all'applicazione client                              |
| `phytosend-backend`    | `8080`      | HTTP                  | Interazione con le API REST e documentazione OpenAPI/Swagger |
| `phytosend-db`         | `5432`      | TCP                   | Connessione al DBMS PostgreSQL                               |
| `phytosend-prometheus` | `9090`      | HTTP                  | Console nativa per query diagnostiche in PromQL              |

---

## 3. Gestione degli Ambienti di Esecuzione

L'infrastruttura fornisce due distinti file di orchestrazione per coprire le diverse fasi del ciclo di vita del software.

### 3.1. Ambiente di Produzione e Testing (`docker-compose.yml`)

Utilizza i `DockerFile` per compilare i sorgenti in modalità multi-stage (garantendo immagini di produzione minimali basate su Alpine Linux). Ideale per test di integrazione finali.

* **Comando di avvio**:
  ```bash
  docker compose up --build -d
  ```
* **Comando di arresto**:
  ```bash
  docker compose down
  ```

### 3.2. Ambiente di Sviluppo con Hot Reloading (`docker-compose.dev.yml`)

Ottimizzato per la fase di scrittura del codice, permette di riflettere istantaneamente le modifiche apportate nell'IDE all'interno dei container senza dover ricostruire le immagini.

* **Meccanismo di funzionamento**:

  * **Volumi Bind-Mount**: I sorgenti locali del backend (`..`) e del frontend (`../../frontend`) sono mappati direttamente dentro i rispettivi container.
  * **Spring Boot DevTools**: Abilitato tramite variabile d'ambiente `SPRING_DEVTOOLS_RESTART_ENABLED=true`. Ad ogni compilazione o salvataggio di una classe Java, il server effettua un *hot restart* automatico.
  * **Vite Dev Server**: Esegue in modalità live con Hot Module Replacement (HMR) attivo per modifiche istantanee del frontend.
  * **Maven Volume Caching**: Le dipendenze scaricate vengono persistite nel volume `maven_cache`, azzerando i tempi di build successivi.
* **Comando di avvio**:

  ```bash
  docker compose -f docker-compose.dev.yml up
  ```
* **Comando di arresto**:

  ```bash
  docker compose -f docker-compose.dev.yml down
  ```

---

## 4. Monitoraggio con Prometheus

### 4.1. Accesso alla Console Prometheus

Per accedere alla console nativa di Prometheus e verificare il corretto funzionamento dello scraping:

1. Accedere a [http://localhost:9090](http://localhost:9090).
2. Navigare su *Status* ➔ *Targets* per verificare che l'endpoint `phytosend-backend` sia in stato **UP**.
3. Utilizzare la barra di query in PromQL per interrogare le metriche (es. `http_server_requests_seconds_count`).

### 4.2. Metriche Esposte dal Backend

Grazie all'integrazione di **Spring Boot Actuator** e **Micrometer Prometheus**, il backend espone automaticamente metriche dettagliate su:

* Percentuale di CPU del processo e del sistema.
* Allocazione e Garbage Collection della memoria JVM (Heap e Non-Heap).
* Statistiche e tempi medi delle chiamate HTTP per singola URI.
* Connessioni attive del pool di database HikariCP.
