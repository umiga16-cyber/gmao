package com.gmao.app.dto;

import java.time.LocalDate;

import com.gmao.app.Model.enums.FrequencyType;

public class PreventifDetailResponse {

    private Long id;
    private Long equipementId;
    private String equipementDescription;
    private Integer frequence;
    private FrequencyType typeFrequence;
    private LocalDate prochaineDate;
    private String operations;
    private Integer horizon;
    private String statut;
    private Boolean actif;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public Integer getFrequence() {
        return frequence;
    }

    public void setFrequence(Integer frequence) {
        this.frequence = frequence;
    }

    public FrequencyType getTypeFrequence() {
        return typeFrequence;
    }

    public void setTypeFrequence(FrequencyType typeFrequence) {
        this.typeFrequence = typeFrequence;
    }

    public LocalDate getProchaineDate() {
        return prochaineDate;
    }

    public void setProchaineDate(LocalDate prochaineDate) {
        this.prochaineDate = prochaineDate;
    }

    public String getOperations() {
        return operations;
    }

    public void setOperations(String operations) {
        this.operations = operations;
    }

    public Integer getHorizon() {
        return horizon;
    }

    public void setHorizon(Integer horizon) {
        this.horizon = horizon;
    }

    public String getStatut() {
        return statut;
    }

    public void setStatut(String statut) {
        this.statut = statut;
    }

    public Boolean getActif() {
        return actif;
    }

    public void setActif(Boolean actif) {
        this.actif = actif;
    }
}