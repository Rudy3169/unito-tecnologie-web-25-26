## Progetto Esteso

**Con il progetto esteso si ottiene un minimo di 18 punti (progetto sufficiente) e un massimo di 32 punti (progetto eccellente).**

#### Visione

Il progetto, che può essere affrontato **da soli o in coppia** vi si chiede di immaginare un'applicazione web (quindi, suddivisa in front-end e back-end) che abbia una ricaduta chiara su **almeno uno** dei seguenti aspetti (che lo qualificano come progetto "benefit", sulla falsariga del modello di impresa delle società benefit):

* **Ecologia e rapporto con la natura, pratiche sostenibili**
* **Supporto alla creatività e alle arti**
* **Tessitura di comunità civica e planetaria**
* **Benessere psicologico e fisico**
* **Occupazione e organizzazione familiare**
* **Lotta alla violenza e risoluzione di conflitti**
* **Apprendimento continuativo, conoscenza e cultura**

**Nota: l'originalità dell'idea non è oggetto di valutazione. Potete prendere ispirazione da app esistenti.**

Lasciate spazio alla fantasia, non lasciatevi bloccare da considerazioni troppo pragmatiche. Non dovrete vendete l'applicazione o guadagnarci su, e dovrete implementarne una minima parte.

Una volta ideata l'applicazione dovrete produrre un breve **documento di visione** (dalle 150 alle 300 parole) in cui si descrive il tipo di applicazione, il tipo di utenza a cui è dedicato, qual è l'ambito "benefit" scelto e quali sono le ricadute immaginate su di esso.

