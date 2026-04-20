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
 * degli utenti fosse completamente vuota. Inserisce 3 utenze didattiche.
 */
@Component
@Order(1)
@Slf4j
public class DatabaseSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserService userService;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            log.info("Nessun utente rilevato. Popolamento tabella Users con identità di test in corso...");

            // Utente Amministratore (Admin)
            User admin = new User();
            admin.setName("Super");
            admin.setSurname("Admin");
            admin.setEmail("admin@phytosend.com");
            admin.setPassword("password");
            admin.setRole(UserRole.ADMIN);
            userService.registerUser(admin);

            // Utente Premium (Pro)
            User pro = new User();
            pro.setName("Esperto");
            pro.setSurname("Pro");
            pro.setEmail("pro@phytosend.com");
            pro.setPassword("password");
            pro.setRole(UserRole.PRO);
            userService.registerUser(pro);

            // Utente Standard (Base)
            User base = new User();
            base.setName("Utente");
            base.setSurname("Base");
            base.setEmail("user@phytosend.com");
            base.setPassword("password");
            base.setRole(UserRole.BASE);
            userService.registerUser(base);

            log.info("✔️ Autoseed completato! Creati {admin, pro, user}@phytosend.com con pwd 'password'.");
        } else {
            log.info("Gli utenti di test sono già presenti per via di un seeding precedente.");
        }
    }
}
