package com.phytosend.controller;

import com.phytosend.service.PerenualService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.init.ScriptUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.core.io.Resource;
import org.springframework.beans.factory.annotation.Value;
import com.phytosend.repository.BotanicalCardRepository;

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

    @Autowired
    private BotanicalCardRepository botanicalCardRepository;

    /**
     * Importa una lista di piante dal database esterno (Perenual API) per popolare
     * il database locale. Riprende in automatico dall'ultima pagina scaricata.
     *
     * @param pages il numero di pagine da importare dall'API (default a 5)
     * @return un messaggio di avvenuta accettazione della richiesta
     */
    @PostMapping("/import-plants")
    public ResponseEntity<String> importPlants(@RequestParam(defaultValue = "5") int pages) {

        // Calcoliamo quante piante abbiamo già
        long totalImported = botanicalCardRepository.count();

        // Calcoliamo da quale pagina ripartire (sapendo che Perenual dà 30 piante per
        // pagina)
        int startPage = (int) (totalImported / 30) + 1;

        // Calcoliamo la pagina di fine
        int endPage = startPage + pages - 1;

        // Lanciamo il servizio con i due parametri corretti
        perenualService.importPlants(startPage, endPage); // Importazione asincrona

        return ResponseEntity.accepted()
                .body("Importazione manuale avviata in background dalla pagina " + startPage + " alla " + endPage
                        + ". L'operazione richiede tempo.");
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

                    card.setCreatedAt(java.time.LocalDate.now());

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
    private RestTemplate restTemplate;

    @Value("${perenual.api.key}")
    private String perenualApiKey;

    /**
     * Restituisce il numero di piante presenti nel database locale.
     * 
     * @return un JSON con il conteggio delle piante
     */
    @GetMapping("/stats")
    public ResponseEntity<?> getDatabaseStats() {
        long count = botanicalCardRepository.count();
        long importedToday = botanicalCardRepository.countByCreatedAt(java.time.LocalDate.now());

        boolean isOnline = true;

        // Restituisce il JSON
        String jsonResponse = String.format("{\"totalPlants\": %d, \"perenualOnline\": %b, \"importedToday\": %d}",
                count, isOnline, importedToday);
        return ResponseEntity.ok(jsonResponse);
    }
}
