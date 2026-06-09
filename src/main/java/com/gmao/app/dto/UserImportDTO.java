package com.gmao.app.dto;

public class UserImportDTO {
    private String nom;
    private String email;
    private String role;
    private String statut;
    private Boolean actif;
    private String password;

    // Getters y setters (genera con tu IDE)
    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public String getStatut() { return statut; }
    public void setStatut(String statut) { this.statut = statut; }
    public Boolean getActif() { return actif; }
    public void setActif(Boolean actif) { this.actif = actif; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}