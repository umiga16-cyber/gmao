package com.gmao.app.dto;

import java.time.LocalDate;

import com.gmao.app.Model.enums.FrequencyType;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class PreventifCreateRequest {

    @NotNull(message = "L'id équipement est obligatoire.")
    private Long equipementId;

    @NotNull(message = "La fréquence est obligatoire.")
    @Min(value = 1, message = "La fréquence doit être supérieure à 0.")
    private Integer frequence;

    @NotNull(message = "Le type de fréquence est obligatoire.")
    private FrequencyType typeFrequence;

    private LocalDate prochaineDate;

    private String operations;

    private Integer horizon;

    @Size(max = 30, message = "Le statut ne doit pas dépasser 30 caractères.")
    private String statut;

    private Boolean actif;

    public Long getEquipementId() {
        return equipementId;
    }

    public void setEquipementId(Long equipementId) {
        this.equipementId = equipementId;
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