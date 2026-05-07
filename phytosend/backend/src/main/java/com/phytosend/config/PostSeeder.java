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
            log.info("Nessun post rilevato. Generazione di 3 post per ogni pianta di ogni utente...");

            List<User> users = userRepository.findAll();
            if (users.isEmpty()) {
                log.warn("Impossibile creare i post: utenti mancanti.");
                return;
            }

            List<Post> testPosts = new ArrayList<>();

            // Array di immagini generiche a tema botanico per i post
            String[] photos = {
                "https://images.unsplash.com/photo-1416879598555-2571221b6a71?w=800&q=80",
                "https://images.unsplash.com/photo-1545241047-6083a36ee15f?w=800&q=80",
                "https://images.unsplash.com/photo-1453904300235-0f2f60b15b5d?w=800&q=80",
                "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800&q=80",
                "https://images.unsplash.com/photo-1497250681960-ef046c08a56e?w=800&q=80",
                "https://images.unsplash.com/photo-1491147334573-44cbb4602074?w=800&q=80",
                "https://images.unsplash.com/photo-1509423350716-97f9360b4e09?w=800&q=80",
                "https://images.unsplash.com/photo-1512428559087-560fa5ceab42?w=800&q=80",
                "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=800&q=80",
                "https://images.unsplash.com/photo-1463936575829-25148e1db1b8?w=800&q=80"
            };

            // Array di descrizioni per diversificare i post
            String[] captions = {
                "Guardate come sta crescendo bene! Qualche consiglio per farla sviluppare ancora di più?",
                "Oggi ho finalmente trovato il tempo per rinvasarla. Spero gradisca il nuovo terriccio e il vaso più grande.",
                "Le foglie nuove sono di un verde stupendo. Questa luce del mattino è perfetta per i colori.",
                "Piccolo aggiornamento settimanale. Sembra stare benissimo in questa posizione del soggiorno.",
                "Non mi stanco mai di guardarla. Sicuramente la mia preferita del giardino al momento!",
                "Qualcuno ha esperienza con questo tipo di esposizione? Mi sembra un po' giù di corda in questi giorni.",
                "Acqua, luce e tanto amore. Ecco il vero segreto per mantenerle sane e forti!",
                "Oggi pulizia delicata delle foglie e un po' di nebulizzazione per aumentare l'umidità. Si merita queste attenzioni.",
                "Cresce a vista d'occhio! Tra poco dovrò trovarle uno spazio tutto suo per quanto è diventata grande.",
                "La soddisfazione di veder spuntare un nuovo germoglio non ha eguali. La natura è meravigliosa."
            };

            int counter = 0;

            // Per ogni utente
            for (User user : users) {
                // Recupera le sue piante
                List<Plant> userPlants = plantRepository.findByGardenOwnerId(user.getId());
                
                // Per ogni pianta
                for (Plant plant : userPlants) {
                    
                    // Creiamo 3 post
                    for (int i = 0; i < 3; i++) {
                        String photo = photos[(counter) % photos.length];
                        String caption = captions[(counter) % captions.length];
                        int daysAgo = (counter * 3) % 90 + 1; // da 1 a 90 giorni fa
                        
                        testPosts.add(createPost(caption, photo, user, plant, daysAgo));
                        counter++;
                    }
                }
            }

            postRepository.saveAll(testPosts);
            log.info("✔️ Autoseed completato! Inseriti {} post totali (3 per ogni pianta).", testPosts.size());
        } else {
            log.info("I post di test sono già presenti per via di un seeding precedente.");
        }
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