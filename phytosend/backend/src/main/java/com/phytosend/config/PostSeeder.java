package com.phytosend.config;

import com.phytosend.entity.Post;
import com.phytosend.entity.User;
import com.phytosend.repository.PostRepository;
import com.phytosend.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

/**
 * Seeder per popolare la tabella dei Post con 10 contenuti fittizi.
 * L'annotazione @Order(2) assicura che venga eseguito DOPO il DatabaseSeeder
 * (che crea gli utenti).
 */
@Component
@Order(2)
@Slf4j
public class PostSeeder implements CommandLineRunner {

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    public void run(String... args) throws Exception {

        // Il controllo troverà 0 post e farà partire il popolamento!
        if (postRepository.count() == 0) {
            log.info("Nessun post rilevato. Popolamento tabella Posts con 10 post di test in corso...");

            // Recuperiamo gli utenti creati dal DatabaseSeeder per assegnargli i post
            User admin = userRepository.findByEmail("admin@phytosend.com").orElse(null);
            User pro = userRepository.findByEmail("pro@phytosend.com").orElse(null);
            User base = userRepository.findByEmail("user@phytosend.com").orElse(null);

            if (admin == null || pro == null || base == null) {
                log.warn("Impossibile creare i post: utenti di base mancanti. Eseguire prima il DatabaseSeeder.");
                return;
            }

            // Creazione di 10 post fittizi
            List<Post> testPosts = Arrays.asList(
                    createPost("La mia nuova Monstera! 🌿",
                            "Oggi ho finalmente comprato una Monstera Deliciosa. Guardate che foglie meravigliose! Qualche consiglio per l'esposizione?",
                            "https://plantersplace.com/wp-content/uploads/2022/08/20200309_110255-scaled.jpg",
                            base),
                    createPost("Fioritura Phalaenopsis",
                            "Dopo mesi di attesa, la mia orchidea è sbocciata. Il segreto? Poca acqua e luce filtrata.",
                            "https://fasolipiante.com/wp-content/uploads/2020/08/3-rami.jpeg",
                            pro),
                    createPost("Pothos infinito",
                            "Il mio Epipremnum aureum sta conquistando tutto il salotto. È davvero la pianta più facile da curare per i principianti.",
                            "https://www.pianteincasa.com/wp-content/uploads/2021/06/Pothos-Altezza-scaled.jpg",
                            base),
                    createPost("Problemi con il Ficus",
                            "Aiuto! Il mio Ficus Elastica sta perdendo le foglie basse. Annaffio una volta a settimana. Cosa sbaglio?",
                            "https://unquadratodigiardino.it/media/kunena/attachments/10321/20220522_082907.jpg",
                            base),
                    createPost("Angolo delle succulente 🌵",
                            "Ho riorganizzato il mio davanzale con le nuove piante grasse prese al vivaio. Adoro questo mix di colori.",
                            "https://i.redd.it/e9ibns9lssw91.jpg",
                            pro),
                    createPost("Calathea: amore e odio",
                            "È bellissima, ma quanto è capricciosa! Solo acqua demineralizzata e umidità al 70%.",
                            "https://thursd.com/storage/media/101706/Man-with-a-huge-leafed-Calathea-plant.jpg",
                            admin),
                    createPost("Raccolta Aloe Vera",
                            "Oggi ho tagliato una foglia dalla mia Aloe per estrarre il gel. Perfetto per le scottature solari.",
                            "https://aloevonderweid.com/wp-content/uploads/2016/06/SEZIONE-CARATTERISTICHE-EXTRA-PRODOTTO-WOOCOMMERCE-1-1280x853.jpg",
                            base),
                    createPost("Il mio primo Cactus",
                            "Piccolo, spinoso e adorabile. Speriamo di non annaffiarlo troppo!",
                            "https://i.etsystatic.com/23308416/r/il/54c0da/4595512158/il_fullxfull.4595512158_jbf2.jpg",
                            base),
                    createPost("Sansevieria indistruttibile",
                            "Se vi dimenticate sempre di annaffiare, questa è la pianta che fa per voi. La lingua di suocera perdona tutto.",
                            "https://www.simegarden.com/cdn/shop/files/simegarden-sansevieria-trifasciata-30-cm-61584599089485.jpg?v=1735027351&width=480",
                            pro),
                    createPost("Felce in bagno 🚿",
                            "La mia nuova Nephrolepis exaltata ha trovato casa in bagno. L'umidità della doccia la sta facendo esplodere di verde!",
                            "https://www.giunglaurbana.com/wp-content/uploads/2026/01/arredare-bagno-con-le-piante.jpg",
                            admin));

            postRepository.saveAll(testPosts);
            log.info("✔️ Autoseed completato! Inseriti 10 post fittizi.");
        } else {
            log.info("I post di test sono già presenti per via di un seeding precedente.");
        }
    }

    // Metodo helper per creare i post più agilmente
    private Post createPost(String title, String description, String photoUrl, User author) {
        Post post = new Post();
        post.setTitle(title); // Il titolo è obbligatorio (@NotBlank)
        post.setDescription(description); // La descrizione è obbligatoria (@NotBlank)
        post.setURLPhoto(photoUrl);
        post.setCreationDate(LocalDateTime.now());
        post.setAuthor(author); // Imposta l'autore (relazione @ManyToOne)
        // Lasciamo 'plant' nullo, poiché non è obbligatorio nel tuo modello Post
        return post;
    }
}