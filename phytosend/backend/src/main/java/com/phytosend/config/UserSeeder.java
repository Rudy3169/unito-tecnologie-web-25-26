package com.phytosend.config;

import com.phytosend.entity.User;
import com.phytosend.entity.UserRole;
import com.phytosend.repository.UserRepository;
import com.phytosend.service.UserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.core.annotation.Order;

/**
 * Seeder utile a popolare il database all'avvio nel caso in cui la raccolta
 * degli utenti fosse completamente vuota. Inserisce 1 admin e 5 utenti di test.
 */
@Component
@Order(1)
@Slf4j
public class UserSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserService userService;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            log.info("Nessun utente rilevato. Popolamento tabella Users con 1 admin e 5 utenti...");

            // Admin
            User admin = new User();
            admin.setName("Salvatore");
            admin.setSurname("Rudisi");
            admin.setEmail("admin@phytosend.com");
            admin.setPassword("password");
            admin.setRole(UserRole.ADMIN);
            admin.setCity("Torino");
            admin.setBio(
                    "Amministratore della piattaforma PhytoSend. Appassionato di piante tropicali e giardini zen.");
            userService.registerUser(admin);

            // User 1
            User miriam = new User();
            miriam.setName("Miriam");
            miriam.setSurname("Zito");
            miriam.setEmail("miriam@phytosend.com");
            miriam.setPassword("password");
            miriam.setRole(UserRole.BASE);
            miriam.setCity("Trapani");
            miriam.setBio("Appassionata di giardinaggio da balcone. Mi piacciono i colori vivaci! 🌺");
            userService.registerUser(miriam);

            // User 2
            User marco = new User();
            marco.setName("Marco");
            marco.setSurname("Verdi");
            marco.setEmail("marco@phytosend.com");
            marco.setPassword("password");
            marco.setRole(UserRole.BASE);
            marco.setCity("Milano");
            marco.setBio("Le piante grasse sono la mia passione. Poca acqua, tanta resa. 🌵");
            userService.registerUser(marco);

            // User 3
            User federica = new User();
            federica.setName("Federica");
            federica.setSurname("Gallo");
            federica.setEmail("federica@phytosend.com");
            federica.setPassword("password");
            federica.setRole(UserRole.BASE);
            federica.setCity("Firenze");
            federica.setBio("Trasformo la mia casa in una giungla urbana. Adoro le grandi foglie! 🌿");
            userService.registerUser(federica);

            // User 4
            User alessandro = new User();
            alessandro.setName("Alessandro");
            alessandro.setSurname("Costa");
            alessandro.setEmail("alessandro@phytosend.com");
            alessandro.setPassword("password");
            alessandro.setRole(UserRole.BASE);
            alessandro.setCity("Napoli");
            alessandro.setBio("Innamorato del profumo delle piante aromatiche e del mare. 🍋");
            userService.registerUser(alessandro);

            // User 5
            User elena = new User();
            elena.setName("Elena");
            elena.setSurname("Romano");
            elena.setEmail("elena@phytosend.com");
            elena.setPassword("password");
            elena.setRole(UserRole.BASE);
            elena.setCity("Roma");
            elena.setBio("Esperta di orchidee e fiori delicati. Il verde è il mio colore felice! 🌸");
            userService.registerUser(elena);

            log.info("✔️ Autoseed completato! Creati 1 admin e 5 utenti con pwd 'password'.");
        } else {
            log.info("Gli utenti di test sono già presenti per via di un seeding precedente.");
        }
    }
}