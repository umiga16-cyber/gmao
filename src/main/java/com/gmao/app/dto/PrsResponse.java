package com.gmao.app.dto;

import java.math.BigDecimal;

public class PrsResponse {

    private Long id;
    private String libelle;
    private BigDecimal quantiteStock;
    private BigDecimal seuilMini;
    private Long mouvementsCount;
    private Long interventionsCount;
    private boolean canDelete;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getLibelle() {
        return libelle;
    }

    public void setLibelle(String libelle) {
        this.libelle = libelle;
    }

    public BigDecimal getQuantiteStock() {
        return quantiteStock;
    }

    public void setQuantiteStock(BigDecimal quantiteStock) {
        this.quantiteStock = quantiteStock;
    }

    public BigDecimal getSeuilMini() {
        return seuilMini;
    }

    public void setSeuilMini(BigDecimal seuilMini) {
        this.seuilMini = seuilMini;
    }

    public Long getMouvementsCount() {
        return mouvementsCount;
    }

    public void setMouvementsCount(Long mouvementsCount) {
        this.mouvementsCount = mouvementsCount;
    }

    public Long getInterventionsCount() {
        return interventionsCount;
    }

    public void setInterventionsCount(Long interventionsCount) {
        this.interventionsCount = interventionsCount;
    }

    public boolean isCanDelete() {
        return canDelete;
    }

    public void setCanDelete(boolean canDelete) {
        this.canDelete = canDelete;
    }
}