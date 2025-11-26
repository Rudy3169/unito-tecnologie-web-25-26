package com.phytosend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Data
@Entity
@Table(name = "care_events")
public class CareEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate programmedDate;
    private String type; // "ACQUA", "CONCIME", "TRAVASO"

    private boolean completed;

    private String notes;

    // RELAZIONE: Ogni evento di cura è associato a una pianta
    @ManyToOne
    @JoinColumn(name = "plant_id")
    private Plant plant;
}