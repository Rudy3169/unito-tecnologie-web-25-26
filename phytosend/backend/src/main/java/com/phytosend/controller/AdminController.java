package com.phytosend.controller;

import com.phytosend.service.PerenualService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.init.ScriptUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.core.io.Resource;
import org.springframework.beans.factory.annotation.Value;

import javax.sql.DataSource;
import java.sql.Connection;
import java.nio.charset.StandardCharsets;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private PerenualService perenualService;

    /**
     * Importa una lista di piante dal database esterno (Perenual API) per popolare
     * il database locale.
     * L'operazione viene demandata ad un thread asincrono.
     *
     * @param pages il numero di pagine da importare dall'API (default a 5)
     * @return un messaggio di avvenuta accettazione della richiesta
     */
    @PostMapping("/import-plants")
    public ResponseEntity<String> importPlants(@RequestParam(defaultValue = "5") int pages) {
        perenualService.importPlants(pages); // Importazione asincrona
        return ResponseEntity.accepted()
                .body("Importazione avviata in background. L'operazione potrebbe richiedere del tempo.");
    }

    @Autowired
    private DataSource dataSource;
    @Value("classpath:data.sql")
    private Resource dataSqlScript;
    @Autowired
    private JdbcTemplate jdbcTemplate;

    /**
     * Ripristina il catalogo delle piante dal file data.sql.
     * 
     * @return un messaggio di avvenuta ricarica
     */
    @PostMapping("/reload-catalog")
    public ResponseEntity<String> reloadCatalog() {
        new Thread(() -> {
            try {
                String sql = new String(dataSqlScript.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
                Pattern pattern = Pattern.compile(
                        "\\('([^']*)', '([^']*)', '([^']*)', '([^']*)', '([^']*)', (\\d+), '([^']*)', '([^']*)', '([^']*)'\\)");
                Matcher matcher = pattern.matcher(sql);

                int aggiornate = 0;
                while (matcher.find()) {
                    String scientific = matcher.group(2);

                    com.phytosend.entity.BotanicalCard card = botanicalCardRepository
                            .findFirstByScientificName(scientific);

                    if (card == null) {
                        card = new com.phytosend.entity.BotanicalCard();
                        card.setScientificName(scientific);
                    }

                    card.setCommonName(matcher.group(1));
                    card.setFamily(matcher.group(3));
                    card.setExposure(matcher.group(4));
                    card.setIrrigation(matcher.group(5));
                    card.setWaterFrequencyDays(Integer.parseInt(matcher.group(6)));
                    card.setFertilization(matcher.group(7));
                    card.setSoil(matcher.group(8));
                    card.setUrlDefaultPhoto(matcher.group(9));

                    botanicalCardRepository.save(card);
                    aggiornate++;
                }
                System.out.println("Ripristino catalogo completato in modo sicuro! Schede aggiornate: " + aggiornate);
            } catch (Exception e) {
                System.err.println("Errore durante l'aggiornamento del file data.sql: " + e.getMessage());
            }
        }).start();
        return ResponseEntity.accepted().body(
                "Ripristino catalogo avviato! Tutte le piante verranno aggiornate senza cancellare i post sociali.");
    }

    @Autowired
    private com.phytosend.repository.BotanicalCardRepository botanicalCardRepository;

    @Autowired
    private com.phytosend.service.WikipediaService wikipediaService;

    @PostMapping("/fetch-wikipedia-photos")
    public ResponseEntity<String> fetchWikipediaPhotos() {
        new Thread(() -> {
            var cards = botanicalCardRepository.findAll();
            for (var card : cards) {
                String wikiPhoto = wikipediaService.ottieniFotoWikipedia(card.getScientificName());
                if (wikiPhoto != null) {
                    card.setUrlDefaultPhoto(wikiPhoto);
                    botanicalCardRepository.save(card);
                }
                try {
                    Thread.sleep(200);
                } catch (InterruptedException ignored) {
                }
            }
            System.out.println("Ricerca di massa foto Wikipedia conclusa!");
        }).start();

        return ResponseEntity.accepted()
                .body("Ricerca intensiva foto da Wikipedia avviata per tutte le piante in background!");
    }
}
