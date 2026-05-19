package com.phytosend.config;

import com.phytosend.repository.BotanicalCardRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.datasource.init.ScriptUtils;
import org.springframework.stereotype.Component;
import org.springframework.core.annotation.Order;

import javax.sql.DataSource;
import java.sql.Connection;

@Component
@Order(2) // 1. Utenti, 2. Catalogo, 3. Giardini, 4. Post
@Slf4j
public class CatalogSeeder implements CommandLineRunner {

    @Autowired
    private BotanicalCardRepository botanicalCardRepository;

    @Autowired
    private DataSource dataSource;

    /**
     * Metodo che viene eseguito all'avvio dell'applicazione
     * 
     * @param args Argomenti passati all'avvio
     */
    @Override
    public void run(String... args) throws Exception {
        if (botanicalCardRepository.count() == 0) {
            log.info("Catalogo vuoto rilevato! Inizio importazione delle schede da data.sql...");

            try (Connection connection = dataSource.getConnection()) {
                if (connection != null) {
                    ScriptUtils.executeSqlScript(connection, new ClassPathResource("data.sql"));
                }
                log.info("Autoseed catalogo completato!");
            } catch (Exception e) {
                log.error("Errore durante l'esecuzione del file data.sql: ", e);
            }
        } else {
            log.info("Le schede botaniche sono già presenti nel database. Skip importazione.");
        }
    }
}