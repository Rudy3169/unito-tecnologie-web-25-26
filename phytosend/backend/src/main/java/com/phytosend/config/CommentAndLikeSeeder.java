package com.phytosend.config;

import com.phytosend.entity.Comment;
import com.phytosend.entity.Post;
import com.phytosend.entity.User;
import com.phytosend.repository.CommentRepository;
import com.phytosend.repository.PostRepository;
import com.phytosend.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
@Order(5) // 1. Utenti, 2. Catalogo, 3. Giardini, 4. Post, 5. Commenti e Like
@Slf4j
public class CommentAndLikeSeeder implements CommandLineRunner {

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    @Transactional
    public void run(String... args) throws Exception {

        if (commentRepository.count() > 0) {
            log.info("I commenti e i like di test sono già presenti per via di un seeding precedente.");
            return;
        }

        log.info("Nessun commento rilevato. Generazione di commenti e like manuali...");

        // Recupera tutti gli utenti
        User admin = userRepository.findByEmail("admin@phytosend.com").orElse(null);
        User miriam = userRepository.findByEmail("miriam@phytosend.com").orElse(null);
        User marco = userRepository.findByEmail("marco@phytosend.com").orElse(null);
        User federica = userRepository.findByEmail("federica@phytosend.com").orElse(null);
        User alessandro = userRepository.findByEmail("alessandro@phytosend.com").orElse(null);
        User elena = userRepository.findByEmail("elena@phytosend.com").orElse(null);

        // Recupera tutti i post (ordinati per data crescente, così l'indice è stabile)
        List<Post> allPosts = postRepository.findAll();
        allPosts.sort((a, b) -> a.getCreationDate().compareTo(b.getCreationDate()));

        if (allPosts.isEmpty()) {
            log.warn("⚠️ Nessun post trovato, impossibile generare commenti e like.");
            return;
        }

        log.info("Trovati {} post. Inizio assegnazione commenti e like...", allPosts.size());

        // ════════════════════════════════════════════════════════════════════
        // POST DI SALVATORE (ADMIN)
        // ════════════════════════════════════════════════════════════════════

        Post aloeVaso = findPostByDescription(allPosts, "cambiarle vaso");
        if (aloeVaso != null) {
            addLike(aloeVaso, miriam);
            addLike(aloeVaso, marco);
            Comment c1 = addComment(aloeVaso, marco, "Ottimo lavoro! Che terriccio hai usato?", 5);
            addCommentLike(c1, miriam);
            addReply(aloeVaso, c1, admin, "Terriccio specifico per cactacee con molta perlite, mi trovo benissimo!", 4);
        }

        Post aloePref = findPostByDescription(allPosts, "preferita del giardino");
        if (aloePref != null) {
            addLike(aloePref, elena);
            addLike(aloePref, federica);
            addComment(aloePref, elena, "Bellissima, complimenti! 😍", 10);
        }

        Post falangioStoloni = findPostByDescription(allPosts, "nuovi stoloni");
        if (falangioStoloni != null) {
            addLike(falangioStoloni, miriam);
            addLike(falangioStoloni, federica);
            addLike(falangioStoloni, alessandro);
            Comment c2 = addComment(falangioStoloni, miriam, "Io volentieri! Sarei curiosa di provare a coltivarla.",
                    12);
            Comment r1 = addReply(falangioStoloni, c2, admin,
                    "Certo Miriam, appena radicano in acqua te ne tengo da parte una!", 11);
            addCommentLike(r1, miriam);
            Comment c20 = addComment(falangioStoloni, marco,
                    "Se te ne avanza uno, mi metto in coda anche io! Ho il pollice nero per i fiori, ma le piante verdi mi danno soddisfazioni. 🪴",
                    10);
            addReply(falangioStoloni, c20, admin,
                    "Aggiudicato Marco! Te lo porto al prossimo ritrovo di scambio talee.", 9);
        }

        Post falangioSecco = findPostByDescription(allPosts, "punte del mio Falangio");
        if (falangioSecco != null) {
            addLike(falangioSecco, elena);
            Comment c3 = addComment(falangioSecco, federica,
                    "Di solito è l'aria troppo secca. Prova a nebulizzare le foglie la mattina!", 3);
            addCommentLike(c3, admin);
            addReply(falangioSecco, c3, admin, "Grazie mille Federica, proverò da domani!", 2);
        }

        Post basilicoPesto = findPostByDescription(allPosts, "pesto domenicale");
        if (basilicoPesto != null) {
            addLike(basilicoPesto, alessandro);
            addLike(basilicoPesto, marco);
            addComment(basilicoPesto, alessandro,
                    "Gnam! Il pesto fatto in casa con il proprio basilico è tutta un'altra cosa. 🍝", 7);
            Comment c24 = addComment(basilicoPesto, marco,
                    "Il trucco per il pesto perfetto è usare i pinoli tostati e tanto tanto Parmigiano.", 6);
            addReply(basilicoPesto, c24, alessandro,
                    "Eresia! A Genova si usa anche il Fiore Sardo, non solo Parmigiano! 😂", 5);
            addReply(basilicoPesto, c24, admin, "Ragazzi non litigate, l'importante è che il basilico sia fresco!", 4);
        }

        Post basilicoBuchi = findPostByDescription(allPosts, "piccoli buchi");
        if (basilicoBuchi != null) {
            addLike(basilicoBuchi, elena);
            Comment c4 = addComment(basilicoBuchi, elena,
                    "Potrebbero essere nottue (bruchi verdi). Esci la sera col buio e controlla sotto le foglie!", 2);
            addReply(basilicoBuchi, c4, admin, "Mi sa che hai ragione, ne ho appena pizzicato uno. Grazie!", 1);
        }

        Post rosmarinoProfumo = findPostByDescription(allPosts, "terapeutico");
        if (rosmarinoProfumo != null) {
            addLike(rosmarinoProfumo, alessandro);
            addLike(rosmarinoProfumo, federica);
            addLike(rosmarinoProfumo, elena);
            addComment(rosmarinoProfumo, alessandro, "Verissimo! Basta sfiorarlo per avere le mani profumate per ore.",
                    15);
        }

        Post rosmarinoConcime = findPostByDescription(allPosts, "terreni poveri");
        if (rosmarinoConcime != null) {
            addLike(rosmarinoConcime, marco);
            Comment c5 = addComment(rosmarinoConcime, marco,
                    "Mettici appena un po' di stallatico pellettato in superficie, ma senza esagerare. Altrimenti perde profumo!",
                    8);
            addCommentLike(c5, admin);
        }

        // ════════════════════════════════════════════════════════════════════
        // POST DI MIRIAM
        // ════════════════════════════════════════════════════════════════════

        Post monsteraNuova = findPostByDescription(allPosts, "fenestrature");
        if (monsteraNuova != null) {
            addLike(monsteraNuova, federica);
            addLike(monsteraNuova, elena);
            addLike(monsteraNuova, admin);
            addComment(monsteraNuova, federica,
                    "Meravigliosa! La mia è ancora piccina e fa solo foglie a cuore intere.", 20);
        }

        Post orchideaRifiorisce = findPostByDescription(allPosts, "ignorata per mesi");
        if (orchideaRifiorisce != null) {
            addLike(orchideaRifiorisce, elena);
            addLike(orchideaRifiorisce, marco);
            Comment c6 = addComment(orchideaRifiorisce, elena,
                    "Verissimo! A volte fargli patire un po' di siccità e sbalzo termico stimola la fioritura molto più del concime!",
                    5);
            addReply(orchideaRifiorisce, c6, miriam, "Esatto! Da quando ho smesso di ossessionarmi è rinata 😂", 4);
            Comment c21 = addComment(orchideaRifiorisce, federica,
                    "Miriam sei un mito, io le ho provate tutte: concime, luce, buio... Niente da fare, le mie orchidee fanno solo foglie enormi e zero fiori!",
                    3);
            addCommentLike(c21, alessandro);
            addReply(orchideaRifiorisce, c21, miriam,
                    "Federica, prova a metterla fuori in balcone all'ombra a fine estate. Lo sbalzo termico notturno stimola la fioritura. Con me ha funzionato!",
                    2);
        }

        Post orchideaInverno = findPostByDescription(allPosts, "immersione o goccia a goccia");
        if (orchideaInverno != null) {
            addLike(orchideaInverno, admin);
            Comment c7 = addComment(orchideaInverno, elena,
                    "Assolutamente immersione per 10-15 minuti, ma fallo rigorosamente solo quando le radici nel vaso sono diventate argentate/grigie!",
                    2);
            addCommentLike(c7, miriam);
            addCommentLike(c7, admin);
            addReply(orchideaInverno, c7, miriam,
                    "Ottimo consiglio, io stavo innaffiando una volta a settimana a prescindere dal colore. Provvederò!",
                    1);
        }

        Post pothosLibreria = findPostByDescription(allPosts, "conquistando l'intera libreria");
        if (pothosLibreria != null) {
            addLike(pothosLibreria, federica);
            addLike(pothosLibreria, alessandro);
            addComment(pothosLibreria, admin, "Fagli fare una bella cascata verso il basso, sarà stupendo da vedere.",
                    25);
        }

        Post pothosSbiadito = findPostByDescription(allPosts, "variegature bianche");
        if (pothosSbiadito != null) {
            addLike(pothosSbiadito, marco);
            Comment c8 = addComment(pothosSbiadito, marco,
                    "Sì Miriam, se prende poca luce la pianta produce più clorofilla per sopravvivere e perde le macchie bianche. Spostalo più vicino alla finestra!",
                    10);
            addReply(pothosSbiadito, c8, miriam, "Ha tantissimo senso! Grazie mille Marco, lo sposto subito.", 9);
        }

        Post margheritaBalcone = findPostByDescription(allPosts, "di buon umore");
        if (margheritaBalcone != null) {
            addLike(margheritaBalcone, elena);
            addLike(margheritaBalcone, alessandro);
            addComment(margheritaBalcone, alessandro,
                    "Le margherite portano sempre allegria. Ottima scelta per il balcone! 🌼", 4);
        }

        Post lavandaProfumo = findPostByDescription(allPosts, "esplosione");
        if (lavandaProfumo != null) {
            addLike(lavandaProfumo, alessandro);
            addLike(lavandaProfumo, federica);
            addLike(lavandaProfumo, admin);
            Comment c9 = addComment(lavandaProfumo, alessandro,
                    "Fantastica! Pensa che qui a Napoli fatico un po' con l'umidità per la Lavanda, la tua è perfetta.",
                    6);
            addReply(lavandaProfumo, c9, miriam,
                    "Qui a Trapani il clima le piace tantissimo, prende sole dalla mattina alla sera!", 5);
        }

        // ════════════════════════════════════════════════════════════════════
        // POST DI MARCO
        // ════════════════════════════════════════════════════════════════════

        Post cactusForte = findPostByDescription(allPosts, "sopravvive a tutto");
        if (cactusForte != null) {
            addLike(cactusForte, admin);
            addLike(cactusForte, miriam);
            addComment(cactusForte, admin, "È la magia delle succulente! Meno le guardi e meglio stanno. 🌵", 14);
        }

        Post cactusMalato = findPostByDescription(allPosts, "macchia marroncina");
        if (cactusMalato != null) {
            addLike(cactusMalato, federica);
            Comment c10 = addComment(cactusMalato, admin,
                    "Purtroppo se è molliccio è marciume. Taglia tutta la parte malata con un coltello disinfettato, lascia asciugare la ferita per una settimana e ripianta la parte sana su terriccio asciuttissimo!",
                    8);
            addCommentLike(c10, marco);
            addReply(cactusMalato, c10, marco, "Ci provo subito, incrociamo le dita! Speriamo di salvarlo.", 7);
        }

        Post salviaCucina = findPostByDescription(allPosts, "ravioli burro e salvia");
        if (salviaCucina != null) {
            addLike(salviaCucina, elena);
            addLike(salviaCucina, alessandro);
            addComment(salviaCucina, elena,
                    "Che invidia! Devo assolutamente piantare anche io le aromatiche sul balcone.", 5);
        }

        Post sansevieriaRegina = findPostByDescription(allPosts, "regina incontrastata");
        if (sansevieriaRegina != null) {
            addLike(sansevieriaRegina, miriam);
            addLike(sansevieriaRegina, federica);
            addComment(sansevieriaRegina, miriam,
                    "Concordo! Ho messo la mia in un angolo dove arriva pochissima luce e sta benissimo lo stesso.",
                    18);
        }

        Post sansevieriaVaso = findPostByDescription(allPosts, "spaccare il vaso");
        if (sansevieriaVaso != null) {
            addLike(sansevieriaVaso, admin);
            addLike(sansevieriaVaso, alessandro);
            Comment c11 = addComment(sansevieriaVaso, admin,
                    "Rinvasala solo se le radici spuntano da sotto o se deforma davvero il vaso. Alle Sansevierie piace stare strette!",
                    3);
            addReply(sansevieriaVaso, c11, marco, "Allora aspetto la primavera prossima, grazie!", 2);
        }

        // ════════════════════════════════════════════════════════════════════
        // POST DI FEDERICA
        // ════════════════════════════════════════════════════════════════════

        Post ficusLucido = findPostByDescription(allPosts, "lucidità pazzesca");
        if (ficusLucido != null) {
            addLike(ficusLucido, miriam);
            addLike(ficusLucido, elena);
            addComment(ficusLucido, miriam, "Che splendore! Usi qualche prodotto specifico o solo acqua per pulirle?",
                    20);
        }

        Post ficusFoglie = findPostByDescription(allPosts, "perdendo un paio di foglie");
        if (ficusFoglie != null) {
            addLike(ficusFoglie, marco);
            Comment c12 = addComment(ficusFoglie, admin,
                    "Se sono le foglie più basse e vecchie è normalissimo ricambio. L'importante è che la cima continui a buttarne di nuove!",
                    10);
            addCommentLike(c12, federica);
        }

        Post ranuncoloBoccioli = findPostByDescription(allPosts, "carta velina");
        if (ranuncoloBoccioli != null) {
            addLike(ranuncoloBoccioli, elena);
            addLike(ranuncoloBoccioli, alessandro);
            addComment(ranuncoloBoccioli, elena, "I ranuncoli sono la perfezione. Sembrano finti da quanto sono belli!",
                    6);
        }

        Post mughettoPrimavera = findPostByDescription(allPosts, "profumo delicato di mughetto");
        if (mughettoPrimavera != null) {
            addLike(mughettoPrimavera, miriam);
            addLike(mughettoPrimavera, marco);
            addComment(mughettoPrimavera, miriam, "Che meraviglia, sanno proprio di primavera. 🌱", 15);
        }

        Post gelsominoSera = findPostByDescription(allPosts, "fioritura serale");
        if (gelsominoSera != null) {
            addLike(gelsominoSera, alessandro);
            addLike(gelsominoSera, elena);
            addComment(gelsominoSera, alessandro, "Il gelsomino in estate è d'obbligo. Complimenti!", 8);
        }

        Post gelsominoBoccioli = findPostByDescription(allPosts, "boccioli del gelsomino stanno cadendo");
        if (gelsominoBoccioli != null) {
            addLike(gelsominoBoccioli, marco);
            Comment c13 = addComment(gelsominoBoccioli, admin,
                    "Controlla le innaffiature: troppa acqua può causare la cascola dei boccioli. Il terreno deve asciugare tra una bagnatura e l'altra.",
                    4);
            addReply(gelsominoBoccioli, c13, federica,
                    "Ops... l'ho bagnato tutti i giorni. Lascio asciugare subito, grazie!", 3);
        }

        Post geranioFarfallina = findPostByDescription(allPosts, "farfallina del geranio");
        if (geranioFarfallina != null) {
            addLike(geranioFarfallina, alessandro);
            Comment c14 = addComment(geranioFarfallina, alessandro,
                    "Un incubo! Io quest'anno sono passato all'Olio di Neem miscelato con sapone molle, dato preventivamente ogni 15 giorni. Funziona!",
                    5);
            addCommentLike(c14, federica);
            addReply(geranioFarfallina, c14, federica, "Lo compro oggi stesso, grazie mille Alessandro!", 4);
        }

        // ════════════════════════════════════════════════════════════════════
        // POST DI ALESSANDRO
        // ════════════════════════════════════════════════════════════════════

        Post giglioBianco = findPostByDescription(allPosts, "eleganza del Giglio");
        if (giglioBianco != null) {
            addLike(giglioBianco, elena);
            addLike(giglioBianco, miriam);
            addComment(giglioBianco, elena, "Bianco è super elegante. Ne ho preso uno anche io la settimana scorsa!",
                    18);
        }

        Post giglioPolline = findPostByDescription(allPosts, "polline macchia");
        if (giglioPolline != null) {
            addLike(giglioPolline, federica);
            addLike(giglioPolline, admin);
            Comment c15 = addComment(giglioPolline, federica,
                    "Sì! Appena il fiore si apre tolgo subito le antere con una pinzetta o con un fazzoletto, altrimenti è la fine per i vestiti! 😂",
                    12);
            addReply(giglioPolline, c15, alessandro, "D'ora in poi lo farò sempre, ho rovinato una maglietta ieri!",
                    11);
        }

        Post rosaColore = findPostByDescription(allPosts, "colore dal vivo");
        if (rosaColore != null) {
            addLike(rosaColore, elena);
            addLike(rosaColore, marco);
            addComment(rosaColore, marco, "Le rose danno una soddisfazione immensa. Che rosso acceso!", 22);
        }

        Post rosaAfidi = findPostByDescription(allPosts, "Afidi sulla rosa");
        if (rosaAfidi != null) {
            addLike(rosaAfidi, miriam);
            Comment c16 = addComment(rosaAfidi, elena,
                    "Il sapone di potassio è ottimo, ma devi insistere: nebulizza abbondantemente anche sotto le foglie ogni 3 giorni finché non spariscono tutti.",
                    7);
            addCommentLike(c16, alessandro);
        }

        Post ortensiaBlu = findPostByDescription(allPosts, "blu intensissimo");
        if (ortensiaBlu != null) {
            addLike(ortensiaBlu, federica);
            addLike(ortensiaBlu, miriam);
            addComment(ortensiaBlu, federica,
                    "Che spettacolo! Io non riesco mai a farle diventare azzurre, restano sempre rosa scuro.", 15);
            Comment c22 = addComment(ortensiaBlu, elena,
                    "Alessandro, mi daresti il nome esatto del prodotto che hai usato? La mia sta diventando un mix sbiadito di rosa e viola inguardabile.",
                    14);
            addReply(ortensiaBlu, c22, alessandro,
                    "Certo Elena! Ho usato l'azzurrante specifico per ortensie della Compo, iniziando a darlo da fine inverno prima che spuntassero le foglie.",
                    13);
            addReply(ortensiaBlu, c22, elena, "Me lo segno subito nella lista della spesa, grazie! 📝", 12);
        }

        Post ortensiaClorosi = findPostByDescription(allPosts, "clorosi");
        if (ortensiaClorosi != null) {
            addLike(ortensiaClorosi, admin);
            Comment c17 = addComment(ortensiaClorosi, admin,
                    "Esatto Alessandro, è sicuramente clorosi ferrica causata dall'acqua del rubinetto troppo calcarea. Dai un po' di chelato di ferro e si riprenderà in due settimane!",
                    6);
            addCommentLike(c17, alessandro);
            addReply(ortensiaClorosi, c17, alessandro, "Perfetto, procedo con il chelato. Grazie Doc! 😎", 5);
        }

        // ════════════════════════════════════════════════════════════════════
        // POST DI ELENA
        // ════════════════════════════════════════════════════════════════════

        Post calatheaMovimento = findPostByDescription(allPosts, "movimento delle foglie");
        if (calatheaMovimento != null) {
            addLike(calatheaMovimento, miriam);
            addLike(calatheaMovimento, federica);
            addComment(calatheaMovimento, federica,
                    "Le Calathee sono pazzesche, sembrano chiudersi a preghiera la sera. Bellissima!", 19);
            Comment c23 = addComment(calatheaMovimento, admin,
                    "Per i più curiosi: questo fenomeno si chiama 'nictinastia'. La pianta muove le foglie in base al ritmo circadiano per ottimizzare la luce di giorno e conservare umidità di notte!",
                    15);
            addCommentLike(c23, elena);
            addCommentLike(c23, federica);
            addReply(calatheaMovimento, c23, marco,
                    "Wow, non si finisce mai di imparare su questa app. Grazie Admin! 🧠", 14);
        }

        Post calatheaPunte = findPostByDescription(allPosts, "punte della mia Calathea");
        if (calatheaPunte != null) {
            addLike(calatheaPunte, admin);
            Comment c18 = addComment(calatheaPunte, admin,
                    "Elena, nebulizzarle spesso non basta e a volte crea funghi. Metti il vaso sopra un sottovaso pieno di argilla espansa e un filo d'acqua (senza che tocchi il fondo del vaso): l'evaporazione le darà l'umidità costante di cui ha bisogno!",
                    11);
            addReply(calatheaPunte, c18, elena, "Ci provo subito! Ero disperata, le punte diventavano marroni ovunque.",
                    10);
        }

        Post prezzemoloVaso = findPostByDescription(allPosts, "chilometro zero");
        if (prezzemoloVaso != null) {
            addLike(prezzemoloVaso, alessandro);
            addLike(prezzemoloVaso, marco);
            addComment(prezzemoloVaso, marco, "Mai più senza aromatiche fresche! Ottimo raccolto.", 8);
        }

        Post rosaVaso = findPostByDescription(allPosts, "profuma di antico");
        if (rosaVaso != null) {
            addLike(rosaVaso, alessandro);
            addComment(rosaVaso, alessandro, "Le rose antiche hanno un profumo che non si dimentica. Stupenda!", 13);
        }

        Post timoApi = findPostByDescription(allPosts, "Timo in piena fioritura");
        if (timoApi != null) {
            addLike(timoApi, miriam);
            addLike(timoApi, admin);
            addComment(timoApi, miriam,
                    "Bellissimo vedere la natura al lavoro. E il miele di timo dev'essere buonissimo! 🐝", 9);
        }

        Post timoSecco = findPostByDescription(allPosts, "seccando dal centro");
        if (timoSecco != null) {
            addLike(timoSecco, marco);
            Comment c19 = addComment(timoSecco, marco,
                    "Di solito il timo non sopporta i ristagni. Hai per caso il terriccio troppo inzuppato? Le aromatiche mediterranee vogliono terra asciutta e sassi per drenare bene.",
                    4);
            addCommentLike(c19, elena);
            addReply(timoSecco, c19, elena,
                    "In effetti ha piovuto tantissimo e il sottovaso era pieno d'acqua... l'ho svuotato e spostata al coperto, spero si salvi la parte esterna!",
                    3);
        }

        log.info("✔️ Autoseed commenti e like completato!");
    }

