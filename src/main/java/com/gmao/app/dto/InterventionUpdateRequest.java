package com.gmao.app.dto;

import java.time.LocalDateTime;

import jakarta.validation.constraints.Size;

public class InterventionUpdateRequest {

    @Size(max = 200, message = "Le libellé ne doit pas dépasser 200 caractères.")
    private String libele;

    @Size(max = 80, message = "Le type ne doit pas dépasser 80 caractères.")
    private String type;

    private Long equipementId;

    @Size(max = 30, message = "Le statut ne doit pas dépasser 30 caractères.")
    private String statut;

    private LocalDateTime dateDebut;
    private LocalDateTime dateFin;
    private String commentaire;
    private Long preventifId;
    private Long createdById;

    public String getLibele() {
        return libele;
    }

    public void setLibele(String libele) {
        this.libele = libele;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Long getEquipementId() {
        return equipementId;
    }

    public void setEquipementId(Long equipementId) {
        this.equipementId = equipementId;
    }

    public String getStatut() {
        return statut;
    }

    public void setStatut(String statut) {
        this.statut = statut;
    }

    public LocalDateTime getDateDebut() {
        return dateDebut;
    }

    public void setDateDebut(LocalDateTime dateDebut) {
        this.dateDebut = dateDebut;
    }

    public LocalDateTime getDateFin() {
        return dateFin;
    }

    public void setDateFin(LocalDateTime dateFin) {
        this.dateFin = dateFin;
    }

    public String getCommentaire() {
        return commentaire;
    }

    public void setCommentaire(String commentaire) {
        this.commentaire = commentaire;
    }

    public Long getPreventifId() {
        return preventifId;
    }

    public void setPreventifId(Long preventifId) {
        this.preventifId = preventifId;
    }

    public Long getCreatedById() {
        return createdById;
    }

    public void setCreatedById(Long createdById) {
        this.createdById = createdById;
    }
}