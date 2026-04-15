package com.gmao.app.mapper;

import org.springframework.stereotype.Component;

import com.gmao.app.Model.Disponibilite;
import com.gmao.app.dto.DisponibiliteResponse;

@Component
public class DisponibiliteMapper {

    public DisponibiliteResponse mapToResponse(Disponibilite disponibilite) {
        DisponibiliteResponse response = new DisponibiliteResponse();
        response.setId(disponibilite.getId());
        response.setUserId(disponibilite.getUser() != null ? disponibilite.getUser().getId() : null);
        response.setUserNom(disponibilite.getUser() != null ? disponibilite.getUser().getNom() : null);
        response.setDate(disponibilite.getDate());
        response.setDisponible(disponibilite.getDisponible());
        return response;
    }
}