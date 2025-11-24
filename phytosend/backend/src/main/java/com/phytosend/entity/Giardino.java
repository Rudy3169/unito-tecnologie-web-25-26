package com.phytosend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import java.util.List;

@Data
@Entity
@Table(name = "giardini")
public class Giardino {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome; // opzionale

    //RELAZIONI

    // Ogni giardino ha un solo proprietario (utente)
    @OneToOne
    @JoinColumn(name = "utente_id")
    @JsonIgnore
    private Utente proprietario;

    // Ogni giardino può contenere più piante
    @OneToMany(mappedBy = "giardino", cascade = CascadeType.ALL) // Nota: mappedBy="giardino"
    private List<Pianta> piante;
}