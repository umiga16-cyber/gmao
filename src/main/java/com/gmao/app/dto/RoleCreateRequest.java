package com.gmao.app.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class RoleCreateRequest {

    @NotBlank(message = "Le nom du rôle est obligatoire.")
    @Size(max = 100, message = "Le nom du rôle ne doit pas dépasser 100 caractères.")
    private String nom;

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }
}