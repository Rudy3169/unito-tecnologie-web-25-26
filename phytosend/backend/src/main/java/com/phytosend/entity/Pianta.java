package com.phytosend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Data
@Entity
@Table(name = "piante")
public class Pianta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String urlFotoPersonale;

    private LocalDate dataAcquisto;

    // RELAZIONI
    // Ogni pianta appartiene a un giardino
    @ManyToOne
    @JoinColumn(name = "giardino_id")
    @JsonIgnore
    private Giardino giardino;

    // Ogni pianta ha una scheda botanica
    @ManyToOne
    @JoinColumn(name = "scheda_botanica_id")
    private SchedaBotanica scheda;
}