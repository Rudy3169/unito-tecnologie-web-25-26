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

/**
 * Classe responsabile del popolamento iniziale del database con i dati relativi
 * ai giardini e alle piante.
 * Esegue il seeding dei dati all'avvio dell'applicazione, garantendo che il
 * database sia popolato
 * con giardini, piante e relative associazioni ai proprietari e alle schede
 * botaniche.
 */
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
        User federica = userRepository.findByEmail("federica@phytosend.com").orElse(null);
        User alessandro = userRepository.findByEmail("alessandro@phytosend.com").orElse(null);
        User elena = userRepository.findByEmail("elena@phytosend.com").orElse(null);
        User matteo = userRepository.findByEmail("matteo@phytosend.com").orElse(null);

        if (admin == null || miriam == null || marco == null || federica == null || alessandro == null
                || elena == null || matteo == null) {
            log.warn("Utenti mancanti. Impossibile popolare i giardini.");
            return;
        }

        log.info("Popolamento giardini con piante collegate al catalogo per i 6 utenti...");

        BotanicalCard cardMonstera = findCard("Monstera");
        BotanicalCard cardFalangio = findCard("Falangio");
        BotanicalCard cardOrchidea = findCard("Orchidea");
        BotanicalCard cardPothos = findCard("Pothos");
        BotanicalCard cardFicus = findCard("Ficus elastica");
        BotanicalCard cardCalathea = findCard("Calathea");
        BotanicalCard cardAloe = findCard("Aloe Vera");
        BotanicalCard cardCactus = findCard("Cactus");
        BotanicalCard cardSansevieria = findCard("Sansevieria");
        BotanicalCard cardGiglio = findCard("Giglio");
        BotanicalCard cardRosa = findCard("Rosa");
        BotanicalCard cardGelsomino = findCard("Gelsomino");
        BotanicalCard cardLavanda = findCard("Lavanda");
        BotanicalCard cardMughetto = findCard("Mughetto");
        BotanicalCard cardGeranio = findCard("Geranio");
        BotanicalCard cardOrtensia = findCard("Ortensia");
        BotanicalCard cardRanuncolo = findCard("Ranuncolo");
        BotanicalCard cardBasilico = findCard("Basilico");
        BotanicalCard cardTimo = findCard("Timo");
        BotanicalCard cardRosmarino = findCard("Rosmarino");
        BotanicalCard cardSalvia = findCard("Salvia");
        BotanicalCard cardPrezzemolo = findCard("Prezzemolo");
        BotanicalCard cardMargarita = findCard("Margherita");
        BotanicalCard cardBambu = findCard("Bambù");
        BotanicalCard cardAcero = findCard("Acero giapponese");
        BotanicalCard cardLimone = findCard("Limone");

        // ═══ GIARDINO SALVATORE (ADMIN) ═══
        Garden gardenAdmin = getOrCreateGarden(admin, "Oasi Botanica di Salvatore");
        createPlant(gardenAdmin, cardFalangio, null, LocalDate.now().minusDays(120));
        createPlant(gardenAdmin, cardBasilico, null, LocalDate.now().minusDays(60));
        createPlant(gardenAdmin, cardRosmarino, null, LocalDate.now().minusDays(200));
        createPlant(gardenAdmin, cardAloe, null, LocalDate.now().minusDays(10));

        // ═══ GIARDINO MIRIAM ═══
        Garden gardenMiriam = getOrCreateGarden(miriam, "Balcone Colorato");
        createPlant(gardenMiriam, cardMonstera, null, LocalDate.now().minusDays(45));
        createPlant(gardenMiriam, cardOrchidea, null, LocalDate.now().minusDays(30));
        createPlant(gardenMiriam, cardPothos, null, LocalDate.now().minusDays(30));
        createPlant(gardenMiriam, cardMargarita, null, LocalDate.now().minusDays(30));
        createPlant(gardenMiriam, cardLavanda, null, LocalDate.now().minusDays(30));

        // ═══ GIARDINO MARCO ═══
        Garden gardenMarco = getOrCreateGarden(marco, "Deserto in Casa");
        createPlant(gardenMarco, cardCactus, null, LocalDate.now().minusDays(15));
        createPlant(gardenMarco, cardSalvia, null, LocalDate.now().minusDays(75));
        createPlant(gardenMarco, cardSansevieria, null, LocalDate.now().minusDays(180));

        // ═══ GIARDINO FEDERICA ═══
        Garden gardenFederica = getOrCreateGarden(federica, "Giungla Urbana di Federica");
        createPlant(gardenFederica, cardFicus, null, LocalDate.now().minusDays(200));
        createPlant(gardenFederica, cardRanuncolo, null, LocalDate.now().minusDays(30));
        createPlant(gardenFederica, cardMughetto, null, LocalDate.now().minusDays(10));
        createPlant(gardenFederica, cardGelsomino, null, LocalDate.now().minusDays(20));
        createPlant(gardenFederica, cardGeranio, null, LocalDate.now().minusDays(40));

        // ═══ GIARDINO ALESSANDRO ═══
        Garden gardenAlessandro = getOrCreateGarden(alessandro, "Terrazzo sul Mare");
        createPlant(gardenAlessandro, cardGiglio, null, LocalDate.now().minusDays(50));
        createPlant(gardenAlessandro, cardRosa, null, LocalDate.now().minusDays(110));
        createPlant(gardenAlessandro, cardOrtensia, null, LocalDate.now().minusDays(25));

        // ═══ GIARDINO ELENA ═══
        Garden gardenElena = getOrCreateGarden(elena, "Paradiso dei Fiori");
        createPlant(gardenElena, cardCalathea, null, LocalDate.now().minusDays(40));
        createPlant(gardenElena, cardPrezzemolo, null, LocalDate.now().minusDays(95));
        createPlant(gardenElena, cardRosa, null, LocalDate.now().minusDays(10));
        createPlant(gardenElena, cardTimo, null, LocalDate.now().minusDays(10));

        // ═══ GIARDINO MATTEO ═══
        Garden gardenMatteo = getOrCreateGarden(matteo, "La Foresta di Matteo");
        createPlant(gardenMatteo, cardBambu, null, LocalDate.now().minusDays(300));
        createPlant(gardenMatteo, cardAcero, null, LocalDate.now().minusDays(150));
        createPlant(gardenMatteo, cardLimone, null, LocalDate.now().minusDays(60));

        log.info("Autoseed giardini completato!");
    }

    // ════════════════════════════════════════════════════════════════════════
    // METODI DI SUPPORTO
    // ════════════════════════════════════════════════════════════════════════

    /**
     * Cerca una scheda botanica per nome comune.
     * 
     * @param commonName il nome comune da cercare
     * @return la scheda botanica trovata o null se non esiste
     */
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

    /**
     * Recupera un giardino esistente o ne crea uno nuovo per l'utente fornito.
     * 
     * @param user l'utente proprietario del giardino
     * @param name il nome da assegnare al giardino se ne viene creato uno nuovo
     * @return il giardino esistente o il nuovo giardino appena creato
     */
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

    /**
     * Crea una nuova pianta e la aggiunge al giardino fornito.
     * 
     * @param garden       il giardino a cui aggiungere la pianta
     * @param card         la scheda botanica della pianta
     * @param nickname     il soprannome della pianta
     * @param purchaseDate la data di acquisto della pianta
     */
    private void createPlant(Garden garden, BotanicalCard card, String nickname, LocalDate purchaseDate) {
        if (card == null)
            return;
        Plant plant = new Plant();
        plant.setGarden(garden);
        plant.setCard(card);
        plant.setName(nickname);
        plant.setPurchaseDate(purchaseDate);
        plantRepository.save(plant);
    }
}
