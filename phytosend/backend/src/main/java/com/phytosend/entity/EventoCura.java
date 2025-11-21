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
    private String tipo; // Es. "ACQUA", "CONCIME", "TRAVASO"

    private boolean completato; // true se l'utente ha spuntato la casella

    private String note;

    // RELAZIONE: Un evento appartiene a una specifica pianta
    @ManyToOne
    @JoinColumn(name = "pianta_id")
    private Pianta pianta;
}