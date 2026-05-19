package com.phytosend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

/**
 * Classe che rappresenta un Evento di Cura per una pianta
 */
@Data
@Entity
@Table(name = "care_events")
public class CareEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // ID evento di cura

    private LocalDate programmedDate; // Data programmata per l'evento
    private String type; // Tipo evento: "ACQUA", "CONCIME", "TRAVASO"

    private boolean completed; // Indica se l'evento è stato completato

    private LocalDate completedDate; // Data di completamento effettivo

    private String notes; // Note aggiuntive

    // RELAZIONE: Ogni evento di cura è associato a una pianta
    @ManyToOne
    @JoinColumn(name = "plant_id")
    private Plant plant;
}