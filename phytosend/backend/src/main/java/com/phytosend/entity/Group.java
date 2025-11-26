package com.phytosend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.util.List;

@Data
@Entity
@Table(name = "groups")
public class Group {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;       // Es. "Scambio Talee"
    private String description;
    private String country;
    private String city;

    // RELAZIONI
    // Ogni gruppo ha un solo admin
    @ManyToOne
    @JoinColumn(name = "admin_id")
    private User admin;

    // Ogni gruppo ha più membri (utenti)
    @ManyToMany
    @JoinTable(
            name = "group_members",
            joinColumns = @JoinColumn(name = "group_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private List<User> members;
}