    // ════════════════════════════════════════════════════════════════════════
    // METODI DI SUPPORTO
    // ════════════════════════════════════════════════════════════════════════

    /**
     * Aggiunge un like di un utente a un post.
     */
    private void addLike(Post post, User user) {
        if (post != null && user != null) {
            post.getLikedBy().add(user);
            postRepository.save(post);
        }
    }

    /**
     * Crea e salva un commento root-level su un post.
     *
     * @param post    il post a cui aggiungere il commento
     * @param author  l'autore del commento
     * @param text    il testo del commento
     * @param daysAgo quanti giorni fa è stato scritto
     * @return il commento salvato (utile per aggiungere risposte)
     */
    private Comment addComment(Post post, User author, String text, int daysAgo) {
        Comment comment = new Comment();
        comment.setPost(post);
        comment.setAuthor(author);
        comment.setText(text);
        comment.setCreationDate(LocalDateTime.now().minusDays(daysAgo));
        comment.setParent(null);
        return commentRepository.save(comment);
    }

    /**
     * Crea e salva una risposta a un commento esistente.
     *
     * @param post          il post di riferimento
     * @param parentComment il commento a cui si risponde
     * @param author        l'autore della risposta
     * @param text          il testo della risposta
     * @param daysAgo       quanti giorni fa è stata scritta
     * @return la risposta salvata
     */
    private Comment addReply(Post post, Comment parentComment, User author, String text, int daysAgo) {
        Comment reply = new Comment();
        reply.setPost(post);
        reply.setAuthor(author);
        reply.setText(text);
        reply.setCreationDate(LocalDateTime.now().minusDays(daysAgo));
        reply.setParent(parentComment);
        return commentRepository.save(reply);
    }

    /**
     * Aggiunge un like di un utente a un commento.
     */
    private void addCommentLike(Comment comment, User user) {
        if (comment != null && user != null) {
            comment.getLikedBy().add(user);
            commentRepository.save(comment);
        }
    }

    /**
     * Cerca un post nella lista per una parola chiave presente nella descrizione.
     * Utile per trovare un post specifico senza dipendere dall'indice.
     *
     * @param posts   la lista di tutti i post
     * @param keyword parola chiave da cercare nella descrizione
     * @return il primo post trovato, oppure null
     */
    private Post findPostByDescription(List<Post> posts, String keyword) {
        for (Post p : posts) {
            if (p.getDescription() != null &&
                    p.getDescription().toLowerCase().contains(keyword.toLowerCase())) {
                return p;
            }
        }
        return null;
    }
}
