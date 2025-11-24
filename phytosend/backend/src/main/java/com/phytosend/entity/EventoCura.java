package com.phytosend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Data
@Entity
@Table(name = "eventi_cura")
public class EventoCura {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate dataPrevista;
    private String tipo; // "ACQUA", "CONCIME", "TRAVASO"

    private boolean completato;

    private String note;

    // RELAZIONE: Ogni evento di cura è associato a una pianta
    @ManyToOne
    @JoinColumn(name = "pianta_id")
    private Pianta pianta;
}