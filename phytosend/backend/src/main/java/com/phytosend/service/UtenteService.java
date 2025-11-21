package com.phytosend.service;

import com.phytosend.entity.Utente;
import com.phytosend.repository.UtenteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class UtenteService {

    @Autowired
    private UtenteRepository utenteRepository;

    public Utente registraUtente(Utente nuovoUtente) {
        return utenteRepository.save(nuovoUtente);
    }

    public List<Utente> trovaTutti() {
        return utenteRepository.findAll();
    }

    // Qui potrai aggiungere logica per gestire i permessi tra Giardiniere ed Esperto
}