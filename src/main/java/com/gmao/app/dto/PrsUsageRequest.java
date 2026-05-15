package com.gmao.app.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

public class PrsUsageRequest {

    @NotNull(message = "L'id PR est obligatoire.")
    private Long prsId;

    @NotNull(message = "La quantité est obligatoire.")
    @DecimalMin(value = "0.001", inclusive = true, message = "La quantité doit être supérieure à 0.")
    private BigDecimal quantite;

    public Long getPrsId() {
        return prsId;
    }

    public void setPrsId(Long prsId) {
        this.prsId = prsId;
    }

    public BigDecimal getQuantite() {
        return quantite;
    }

    public void setQuantite(BigDecimal quantite) {
        this.quantite = quantite;
    }
}