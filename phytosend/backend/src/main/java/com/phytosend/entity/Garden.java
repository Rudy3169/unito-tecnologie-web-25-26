package com.phytosend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.util.List;

/**
 * Classe che rappresenta il Giardino di un utente
 */
@Data
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Entity
@Table(name = "giardini")
public class Garden {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id; // ID giardino

    private String name; // Nome del giardino (opzionale)

    // RELAZIONI
    // Ogni giardino ha un solo proprietario (utente)
    @OneToOne
    @JoinColumn(name = "user_id")
    @JsonIgnore
    private User owner;

    // Ogni giardino può contenere più piante
    @OneToMany(mappedBy = "garden", cascade = CascadeType.ALL)
    private List<Plant> plants; // Lista di piante associate al giardino
}