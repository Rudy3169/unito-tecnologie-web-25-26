package com.phytosend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.util.List;

/**
 * Classe che rappresenta un gruppo
 */
@Data
@Entity
@Table(name = "groups")
public class Group {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // ID gruppo

    private String name; // Nome gruppo
    private String description; // Descrizione gruppo
    private String country; // Paese
    private String city; // Città

    // RELAZIONI
    // Ogni gruppo ha un solo admin
    @ManyToOne
    @JoinColumn(name = "admin_id")
    private User admin;

    // Ogni gruppo ha più membri (utenti)
    @ManyToMany
    @JoinTable(name = "group_members", joinColumns = @JoinColumn(name = "group_id"), inverseJoinColumns = @JoinColumn(name = "user_id"))
    private List<User> members;
}