[**Esempio: documento di Visione per il progetto LendABook**](https://docs.google.com/document/u/1/d/e/2PACX-1vSK5td--8zyw5yhrJCp1oEK7llI29sTg7oFWTslThERM6RfA7r6sqf8jXhb8e1tnZiJVyP9Am5iql0F/pub)

#### Ideazione

Una volta decisa l'idea, dovete svilupparla un po': cosa dovrà fare questa applicazione dal punto di vista di chi la userà? Anche se non avete ancora studiato gli strumenti formali per effettuare questa analisi (li vedrete al secondo semestre, nel corso di SAS) potete svolgerla in maniera semplificata seguendo i seguenti passi:

* individuate gli **scenari** tipici in cui la vostra applicazione verrà utilizzata (questo permetterà anche di capire se l'app verrà usata principalmente da computer, da tablet o da smartphone, o se magari è indifferente il dispositivo). Potrebbero essere tanti o anche solo uno. Il livello di dettaglio di uno scenario dovrebbe essere di 1/2 righe di testo.
* per ciascuno scenario, individuate le  **tipologie di utilizzatori** (detti anche  **attori principali** ) dell'applicazione (potrebbe anche essere solo una) e gli **obiettivi** per cui la persona potrebbe usare l'applicazione in quello scenario.
* Per ciascun terzetto "scenario/utilizzatore/obiettivo" delineate in poche righe il procedimento con cui la persona, attraverso l'app, arriverà a raggiungere l'obiettivo in questione, ossia il  **caso d'uso** . Dovrebbe essere una descrizione in poche righe nella quale si evincono chiaramente i passi che l'utente dovrà compiere. Attenzione: non stiamo parlando di descrivere già una potenziale UI con tutte le schermate attraverso cui l'utente dovrà passare, ma di passi sostanziali, per cui potrebbe anche essercene solo uno. In alcuni casi ci potrebbero essere due o più diversi procedimenti attraverso cui l'utilizzatore raggiunge il suo obiettivo, ci saranno allora più **casi d'uso** riferiti allo stesso terzetto.

Nell'elenco dei casi d'uso che avete creato, individuatene infine uno (se complesso) o due che saranno oggetto della vostra implementazione.

Anche in questo caso, dovrete produrre un **documento di ideazione** (max 2 o 3 pagine) contenente l'analisi di cui sopra e la proposta di quale o quali casi d'uso implementare.

[**Esempio: document di Ideazione per il progetto LendABook**](https://docs.google.com/document/d/e/2PACX-1vTf89_IAhNTBnCpjevqKL8lz7ApYnOxc1So2TXa1-KMc3AX8_b1sJMbnRxfKIBJQUbaEbQZnz4SZhvN/pub)

#### Proof-of-concept

Si indica con questo nome un abbozzo di un progetto, mirato a mostrarne le idee essenziali e/o la fattibilità. Si tratta dunque di implementare i casi d'uso che avete individuato.

Esso dovrà essere costituito da:

* una componente server-side realizzata con Spring
* una componente client-side realizzata con React

Per maggiori indicazioni (soprattutto: requisiti minimi) su questa parte vi rimando alla sezione **Requisiti Implementativi.**

#### **Considerazioni conclusive**

Al termine dell'implementazione, vi viene richiesto di stilare un **documento di sintesi** (1 o 2 pagine max) in cui affrontate i seguenti argomenti:

* adeguatezza dei framework utilizzati (visto che per esigenze didattiche non avete potuto sceglierli!) ed eventuali particolari difficoltà o intoppi riscontrati
* idee sul deployment dell'applicazione: ovviamente qui si esula in parte dagli argomenti del corso, ma provate a mo' di esercizio a porvi il problema: come rendo l'applicazione disponibile al mondo?
* strumenti ulteriori che potrebbero servire in prospettiva se si volesse implementare il resto dell'applicazione e per cosa verrebbero utilizzati
* ci sono problematiche particolari (responsiveness, sicurezza, privacy, traffico di rete...) che potrebbero emergere da un utilizzo su scala reale di quest'applicazione?
* eventuali ricadute dell'applicazione su temi quali l' **accessibiità** (facilità utilizzo dell'applicazione da parte di persone con disabilità temporanea o permanente) e l' **inclusività sociale** . Siate obiettivi, non necessariamente tutte le applicazioni sono per tutti, al tempo stesso è ragionevole imparare a evitare "barriere architettoniche" o atteggiamenti poco inclusivi laddove è possibile e sensato farlo.

#### Consegna

* **documentazione:** il progetto dovrà essere accompagnato da una **presentazione **di poche slide, di cui vi verrà fornito il template, che ne illustra le caratteristiche salienti sul piano implementativo. Consegnerete i tre documenti (**visione, ideazione, sintesi, presentazione** ) su Moodle, in un unico ZIP.
* **codice** : Il codice e le slide di presentazione del progetto verranno portati direttamente in sede di discussione. **È opportuno che il progetto venga dimostrato su un computer in possesso di chi l'ha sviluppato.**

---

## Progetto Base

  **Con il progetto esteso si ottiene un minimo di 18 punti (progetto sufficiente) e un massimo di 25 punti (progetto eccellente).**

  Nel progetto base dovete realizzare una mini-applicazione o una parte di applicazione o un prototipo di applicazione con le tecnologie viste a lezione. Dovrà dunque essere costituita da:

* una componente server-side realizzata con Spring
* una componente client-side realizzata con React

  Il progetto può essere realizzato **da soli o in coppia** e, nel caso del progetto base, l'argomento dell'applicazione è completamente libero. Si tratta a tutti gli effetti di un puro esercizio implementativo per mettere alla prova le competenze acquisite nel corso.

  Per sapere quali caratteristiche implementative devono essere necessariamente incluse, fate riferimento sezione  **Requisiti Implementativi** , che è comune ai progetto esteso e al progetto base.

#### Consegna

* **documentazione:** il progetto dovrà essere accompagnato da una **presentazione** di poche slide, di cui vi verrà fornito il template, che ne illustra le caratteristiche salienti sul piano implementativo. Consegnerete **la presentazione** su Moodle, in un unico ZIP.
* **codice** : Il codice e le slide di presentazione del progetto verranno portati direttamente in sede di discussione. **È opportuno che il progetto venga dimostrato su un computer in possesso di chi l'ha sviluppato.**

### Requisiti implementativi

  La vostra applicazione potrà avere una **logica di business** equamente distribuita fra i server-side e client-side, o maggiormente sbilanciata su uno dei due; tuttavia dovrà comprendere entrambe le parti. In generale tenete conto che:

* se l'applicazione è particolarmente orientata all'interattività e alla grafica (pensate ad es. a un videogioco con una grafica importante) ci sarà una significativa elaborazione client-side
* se l'applicazione è particolarmente orientata ai dati, e elabora dati sensibili (o comunque non pubblici) per fornire all'utente i risultati di tali elaborazioni, senza che l'utente abbia accesso ai dati stessi, ci sarà una significativa elaborazione server-side; pensate alla logica di un gioco da tavolo: deve essere il server a imporre le regole, o i client tenterebbero di imbrogliare!
* un'applicazione potrebbe tranquillamente avere entrambe le caratteristiche

  In generale lo svantaggio dell'elaborazione lato server è che il server, che si suppone riceva molte richieste, può sovraccaricarsi. Lo svantaggio dell'elaborazione lato client è che il client deve avere in suo possesso i dati necessari, e questo non è sempre possibile o efficace (ad esempio se l'applicazione prevede un elevato livello di collaborazione fra utenti).

  L'**applicazione** dovrà gestire **login/logout** ma potrà farlo **nel modo semplificato** che vedremo a lezione.

#### Requisiti minimi dell'applicazione Client-Side

* deve essere scritta con il linguaggio **Typescript**
* la view deve essere realizzata in HTML + CSS; non è vietato (se li conoscete) usare CSS predefinit( es. Bootstrap o Tailwind) o preprocessori come SASS o SCSS.
* deve utilizzare il framework **React **con le seguenti alternative
  * per chi non ha conoscenze pregresse, è consigliato l'uso di **React** in abbinamento a **Vite** (come visto a lezione)
  * per chi desiderasse, è possibile usare **React** in abbinamento a qualche altro framework (ad es.  **Next.js** ) ma questa soluzione complica abbastanza le cose quindi è consigliata solo se avete già familiarità
  * potete usare **package** di terze parti ma **NON** componenti UI già fatti: dovete costruirveli voi usando il framework che avete scelto (o meglio: se usate componenti UI di terze parti non verranno conteggiati negli 8 di cui si dice sotto)
* deve interagire con il **back-end** (sfruttando la maggior parte delle route previste dal back-end
* deve essere una **single-page application** con almeno 8 componenti (**non contano** i micro-sotto-componenti tipo gli item di una lista o le righe di una tabella)
* deve prevedere **almeno due form** che generino richieste di tipo POST
* deve prevedere almeno un caso di **comunicazione fra componenti fratelli tramite il componente genitore** (ossia: l'utente interagisce con un componente sullo schermo, e qualcosa cambia in un altro componente che non è né antenato né discendente del primo)
* deve prevedere almeno un caso in cui un componente genera una **richiesta al server** che modifica i dati **visualizzati da un altro componente** presente contemporaneamente sulla pagina, con conseguente aggiornamento dei dati modificati nel secondo componente.
* deve permettere di effettuare il login per collegarsi ad almeno due tipologie di utenti (si vedano le indicazioni per il back-end) che dovranno avere possibilità/permessi di interazione almeno parzialmente differenti
* **non perdete tempo** a implementare una vera e propria registrazione degli utenti lato front-end, potete prevedere degli utenti predefiniti nel DB.

##### Gestione degli errori

  È sufficiente una gestione degli errori semplificata. Si può dare per assunto che le richieste al back-end siano ben formulate. A seconda dell'applicazione, sarà possibile che venga richiesta al back-end una risorsa inesistente a causa di un dato inserito dall'utente; ricordate in questo caso che dal punto di vista della **fetch API** una risposta "404 not found" è una risposta valida, e questo caso può essere gestito associando un comportamento opportuno a **fetch** tramite  **then** .

  Per semplificare, non è richiesto di gestire lato client gli errori 500 Internal Server Error (assumendo che, se si presentano, è perché c'è un bug o nel front-end o nel back-end!).

  Per quanto riguarda gli errori di inserimento dati da parte degli utenti, potete prevedete nei form che implementate uno spazio per inserire un messaggio di errore, tramite una opportuna label.

##### Criteri di valutazione

  Non verrà considerata valida per la discussione del progetto un'app client-side che generi eccezioni/errori nelle interazioni previste con gli utenti, o che non rispetti i requisiti minimi. Gli elementi di valutazione "in positivo" saranno i seguenti:

* organizzazione chiara e comprensibile della gerarchia dei componenti
* livello di dettaglio adeguato nella suddivisione per componenti (React incoraggia componenti piccoli e, laddove sensato, riutilizzati in più parti dell'applicazione)
* utilizzo efficace dell'event binding (per l'interazione UI) e del property-binding (per mostrare gli effetti dei cambiamenti di stato)
* in generale, utilizzo efficace degli strumenti offerti dal framework utilizzato, soprattutto nella gestione della comunicazione asincrona con l'applicazione server-side.

  La cosa importante rispetto a queste caratteristiche è che le vostre scelte siano pensate e ragionevolmente efficaci rispetto al tipo di applicazione che avete pensato di realizzare, mostrando di conoscere i pro e i contro laddove sia stato necessario optare per una fra diverse soluzioni.

#### Requisiti minimi dell'applicazione Server-Side

* L'applicazione dovrà gestire almeno **dodici route** (escluse quelle relative al login) mostrando di saper usare sia i parametri all'interno della query string, sia i segmenti variabili di path, sia laddove sensato il body della HTTPRequest.
* La gestione delle route dovrà essere suddivisa fra **almeno** **due** @RestController (escluso quello che si occupa della gestione della sessione e/o del login)
* Si dovranno prevedere  **almeno due**  @Service (di nuovo, escluso quello che si occupa della gestione degli utenti e/o del login)
* **Almeno 6 @Entity** e relativi Repository
* Prevedete almeno **1 utente** per ciascun diverso "ruolo" o "tipologia" di utente che avete immaginato; il punto è che utenti diversi possano avere accesso a funzionalità diverse e dunque ci sia un tema di "permessi" da gestire in seguito all'autenticazione.

##### Gestione degli errori

  È sufficiente una gestione degli errori semplificata, che però vi permetta di debuggare efficacemente l'applicazione. Alcuni suggerimenti:

* usate 404 Not Found quando è evidente dalle prime verifiche sul path che è stata richiesta una risorsa non esistente
* usate 401 Not Authorized se arriva una richiesta per cui l'utente attuale non è autorizzato o che richiede un login che non è stato effettuato
* se avete del codice che può generare eccezione e richiede obbligatoriamente un **try...catch** potete, in caso di eccezione, inviare una risposta 500 Internal Server Error, ma è consigliabile anche stampare a video la stack trace dell'eccezione, per consentirvi il debugging.

##### Criteri di valutazione

  Non verrà considerata valida per la discussione del progetto un'app server-side che non risponda correttamente alle richieste dell'app-client side, o che non rispetti i requisiti minimi. Gli elementi di valutazione "in positivo" saranno i seguenti:

* organizzazione chiara delle route ( **http METHOD + path** ) rispetto alle operazioni che l'app server-side permette di richiedere
* buona organizzazione del codice, ossia suddivisione logica dei compiti fra @RestController, @Service e DB repository.

  L'importante rispetto a queste caratteristiche è, come per l'app client-side, che le vostre scelte siano pensate e ragionevolmente efficaci rispetto al tipo di applicazione che avete pensato di realizzare; in molti casi non esiste "la" scelta ottimale, di solito bisogna valutare un po' di pro e contro (e il tempo necessario a implementare una soluzione, specie se si tratta di un'applicazione da esame e non di un progetto commerciale, è un elemento di valutazione da considerare fra gli altri!). L'importante è che sappiate motivare le vostre scelte.

### La discussione e la valutazione del progetto

  I progetti possono essere  **realizzati a coppie** , nel qual caso **dovranno** anche essere discussi in coppia. Le discussioni avvengono, salvo motivazioni gravi ed eccezionali opportunamente documentate, in presenza. Chi discute l'esame porta un proprio computer su cui mostrare il progetto.

  La discussione del progetto dura (indicativamente) 25-30 minuti; vi verrà dato un **template** di slide da utilizzare per una vostra  presentazione in cui dovrete – se siete in due – alternarvi a parlare. Seguiranno domande individuali, volte a verificare l'effettiva partecipazione al progetto, la comprensione di come gli strumenti studiati sono stati utilizzati nella realizzazione, e a valutare, fra le altre cose, la capacità di comunicare il proprio progetto e le proprie soluzioni tecniche. Per questa ragione il punteggio del progetto svolto in coppia potrebbe non essere identico per le due persone coinvolte.

  Il progetto può essere discusso  **prima o dopo l'esame scritto** , durante la discussione del progetto, tuttavia **potranno essere poste anche domande su aspetti teorici legati al progetto stesso.**

* [Template per presentazione](https://informatica.i-learn.unito.it/mod/url/view.php?id=274605)

* [Esempio di presentazione &#34;ultimata&#34;](https://informatica.i-learn.unito.it/mod/url/view.php?id=274607)

  La presentazione dovrà essere preceduta da una brevissima demo in cui si spiega **cosa fa l'applicazione** dal punto di vista di chi la utilizza (sia nel caso sia un utente base, sia nel caso dell'utente con "superpoteri")
