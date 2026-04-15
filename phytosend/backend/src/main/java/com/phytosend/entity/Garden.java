package com.phytosend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.util.List;

@Data
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Entity
@Table(name = "giardini")
public class Garden {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    private String name; // opzionale

    // RELAZIONI

    // Ogni giardino ha un solo proprietario (utente)
    @OneToOne
    @JoinColumn(name = "user_id")
    @JsonIgnore
    private User owner;

    // Ogni giardino può contenere più piante
    @OneToMany(mappedBy = "garden", cascade = CascadeType.ALL) // Nota: mappedBy="giardino"
    private List<Plant> plants;
}