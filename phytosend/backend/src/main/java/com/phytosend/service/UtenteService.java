package com.phytosend.service;

import com.phytosend.entity.Utente;
import com.phytosend.entity.RuoloUtente;
import com.phytosend.entity.Giardino;
import com.phytosend.repository.UtenteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UtenteService {

    @Autowired
    private UtenteRepository utenteRepository;

    // --- REGISTRAZIONE ---
    public Utente registraUtente(Utente nuovoUtente) {
        // Verifica se l'email esiste già
        if (utenteRepository.existsByEmail(nuovoUtente.getEmail())) {
            throw new RuntimeException("Un altro utente con questa email è già registrato!");
        }

        nuovoUtente.setCitta(nuovoUtente.getCitta());
        nuovoUtente.setCellulare(nuovoUtente.getCellulare());

        // Assegna ruolo di default se non presente
        if (nuovoUtente.getRuolo() == null) {
            nuovoUtente.setRuolo(RuoloUtente.BASE);
        }

        // Salva la password in chiaro
        nuovoUtente.setPassword(nuovoUtente.getPassword());

        // Inizializza il giardino associato all'utente
         Giardino giardino = new Giardino();
         giardino.setProprietario(nuovoUtente);
         nuovoUtente.setGiardino(giardino);

        return utenteRepository.save(nuovoUtente);
    }

    // --- LOGIN (Autenticazione Semplificata) ---
    public Utente login(String email, String password) {
        Optional<Utente> utenteOpt = utenteRepository.findByEmail(email);

        if (utenteOpt.isPresent()) {
            Utente utente = utenteOpt.get();
            // Verifica password
            if (utente.getPassword().equals(password)) {
                return utente;
            }
        }
        throw new RuntimeException("Email o Password non valide!");
    }

    // --- LETTURA ---
    public Utente trovaPerId(Long id) {
        return utenteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utente (" + id + ") non trovato!"));
    }

    public List<Utente> trovaTutti() {
        return utenteRepository.findAll();
    }

    // --- AGGIORNAMENTO PROFILO ---
    public Utente aggiornaProfilo(Long id, Utente datiAggiornati) {
        Utente esistente = trovaPerId(id);

        // Aggiorna solo i campi modificabili dall'utente
        esistente.setCitta(datiAggiornati.getCitta());
        esistente.setCellulare(datiAggiornati.getCellulare());

        return utenteRepository.save(esistente);
    }

    // --- GESTIONE RUOLI (Upgrade/Downgrade) ---
    public Utente cambiaRuolo(Long id, RuoloUtente nuovoRuolo) {
        Utente utente = trovaPerId(id);
        utente.setRuolo(nuovoRuolo);
        return utenteRepository.save(utente);
    }

    // Metodo specifico per l'upgrade a PRO
    public Utente diventaPro(Long id) {
        return cambiaRuolo(id, RuoloUtente.PRO);
    }
}