package com.gmao.app.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.NotNull;

public class DisponibiliteCreateRequest {

    @NotNull(message = "L'id utilisateur est obligatoire.")
    private Long userId;

    @NotNull(message = "La date est obligatoire.")
    private LocalDate date;

    @NotNull(message = "Le flag disponible est obligatoire.")
    private Boolean disponible;

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public Boolean getDisponible() {
        return disponible;
    }

    public void setDisponible(Boolean disponible) {
        this.disponible = disponible;
    }
}