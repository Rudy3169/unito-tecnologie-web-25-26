package com.phytosend.service;

import com.phytosend.entity.EventoCura;
import com.phytosend.entity.Pianta;
import com.phytosend.entity.SchedaBotanica;
import com.phytosend.entity.Utente;
import com.phytosend.repository.EventoCuraRepository;
import com.phytosend.repository.PiantaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDate;

@Service
public class PiantaService {

    @Autowired
    private PiantaRepository piantaRepository;

    @Autowired
    private EventoCuraRepository eventoCuraRepository; // Per creare le notifiche

    // Metodo per creare una nuova pianta
    public Pianta aggiungiPiantaAlGiardino(Utente utente, SchedaBotanica scheda) {
        Pianta nuovaPianta = new Pianta();
        nuovaPianta.setProprietario(utente);
        nuovaPianta.setScheda(scheda);
        nuovaPianta.setDataAcquisto(LocalDate.now());

        // Salviamo la pianta
        nuovaPianta = piantaRepository.save(nuovaPianta);

        // Crea il primo evento di cura
        EventoCura primoEvento = new EventoCura();
        primoEvento.setPianta(nuovaPianta);
        primoEvento.setTipo("ACQUA");
        // Usiamo la frequenza scritta nella scheda botanica per calcolare la data
        primoEvento.setDataPrevista(LocalDate.now().plusDays(scheda.getFrequenzaAcquaGiorni()));
        primoEvento.setCompletato(false);

        eventoCuraRepository.save(primoEvento);

        return nuovaPianta;
    }

    // Metodo per rimuovere una pianta
    public void rimuoviPianta(Long piantaId) {
        piantaRepository.deleteById(piantaId);
    }
}