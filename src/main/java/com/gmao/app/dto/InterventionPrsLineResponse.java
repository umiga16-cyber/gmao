package com.gmao.app.dto;

import java.math.BigDecimal;

public class InterventionPrsLineResponse {

    private Long prsId;
    private String prsLibelle;
    private BigDecimal quantite;

    public Long getPrsId() {
        return prsId;
    }

    public void setPrsId(Long prsId) {
        this.prsId = prsId;
    }

    public String getPrsLibelle() {
        return prsLibelle;
    }

    public void setPrsLibelle(String prsLibelle) {
        this.prsLibelle = prsLibelle;
    }

    public BigDecimal getQuantite() {
        return quantite;
    }

    public void setQuantite(BigDecimal quantite) {
        this.quantite = quantite;
    }
}