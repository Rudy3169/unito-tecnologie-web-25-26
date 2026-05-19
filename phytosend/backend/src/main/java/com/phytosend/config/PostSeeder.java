package com.phytosend.config;

import com.phytosend.entity.Plant;
import com.phytosend.entity.Post;
import com.phytosend.entity.User;
import com.phytosend.repository.PlantRepository;
import com.phytosend.repository.PostRepository;
import com.phytosend.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

/**
 * Classe responsabile del popolamento iniziale del database con i dati relativi
 * ai post.
 * Esegue il seeding dei post all'avvio dell'applicazione, garantendo che il
 * database sia popolato con post creati da utenti registrati, associati alle
 * loro piante.
 */
@Component
@Order(4)
@Slf4j
public class PostSeeder implements CommandLineRunner {

        @Autowired
        private PostRepository postRepository;

        @Autowired
        private UserRepository userRepository;

        @Autowired
        private PlantRepository plantRepository;

        @Override
        public void run(String... args) throws Exception {

                if (postRepository.count() == 0) {
                        log.info("Nessun post rilevato. Generazione dei post manuali...");

                        List<Post> testPosts = new ArrayList<>();
                        Random random = new Random();

                        // Recupera alcuni utenti
                        User admin = userRepository.findByEmail("admin@phytosend.com").orElse(null);
                        User miriam = userRepository.findByEmail("miriam@phytosend.com").orElse(null);
                        User marco = userRepository.findByEmail("marco@phytosend.com").orElse(null);
                        User federica = userRepository.findByEmail("federica@phytosend.com").orElse(null);
                        User alessandro = userRepository.findByEmail("alessandro@phytosend.com").orElse(null);
                        User elena = userRepository.findByEmail("elena@phytosend.com").orElse(null);
                        User matteo = userRepository.findByEmail("matteo@phytosend.com").orElse(null);

                        // --- Post per Salvatore (ADMIN) ---
                        if (admin != null) {
                                // Recupera la pianta desiderata per nome (o nome comune se non ha soprannome)
                                Plant aloe = findPlantByName(admin, "Aloe");
                                Plant falangio = findPlantByName(admin, "Falangio");
                                Plant basilico = findPlantByName(admin, "Basilico");
                                Plant rosmarino = findPlantByName(admin, "Rosmarino");

                                // Post Aloe
                                if (aloe != null) {
                                        testPosts.add(createPost(
                                                        "Questa è la mia Aloe. Oggi ho deciso di cambiarle vaso, speriamo bene!",
                                                        "https://www.stockergarden.com/wp-content/uploads/2020/08/Alore-vera-3_1920x1440.jpg",
                                                        admin,
                                                        aloe,
                                                        random.nextInt(90) + 1));

                                        testPosts.add(createPost(
                                                        "Non mi stanco mai di guardarla. Sicuramente la mia preferita del giardino al momento!",
                                                        "https://www.edendeifiori.it/wp-content/webp-express/webp-images/doc-root/wp-content/uploads/chlorophytum_-cosmos-600x600.png.webp",
                                                        admin,
                                                        aloe,
                                                        random.nextInt(90) + 1));
                                }

                                // Post Falangio
                                if (falangio != null) {
                                        testPosts.add(createPost(
                                                        "Il mio Falangio sta mettendo tantissimi nuovi stoloni! Penso sia ora di propagarlo, qualcuno vuole una piantina per caso?",
                                                        "https://www.edendeifiori.it/wp-content/webp-express/webp-images/doc-root/wp-content/uploads/chlorophytum_-cosmos-600x600.png.webp",
                                                        admin,
                                                        falangio,
                                                        random.nextInt(90) + 1));

                                        testPosts.add(createPost(
                                                        "Ragazzi notavo che le punte del mio Falangio si stanno seccando leggermente. Poca umidità ambientale secondo voi o sto esagerando con l'acqua?",
                                                        "https://www.picturethisai.com/wiki-image/1080/440240379850129410.jpeg",
                                                        admin,
                                                        falangio,
                                                        random.nextInt(90) + 1));
                                }

                                // Post Basilico
                                if (basilico != null) {
                                        testPosts.add(createPost(
                                                        "Pronto per il pesto domenicale! Il basilico sul davanzale della cucina non delude mai.",
                                                        "https://staticcookist.akamaized.net/wp-content/uploads/sites/21/2025/06/come-coltivare-il-basilico-sul-balcone-1200x675.jpg",
                                                        admin,
                                                        basilico,
                                                        random.nextInt(90) + 1));

                                        testPosts.add(createPost(
                                                        "Aiuto! Le foglie del basilico sono piene di piccoli buchi. Lumache, bruchi o qualche altro insetto invisibile?",
                                                        "https://www.coltivarelorto.it/images/96200-07267-015-arima-marginata-web.jpg",
                                                        admin,
                                                        basilico,
                                                        random.nextInt(90) + 1));
                                }

                                // Post Rosmarino
                                if (rosmarino != null) {
                                        testPosts.add(createPost(
                                                        "Il profumo di questo rosmarino ogni volta che lo sfioro è terapeutico. La mia aromatica preferita in assoluto.",
                                                        "https://i0.wp.com/agricolatabasso.it/wp-content/uploads/2020/05/rosmarino.jpeg?fit=480%2C640&ssl=1",
                                                        admin,
                                                        rosmarino,
                                                        random.nextInt(90) + 1));

                                        testPosts.add(createPost(
                                                        "Ho letto che il rosmarino ama i terreni poveri, ma il mio mi sembra un po' stentato ultimamente. Mi consigliate di concimare un po'?",
                                                        "https://need.green/158-large_default/rosmarino-officinale-o-vaso-16-cm-.jpg",
                                                        admin,
                                                        rosmarino,
                                                        random.nextInt(90) + 1));
                                }
                        }

                        // --- Post per Miriam ---
                        if (miriam != null) {
                                Plant monstera = findPlantByName(miriam, "Monstera");
                                Plant orchidea = findPlantByName(miriam, "Orchidea");
                                Plant photos = findPlantByName(miriam, "Photos");
                                Plant margherita = findPlantByName(miriam, "Margherita");
                                Plant lavanda = findPlantByName(miriam, "Lavanda");

                                // Post Monstera
                                if (monstera != null) {
                                        testPosts.add(createPost(
                                                        "La mia Monstera ha appena cacciato una nuova foglia con tantissime fenestrature! Sono letteralmente innamorata.",
                                                        "https://i.redd.it/x8f9ig3hnxid1.jpeg",
                                                        miriam,
                                                        monstera,
                                                        random.nextInt(90) + 1));
                                }

                                // Post Orchidea
                                if (orchidea != null) {
                                        testPosts.add(createPost(
                                                        "Miracolo! La mia orchidea sta rifiorendo dopo quasi due anni di stop. Il segreto? L'ho letteralmente ignorata per mesi!",
                                                        "https://preview.redd.it/my-orchid-is-struggling-to-bloom-for-months-v0-nnkh5ib834je1.jpg?width=640&crop=smart&auto=webp&s=845daf13830e7be4e85efb1ad4862b79e25e8a97",
                                                        miriam,
                                                        orchidea,
                                                        random.nextInt(90) + 1));

                                        testPosts.add(createPost(
                                                        "Come vi regolate con le innaffiature dell'orchidea nei mesi più freddi? Meglio immersione o goccia a goccia dall'alto?",
                                                        "https://static.tecnichenuove.it/passioneinverde/2021/01/IMG-20170131-orchidea_rifiorita2.jpg",
                                                        miriam,
                                                        orchidea,
                                                        random.nextInt(90) + 1));
                                }

                                // Post Photos
                                if (photos != null) {
                                        testPosts.add(createPost(
                                                        "Il Pothos sta conquistando l'intera libreria del salotto. È la pianta più facile e soddisfacente di sempre.",
                                                        "https://www.pianteincasa.com/wp-content/uploads/2021/06/Pothos-Altezza-scaled.jpg",
                                                        miriam,
                                                        photos,
                                                        random.nextInt(90) + 1));

                                        testPosts.add(createPost(
                                                        "Le nuove foglie del mio Pothos nascono tutte verdi e senza le classiche variegature bianche. Sto sbagliando l'esposizione alla luce?",
                                                        "https://www.elicriso.it/it/come_coltivare/pothos/potos.jpg",
                                                        miriam,
                                                        photos,
                                                        random.nextInt(90) + 1));
                                }

                                // Post Margherita
                                if (margherita != null) {
                                        testPosts.add(createPost(
                                                        "Un tocco di primavera sul balcone! Queste margherite mi mettono sempre di buon umore al mattino.",
                                                        "https://www.interflora.it/blog/wp-content/uploads/margherita-africana-balcone.jpg",
                                                        miriam,
                                                        margherita,
                                                        random.nextInt(90) + 1));
                                }

                                // Post Lavanda
                                if (lavanda != null) {
                                        testPosts.add(createPost(
                                                        "Il profumo della Provenza direttamente qui a Trapani! La fioritura della lavanda quest'anno è un'esplosione.",
                                                        "https://pbs.twimg.com/media/HGVUHV_XUAAUbCr.jpg",
                                                        miriam,
                                                        lavanda,
                                                        random.nextInt(90) + 1));
                                }

                        }

                        // --- Post per Marco ---
                        if (marco != null) {
                                Plant cactus = findPlantByName(marco, "Cactus");
                                Plant salvia = findPlantByName(marco, "Salvia");
                                Plant sansevieria = findPlantByName(marco, "Sansevieria");

                                // Post Cactus
                                if (cactus != null) {
                                        testPosts.add(createPost(
                                                        "Il mio caro vecchio Cactus. Non so esattamente che specie sia, ma sopravvive a tutto, anche alle mie dimenticanze.",
                                                        "https://www.compo.de/dam/jcr:5e382c1a-8128-4670-9f96-a75044fe31b2/Kaktus%20Blumentopf.jpg?x=46&y=41",
                                                        marco,
                                                        cactus,
                                                        random.nextInt(90) + 1));

                                        testPosts.add(createPost(
                                                        "Ho notato una strana macchia marroncina e molliccia alla base del cactus... Ditemi che non è marciume, vi prego! C'è modo di salvarlo?",
                                                        "https://forum.cactofili.org/users/nahima/2014-11-02-sun-2-25-34nl7wg.jpg",
                                                        marco,
                                                        cactus,
                                                        random.nextInt(90) + 1));
                                }

                                // Post Salvia
                                if (salvia != null) {
                                        testPosts.add(createPost(
                                                        "Salvia fresca per i ravioli burro e salvia di stasera! Coltivare le aromatiche in vaso dà troppe soddisfazioni.",
                                                        "https://vithalgarden.com/media/magefan_blog/2014/12/SALVIA-700.jpg",
                                                        marco,
                                                        salvia,
                                                        random.nextInt(90) + 1));
                                }

                                // Post Sansevieria
                                if (sansevieria != null) {
                                        testPosts.add(createPost(
                                                        "La Sansevieria è ufficialmente la regina incontrastata dell'angolo buio del mio salotto. Imbattibile.",
                                                        "https://blainebox.com/cdn/shop/files/SANSIVIERA.jpg?v=1776245143&width=2048",
                                                        marco,
                                                        sansevieria,
                                                        random.nextInt(90) + 1));

                                        testPosts.add(createPost(
                                                        "Ogni quanto rinvasate la Sansevieria? La mia sta letteralmente per spaccare il vaso in plastica in cui si trova!",
                                                        "https://www.ricoter.ch/content/files/22667/GS585594-r1-1200x630-proportionalsmallest.webp",
                                                        marco,
                                                        sansevieria,
                                                        random.nextInt(90) + 1));
                                }

                        }

                        // --- Post per Federica ---
                        if (federica != null) {
                                Plant ficus = findPlantByName(federica, "Ficus");
                                Plant ranuncolo = findPlantByName(federica, "Ranuncolo");
                                Plant mughetto = findPlantByName(federica, "Mughetto");
                                Plant gelsomino = findPlantByName(federica, "Gelsomino");
                                Plant geranio = findPlantByName(federica, "Geranio");

                                // Post Ficus
                                if (ficus != null) {
                                        testPosts.add(createPost(
                                                        "Le foglie enormi del Ficus elastica vanno spolverate spesso, lo ammetto, ma guardate che lucidità pazzesca!",
                                                        "https://www.simegarden.com/cdn/shop/files/simegarden-ficus-elastica-robusta-53365370945869.jpg?v=1700153448&width=480",
                                                        federica,
                                                        ficus,
                                                        random.nextInt(90) + 1));

                                        testPosts.add(createPost(
                                                        "Il Ficus sta perdendo un paio di foglie basali, diventano prima gialle e poi cadono giù. È il normale ricambio o devo preoccuparmi?",
                                                        "https://i.redd.it/ficus-yellowing-leaves-v0-u2sfy4094jxe1.jpg?width=3072&format=pjpg&auto=webp&s=b020204a5d258bd4dc62bfc1cbe70a5545091ff1",
                                                        federica,
                                                        ficus,
                                                        random.nextInt(90) + 1));
                                }

                                // Post Ranuncolo
                                if (ranuncolo != null) {
                                        testPosts.add(createPost(
                                                        "I ranuncoli sono finalmenti sbocciati! Sembrano delle piccole rose perfette di carta velina. 😍",
                                                        "https://www.ilgiardinodellemeraviglie.it/upload/cache/immagini/prodotti/giardino/ranuncolo-1000x750.jpg",
                                                        federica,
                                                        ranuncolo,
                                                        random.nextInt(90) + 1));
                                }

                                // Post Mughetto
                                if (mughetto != null) {
                                        testPosts.add(createPost(
                                                        "Quel profumo delicato di mughetto che annuncia la bella stagione... Unico e insostituibile nel mio giardino.",
                                                        "https://m.media-amazon.com/images/I/81jQjV3NWIL.jpg",
                                                        federica,
                                                        mughetto,
                                                        random.nextInt(90) + 1));
                                }

                                // Post Gelsomino
                                if (gelsomino != null) {
                                        testPosts.add(createPost(
                                                        "La fioritura serale del gelsomino inonda tutta la casa. L'attesa ha ripagato ogni sforzo.",
                                                        "https://www.giunglaurbana.com/wp-content/uploads/2026/02/rincospermo-in-terrazzo.jpg",
                                                        federica,
                                                        gelsomino,
                                                        random.nextInt(90) + 1));

                                        testPosts.add(createPost(
                                                        "I boccioli del gelsomino stanno cadendo prima ancora di aprirsi. Troppa poca acqua o forse correnti d'aria fredda?",
                                                        "https://external-preview.redd.it/can-someone-tell-what-is-happening-to-my-jasmine-the-buds-v0-YcrYh5hYD-_rD7ENtlx3gSMBf69twkX0-Kn1kkSwdL8.jpg?width=640&crop=smart&auto=webp&s=48538d073d624266393f26442dae208f685ae73a",
                                                        federica,
                                                        gelsomino,
                                                        random.nextInt(90) + 1));
                                }

                                // Post Geranio
                                if (geranio != null) {
                                        testPosts.add(createPost(
                                                        "Maledetta farfallina del geranio! Avete rimedi naturali e davvero efficaci per salvare i fusti prima che sia troppo tardi?",
                                                        "https://www.bestprato.com/green/wp-content/uploads/2024/07/farfallina-gernaio-1024x684.jpg",
                                                        federica,
                                                        geranio,
                                                        random.nextInt(90) + 1));
                                }
                        }

                        // --- Post per Alessandro ---
                        if (alessandro != null) {
                                Plant giglio = findPlantByName(alessandro, "Giglio");
                                Plant rosa = findPlantByName(alessandro, "Rosa");
                                Plant ortensia = findPlantByName(alessandro, "Ortensia");

                                // Post Giglio
                                if (giglio != null) {
                                        testPosts.add(createPost(
                                                        "L'eleganza del Giglio non si batte. Questa varietà bianca che ho preso è semplicemente spettacolare sulla terrazza.",
                                                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSTU0D_5Mse4R2Hw_ZHh3Vf0WQsMs16RqdTdg&s",
                                                        alessandro,
                                                        giglio,
                                                        random.nextInt(90) + 1));

                                        testPosts.add(createPost(
                                                        "I fiori del giglio sono stupendi, ma il polline macchia ovunque! Voi togliete le antere (i pistilli arancioni) per evitare disastri?",
                                                        "https://upload.wikimedia.org/wikipedia/commons/9/9f/LiliumAuratumVVirginaleBluete2Rework.jpg",
                                                        alessandro,
                                                        giglio,
                                                        random.nextInt(90) + 1));
                                }

                                // Post Rosa
                                if (rosa != null) {
                                        testPosts.add(createPost(
                                                        "La mia rosa sta regalando le prime grandi soddisfazioni dell'anno. Il colore dal vivo è ancora più intenso. 🌹",
                                                        "https://lerosedifirenze.com/9401-large_default/rosa-black-baccara.jpg",
                                                        alessandro,
                                                        rosa,
                                                        random.nextInt(90) + 1));

                                        testPosts.add(createPost(
                                                        "Afidi sulla rosa... di nuovo! Il sapone molle di potassio vi risulta sufficiente o devo passare a metodi più decisi?",
                                                        "https://www.informazioneambiente.it/wp-content/uploads/2020/04/Afidi.jpg",
                                                        alessandro,
                                                        rosa,
                                                        random.nextInt(90) + 1));
                                }

                                // Post Ortensia
                                if (ortensia != null) {
                                        testPosts.add(createPost(
                                                        "Quest'anno l'ortensia è diventata di un blu intensissimo e perfetto! Il solfato di alluminio ha fatto il suo dovere.",
                                                        "https://res.cloudinary.com/fleurop/fl_lossy,f_auto,fl_progressive,q_auto,w_550/cmsimages2/content/hortensien-lavendel/hl-1200x800-5.jpg",
                                                        alessandro,
                                                        ortensia,
                                                        random.nextInt(90) + 1));

                                        testPosts.add(createPost(
                                                        "Le foglie dell'ortensia sono diventate un po' sbiadite, giallognole, con le nervature verdi molto evidenti. Sarà carenza di ferro (clorosi)?",
                                                        "https://i.redd.it/what-diseases-do-my-two-hydrangeas-have-one-has-red-spots-v0-ierfbffda5xd1.jpg?width=1280&format=pjpg&auto=webp&s=3e03e7fc06714a9ecef602f1c41b1cc49d998f5f",
                                                        alessandro,
                                                        ortensia,
                                                        random.nextInt(90) + 1));
                                }

                        }

                        // --- Post per Elena ---
                        if (elena != null) {
                                Plant calathea = findPlantByName(elena, "Calathea");
                                Plant prezzemolo = findPlantByName(elena, "Prezzemolo");
                                Plant rosa = findPlantByName(elena, "Rosa");
                                Plant timo = findPlantByName(elena, "Timo");

                                // Post Calathea
                                if (calathea != null) {
                                        testPosts.add(createPost(
                                                        "Il movimento delle foglie della Calathea durante l'arco della giornata mi affascina sempre, sembra viva.",
                                                        "https://cdn.cosedicasa.com/wp-content/uploads/2025/11/Calathea-makoyana-pianta.jpg",
                                                        elena,
                                                        calathea,
                                                        random.nextInt(90) + 1));

                                        testPosts.add(createPost(
                                                        "Perché le punte della mia Calathea diventano inesorabilmente marroni e secche? Nebulizzo le foglie tutti i santi giorni! 😥",
                                                        "https://i.redd.it/calathea-rufibarba-crispy-brown-yellow-tips-edges-is-there-v0-0lkiuoz6rgd81.jpg?width=3024&format=pjpg&auto=webp&s=4be4115a7cf0bb21ef1f57e2c218a78649c58790",
                                                        elena,
                                                        calathea,
                                                        random.nextInt(90) + 1));
                                }

                                // Post Prezzemolo
                                if (prezzemolo != null) {
                                        testPosts.add(createPost(
                                                        "Prezzemolo fresco a chilometro zero, direttamente dal vaso alla padella. Nessun paragone con quello del supermercato.",
                                                        "https://static.tecnichenuove.it/passioneinverde/2019/01/prezzemolo_vaso.jpg",
                                                        elena,
                                                        prezzemolo,
                                                        random.nextInt(90) + 1));
                                }

                                // Post Rosa
                                if (rosa != null) {
                                        testPosts.add(createPost(
                                                        "Una piccola rosellina in vaso che profuma di antico. Le cure e le potature attente ripagano sempre.",
                                                        "https://i.etsystatic.com/31678805/r/il/7e7b16/5506589067/il_570xN.5506589067_ecx0.jpg",
                                                        elena,
                                                        rosa,
                                                        random.nextInt(90) + 1));
                                }

                                // Post Timo
                                if (timo != null) {
                                        testPosts.add(createPost(
                                                        "Timo in piena fioritura! Attira tantissime piccole api e insetti impollinatori sul balcone, bellissimo da osservare.",
                                                        "https://visseed.com/cdn/shop/files/943.08_c36d776a-25f6-495c-8347-0834dec6ba92.jpg?v=1735213605",
                                                        elena,
                                                        timo,
                                                        random.nextInt(90) + 1));

                                        testPosts.add(createPost(
                                                        "Il cespuglio di timo sta seccando dal centro verso l'esterno, sembra quasi bruciato. Potrebbe essere un problema di ristagno idrico o fungo?",
                                                        "https://preview.redd.it/help-thyme-plant-drying-out-v0-zgppirbaq12b1.jpg?width=640&crop=smart&auto=webp&s=6860d1975515ab539bdee02ba574ebfa81706898",
                                                        elena,
                                                        timo,
                                                        random.nextInt(90) + 1));
                                }

                        }

                        // --- Post per Matteo ---
                        if (matteo != null) {
                                Plant bambu = findPlantByName(matteo, "Bambù");
                                Plant acero = findPlantByName(matteo, "Acero giapponese");
                                Plant limone = findPlantByName(matteo, "Limone");

                                if (bambu != null) {
                                        testPosts.add(createPost(
                                                        "Il mio Bambù sta crescendo a dismisura! Qualcuno ha consigli su come contenerne le radici in vaso senza farlo soffrire?",
                                                        "https://media.tuscanyplants.it/media/catalog/product/cache/a9b55e5cf5b8c272f397c5459220a966/b/a/bamb_bissettii_c10_125-150_leo_sr.jpg",
                                                        matteo,
                                                        bambu,
                                                        random.nextInt(90) + 1));
                                }

                                if (acero != null) {
                                        testPosts.add(createPost(
                                                        "Le foglie dell'Acero Giapponese in autunno sono uno spettacolo per gli occhi. Un rosso infuocato indescrivibile!",
                                                        "https://static.wixstatic.com/media/80e284_a4e9a567d3064196a617148b86950e46~mv2.png/v1/fill/w_506,h_506,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/80e284_a4e9a567d3064196a617148b86950e46~mv2.png",
                                                        matteo,
                                                        acero,
                                                        random.nextInt(90) + 1));
                                }

                                if (limone != null) {
                                        testPosts.add(createPost(
                                                        "Prima fioritura per il mio piccolo alberello di limone. Speriamo faccia frutti quest'anno! 🍋",
                                                        "https://www.pianteincasa.com/wp-content/uploads/2021/04/Limone-1024x768.jpg",
                                                        matteo,
                                                        limone,
                                                        random.nextInt(90) + 1));
                                }
                        }

                        postRepository.saveAll(testPosts);
                        log.info("Autoseed post completato! Inseriti {} post totali.", testPosts.size());
                } else {
                        log.info("I post sono già presenti per via di un seeding precedente.");
                }
        }

        /**
         * Metodo di supporto per trovare rapidamente una pianta nel giardino di un
         * utente.
         */
        private Plant findPlantByName(User user, String name) {
                List<Plant> plants = plantRepository.findByGardenOwnerId(user.getId());
                for (Plant p : plants) {
                        if (name.equalsIgnoreCase(p.getName()) ||
                                        (p.getCard() != null && name.equalsIgnoreCase(p.getCard().getCommonName()))) {
                                return p;
                        }
                }
                return null;
        }

        private Post createPost(String description, String photoUrl, User author, Plant plant, int daysAgo) {
                Post post = new Post();

                // Titolo: soprannome se presente, altrimenti nome comune scheda
                String title = (plant != null && plant.getName() != null && !plant.getName().isBlank())
                                ? plant.getName()
                                : (plant != null && plant.getCard() != null ? plant.getCard().getCommonName() : "Post");

                post.setTitle(title);
                post.setDescription(description);
                post.setURLPhoto(photoUrl);
                post.setCreationDate(LocalDateTime.now().minusDays(daysAgo).minusHours((daysAgo * 5) % 24));
                post.setAuthor(author);
                post.setPlant(plant);
                return post;
        }
}