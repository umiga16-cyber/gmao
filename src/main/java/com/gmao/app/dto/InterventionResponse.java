package com.gmao.app.dto;

import java.time.LocalDateTime;

public class InterventionResponse {

    private Long id;
    private String libele;
    private String type;
    private Long equipementId;
    private String equipementDescription;
    private String statut;
    private LocalDateTime dateDebut;
    private LocalDateTime dateFin;
    private Long preventifId;
    private Long createdById;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

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

    public String getEquipementDescription() {
        return equipementDescription;
    }

    public void setEquipementDescription(String equipementDescription) {
        this.equipementDescription = equipementDescription;
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