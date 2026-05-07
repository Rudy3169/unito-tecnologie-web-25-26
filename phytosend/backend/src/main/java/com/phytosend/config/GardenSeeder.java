package com.phytosend.config;

import com.phytosend.entity.BotanicalCard;
import com.phytosend.entity.Garden;
import com.phytosend.entity.Plant;
import com.phytosend.entity.User;
import com.phytosend.repository.BotanicalCardRepository;
import com.phytosend.repository.GardenRepository;
import com.phytosend.repository.PlantRepository;
import com.phytosend.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
@Order(3)
@Slf4j
public class GardenSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private GardenRepository gardenRepository;

    @Autowired
    private PlantRepository plantRepository;

    @Autowired
    private BotanicalCardRepository botanicalCardRepository;

    @Override
    public void run(String... args) throws Exception {
        if (plantRepository.count() > 0) {
            log.info("Le piante nei giardini sono già presenti. Skip seeding giardini.");
            return;
        }

        if (botanicalCardRepository.count() == 0) {
            log.warn("Nessuna scheda botanica trovata. Impossibile popolare i giardini.");
            return;
        }

        User admin = userRepository.findByEmail("admin@phytosend.com").orElse(null);
        User miriam = userRepository.findByEmail("miriam@phytosend.com").orElse(null);
        User marco = userRepository.findByEmail("marco@phytosend.com").orElse(null);
        User sofia = userRepository.findByEmail("sofia@phytosend.com").orElse(null);
        User alessandro = userRepository.findByEmail("alessandro@phytosend.com").orElse(null);
        User elena = userRepository.findByEmail("elena@phytosend.com").orElse(null);

        if (admin == null || miriam == null || marco == null || sofia == null || alessandro == null || elena == null) {
            log.warn("Utenti mancanti. Impossibile popolare i giardini.");
            return;
        }

        log.info("Popolamento giardini con piante collegate al catalogo per i 6 utenti...");

        BotanicalCard cardMonstera = findCard("Monstera");
        BotanicalCard cardOrchidea = findCard("Orchidea");
        BotanicalCard cardPothos = findCard("Pothos");
        BotanicalCard cardFicus = findCard("Ficus elastica");
        BotanicalCard cardSucculenta = findCard("Succulenta");
        BotanicalCard cardCalathea = findCard("Calathea");
        BotanicalCard cardAloe = findCard("Aloe Vera");
        BotanicalCard cardCactus = findCard("Cactus");
        BotanicalCard cardSansevieria = findCard("Sansevieria");
        BotanicalCard cardFelce = findCard("Felce di Boston");

        // ═══ GIARDINO LORENZO (ADMIN) ═══
        Garden gardenAdmin = getOrCreateGarden(admin, "Oasi Botanica di Lorenzo");
        createPlant(gardenAdmin, cardCalathea, "Capricciosa", LocalDate.now().minusDays(120));
        createPlant(gardenAdmin, cardFelce, "Fronda Verde", LocalDate.now().minusDays(60));
        createPlant(gardenAdmin, cardSansevieria, "Spada", LocalDate.now().minusDays(200));

        // ═══ GIARDINO MIRIAM ═══
        Garden gardenMiriam = getOrCreateGarden(miriam, "Balcone Colorato");
        createPlant(gardenMiriam, cardMonstera, "Pina", LocalDate.now().minusDays(45));
        createPlant(gardenMiriam, cardPothos, "Liana", LocalDate.now().minusDays(90));
        createPlant(gardenMiriam, cardAloe, "Cura Tutto", LocalDate.now().minusDays(30));

        // ═══ GIARDINO MARCO ═══
        Garden gardenMarco = getOrCreateGarden(marco, "Deserto in Casa");
        createPlant(gardenMarco, cardCactus, "Spillone", LocalDate.now().minusDays(15));
        createPlant(gardenMarco, cardSucculenta, "Ciccia", LocalDate.now().minusDays(75));
        createPlant(gardenMarco, cardSansevieria, "Indistruttibile", LocalDate.now().minusDays(180));

        // ═══ GIARDINO SOFIA ═══
        Garden gardenSofia = getOrCreateGarden(sofia, "Giungla Urbana di Sofia");
        createPlant(gardenSofia, cardMonstera, "La Regina", LocalDate.now().minusDays(200));
        createPlant(gardenSofia, cardFicus, "Gommoso", LocalDate.now().minusDays(150));
        createPlant(gardenSofia, cardPothos, "Cascata", LocalDate.now().minusDays(80));

        // ═══ GIARDINO ALESSANDRO ═══
        Garden gardenAlessandro = getOrCreateGarden(alessandro, "Terrazzo sul Mare");
        createPlant(gardenAlessandro, cardAloe, "Doc", LocalDate.now().minusDays(50));
        createPlant(gardenAlessandro, cardFelce, "Ricciolo", LocalDate.now().minusDays(110));
        createPlant(gardenAlessandro, cardCalathea, "Ombra", LocalDate.now().minusDays(25));

        // ═══ GIARDINO ELENA ═══
        Garden gardenElena = getOrCreateGarden(elena, "Paradiso dei Fiori");
        createPlant(gardenElena, cardOrchidea, "Elegance", LocalDate.now().minusDays(40));
        createPlant(gardenElena, cardFicus, "Golia", LocalDate.now().minusDays(95));
        createPlant(gardenElena, cardSucculenta, "Stellina", LocalDate.now().minusDays(10));

        log.info("✔️ Giardini popolati! Piante inserite per tutti gli utenti.");
    }

    private BotanicalCard findCard(String commonName) {
        List<BotanicalCard> cards = botanicalCardRepository
                .findByCommonNameContainingIgnoreCaseOrderByCommonNameAsc(commonName);
        for (BotanicalCard card : cards) {
            if (card.getCommonName().equalsIgnoreCase(commonName)) {
                return card;
            }
        }
        if (!cards.isEmpty()) {
            return cards.get(0);
        }
        return null;
    }

    private Garden getOrCreateGarden(User user, String name) {
        List<Garden> gardens = gardenRepository.findByOwnerId(user.getId());
        if (!gardens.isEmpty()) {
            return gardens.get(0);
        }
        Garden garden = new Garden();
        garden.setOwner(user);
        garden.setName(name);
        return gardenRepository.save(garden);
    }

    private void createPlant(Garden garden, BotanicalCard card, String nickname, LocalDate purchaseDate) {
        if (card == null) return;
        Plant plant = new Plant();
        plant.setGarden(garden);
        plant.setCard(card);
        plant.setName(nickname);
        plant.setPurchaseDate(purchaseDate);
        plantRepository.save(plant);
    }
}
