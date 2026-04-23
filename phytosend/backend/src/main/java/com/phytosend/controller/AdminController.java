package com.phytosend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.core.io.Resource;
import org.springframework.beans.factory.annotation.Value;
import com.phytosend.repository.BotanicalCardRepository;
import com.phytosend.entity.BotanicalCard;

import java.nio.charset.StandardCharsets;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private BotanicalCardRepository botanicalCardRepository;

    @Value("classpath:data.sql")
    private Resource dataSqlScript;

    @PostMapping("/reload-catalog")
    public ResponseEntity<String> reloadCatalog() {
        try {
            String sql = new String(dataSqlScript.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
            Pattern pattern = Pattern.compile(
                    "\\('([^']*)', '([^']*)', '([^']*)', '([^']*)', '([^']*)', (\\d+), '([^']*)', '([^']*)', '([^']*)'\\)");
            Matcher matcher = pattern.matcher(sql);

            int aggiornate = 0;
            int saltate = 0;

            while (matcher.find()) {
                String common = matcher.group(1);
                String scientific = matcher.group(2);

                try {
                    BotanicalCard card = botanicalCardRepository.findFirstByCommonNameAndScientificName(common,
                            scientific);

                    if (card == null) {
                        card = new BotanicalCard();
                        card.setCommonName(common);
                        card.setScientificName(scientific);
                    }
                    card.setFamily(matcher.group(3));
                    card.setExposure(matcher.group(4));
                    card.setIrrigation(matcher.group(5));
                    card.setWaterFrequencyDays("Ogni " + matcher.group(6) + " giorni");
                    card.setFertilization(matcher.group(7));
                    card.setSoil(matcher.group(8));
                    card.setUrlDefaultPhoto(matcher.group(9));
                    card.setCreatedAt(java.time.LocalDate.of(2000, 1, 1));

                    botanicalCardRepository.saveAndFlush(card);
                    aggiornate++;
                } catch (Exception e) {
                    // Ignora i duplicati che violano i vincoli
                    saltate++;
                }
            }

            if (aggiornate == 0 && saltate == 0) {
                return ResponseEntity.internalServerError()
                        .body("Errore: Il formato del file data.sql non corrisponde al Regex. Nessuna pianta trovata.");
            }

            return ResponseEntity.ok("Ripristino completato! \n Schede caricate: " + aggiornate);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Errore durante il ripristino: " + e.getMessage());
        }
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getDatabaseStats() {
        long count = botanicalCardRepository.count();

        String jsonResponse = String.format("{\"totalPlants\": %d}", count);
        return ResponseEntity.ok(jsonResponse);
    }
}
