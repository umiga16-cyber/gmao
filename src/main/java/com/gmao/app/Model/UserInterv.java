package com.gmao.app.Model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import lombok.Data;


import java.time.LocalDateTime;

//@Entity
//@Table(name = "users")
@Data
public class UserInterv {
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    @Column(name = "user_id")
//    private Long userId;
//
//    @NotBlank
//    @Column(name = "nom", nullable = false)
//    private String nom;
//
//    @NotBlank
//    @Column(name = "prenom", nullable = false)
//    private String prenom;
//
//    @Email
//    @Column(name = "email", nullable = false, unique = true)
//    private String email;
//
//    @Column(name = "matricule")
//    private String matricule;
//
//    @NotNull
//    @Enumerated(EnumType.STRING)
//    @Column(name = "role", nullable = false)
//    private Role role;
//
//    @NotNull
//    @Enumerated(EnumType.STRING)
//    @Column(name = "statut", nullable = false)
//    private Statut statut;
//
//    @Column(name = "password")
//    private String password;
//
//    @CreationTimestamp
//    @Column(name = "date_creation")
//    private LocalDateTime dateCreation;
//
//    @UpdateTimestamp
//    @Column(name = "date_modification")
//    private LocalDateTime dateModification;
//
//    @Column(name = "derniere_connexion")
//    private LocalDateTime derniereConnexion;
//
//    public enum Role {
//        ADMIN, TECHNICIEN, SUPERVISEUR, OPERATEUR
//    }
//
//    public enum Statut {
//        ACTIF, SUSPENDU, ANNULE
//    }
}    
