package com.gmao.app.dto;

import java.math.BigDecimal;

public class PrsImportDTO {
    private String code;
    private String libelle;
    private String reference;
    private BigDecimal pmp;
    private BigDecimal quantiteStock;
    private BigDecimal seuilMini;

    // Getters y setters
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getLibelle() { return libelle; }
    public void setLibelle(String libelle) { this.libelle = libelle; }
    public String getReference() { return reference; }
    public void setReference(String reference) { this.reference = reference; }
    public BigDecimal getPmp() { return pmp; }
    public void setPmp(BigDecimal pmp) { this.pmp = pmp; }
    public BigDecimal getQuantiteStock() { return quantiteStock; }
    public void setQuantiteStock(BigDecimal quantiteStock) { this.quantiteStock = quantiteStock; }
    public BigDecimal getSeuilMini() { return seuilMini; }
    public void setSeuilMini(BigDecimal seuilMini) { this.seuilMini = seuilMini; }
}