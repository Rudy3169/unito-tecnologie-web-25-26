package com.phytosend.config;

import com.phytosend.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.datasource.init.ScriptUtils;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;

/**
 * Seeder utile a popolare il database all'avvio nel caso in cui la raccolta
 * degli utenti fosse completamente vuota. Inserisce 3 utenze didattiche.
 */
@Component
@Slf4j
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DataSource dataSource;

    @Override
    public void run(String... args) throws Exception {
        // Se il database non ha utenti, significa che è vergine e va popolato
        if (userRepository.count() == 0) {
            log.info("🌱 Database vuoto rilevato! Inizio importazione massiva da data.sql...");

            // Usiamo ScriptUtils per far eseguire nativamente TUTTO il file SQL al database
            try (Connection connection = dataSource.getConnection()) {
                ScriptUtils.executeSqlScript(connection, new ClassPathResource("data.sql"));
                log.info("✔️ Importazione completata! Piante, Utenti e Post caricati in un lampo.");
            } catch (Exception e) {
                log.error("Errore durante l'esecuzione del file data.sql: ", e);
            }
        } else {
            log.info("🌿 Dati già presenti nel database. Skip importazione automatica.");
        }
    }
}