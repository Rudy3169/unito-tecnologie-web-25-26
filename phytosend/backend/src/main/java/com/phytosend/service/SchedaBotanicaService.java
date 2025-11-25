package com.phytosend.service;

import com.phytosend.entity.SchedaBotanica;
import com.phytosend.repository.SchedaBotanicaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SchedaBotanicaService {

    @Autowired
    private SchedaBotanicaRepository schedaRepository;

    // --- 1. RICERCA E LETTURA (Per tutti gli utenti) ---

    // Restituisce tutto il catalogo (utile per la pagina "Esplora")
    public List<SchedaBotanica> trovaTutte() {
        return schedaRepository.findAll();
    }

    // Cerca una pianta specifica (es. dettaglio cura)
    public SchedaBotanica trovaPerId(Long id) {
        return schedaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Scheda botanica non trovata con ID: " + id));
    }

    // Motore di ricerca: l'utente scrive "Monstera" e riceve i risultati
    public List<SchedaBotanica> cercaPerNome(String query) {
        return schedaRepository.findByNomeComuneContainingIgnoreCase(query);
    }

    // --- 2. GESTIONE CATALOGO (Per Admin o logica interna) ---

    public SchedaBotanica salvaScheda(SchedaBotanica scheda) {
        // Controllo duplicati base
        if (scheda.getId() == null && schedaRepository.existsByNomeScientifico(scheda.getNomeScientifico())) {
            throw new RuntimeException("Esiste già una scheda per la specie: " + scheda.getNomeScientifico());
        }
        return schedaRepository.save(scheda);
    }

    public void eliminaScheda(Long id) {
        // Nota: Prima di eliminare, bisognerebbe controllare se ci sono Piante collegate!
        // Per semplicità qui eliminiamo e basta, ma in un'app reale serve cautela.
        schedaRepository.deleteById(id);
    }

    // --- 3. METODO DI UTILITÀ (Per la demo del progetto) ---
    // Questo metodo può essere chiamato all'avvio dell'app per popolare il DB
    public void popolaCatalogoSeVuoto() {
        if (schedaRepository.count() == 0) {
            SchedaBotanica p1 = new SchedaBotanica();
            p1.setNomeComune("Monstera Deliciosa");
            p1.setNomeScientifico("Monstera deliciosa");
            p1.setEsposizione("Luce indiretta");
            p1.setIrrigazione("Quando il terriccio è asciutto");
            p1.setFrequenzaAcquaGiorni(7); // Ogni settimana
            p1.setDescrizione("La pianta del formaggio svizzero, famosa per le foglie bucate.");
            p1.setUrlFotoDefault("https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=600&q=80");

            SchedaBotanica p2 = new SchedaBotanica();
            p2.setNomeComune("Lingua di Suocera");
            p2.setNomeScientifico("Sansevieria trifasciata");
            p2.setEsposizione("Qualsiasi, anche poca luce");
            p2.setIrrigazione("Raramente, teme i ristagni");
            p2.setFrequenzaAcquaGiorni(21); // Ogni 3 settimane
            p2.setDescrizione("Indistruttibile e purifica l'aria.");
            p2.setUrlFotoDefault("https://images.unsplash.com/photo-1599598425947-d352b9785022?auto=format&fit=crop&w=600&q=80");

            schedaRepository.save(p1);
            schedaRepository.save(p2);
            System.out.println("Catalogo popolato con dati di prova!");
        }
    }
}