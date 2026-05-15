package com.gmao.app.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class PrsUpdateRequest {

    @NotBlank(message = "Le libellé est obligatoire.")
    @Size(max = 200, message = "Le libellé ne doit pas dépasser 200 caractères.")
    private String libelle;

    @NotNull(message = "La quantité en stock est obligatoire.")
    @DecimalMin(value = "0.0", inclusive = true, message = "La quantité doit être positive ou nulle.")
    private BigDecimal quantiteStock;

    @NotNull(message = "Le seuil minimum est obligatoire.")
    @DecimalMin(value = "0.0", inclusive = true, message = "Le seuil minimum doit être positif ou nul.")
    private BigDecimal seuilMini;

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
}