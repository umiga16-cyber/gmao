package com.gmao.app.mapper;

import org.springframework.stereotype.Component;

import com.gmao.app.Model.Intervention;
import com.gmao.app.dto.InterventionCreateRequest;
import com.gmao.app.dto.InterventionDetailResponse;
import com.gmao.app.dto.InterventionResponse;
import com.gmao.app.dto.InterventionUpdateRequest;

@Component
public class InterventionMapper {

    public Intervention mapToEntity(InterventionCreateRequest request) {
        Intervention intervention = new Intervention();
        intervention.setLibele(request.getLibele());
        intervention.setType(request.getType());
        intervention.setStatut(request.getStatut());
        intervention.setDateDebut(request.getDateDebut());
        intervention.setDateFin(request.getDateFin());
        intervention.setCodeIntervention(request.getCodeIntervention());
        intervention.setCommentaire(request.getCommentaire());
        return intervention;
    }

    public void mapToEntity(InterventionUpdateRequest request, Intervention intervention) {
        if (request.getLibele() != null) {
            intervention.setLibele(request.getLibele());
        }
        if (request.getType() != null) {
            intervention.setType(request.getType());
        }
        if (request.getStatut() != null) {
            intervention.setStatut(request.getStatut());
        }
        if (request.getDateDebut() != null) {
            intervention.setDateDebut(request.getDateDebut());
        }
        if (request.getCodeIntervention() != null) {
        	intervention.setCodeIntervention(request.getCodeIntervention());
        }
        intervention.setDateFin(request.getDateFin());
        intervention.setCommentaire(request.getCommentaire());
    }

    public InterventionResponse mapToResponse(Intervention intervention) {
        InterventionResponse response = new InterventionResponse();
        response.setId(intervention.getId());
        response.setLibele(intervention.getLibele());
        response.setType(intervention.getType());
        response.setStatut(intervention.getStatut());
        response.setDateDebut(intervention.getDateDebut());
        response.setDateFin(intervention.getDateFin());
        response.setPreventifId(intervention.getPreventif() != null ? intervention.getPreventif().getId() : null);
        response.setCreatedById(intervention.getCreatedBy() != null ? intervention.getCreatedBy().getId() : null);
        response.setCodeIntervention(intervention.getCodeIntervention());
        if (intervention.getEquipement() != null) {
            response.setEquipementId(intervention.getEquipement().getId());
            response.setEquipementDescription(intervention.getEquipement().getDescription());
        }

        return response;
    }

    public InterventionDetailResponse mapToDetailResponse(Intervention intervention) {
        InterventionDetailResponse response = new InterventionDetailResponse();
        response.setId(intervention.getId());
        response.setLibele(intervention.getLibele());
        response.setType(intervention.getType());
        response.setStatut(intervention.getStatut());
        response.setDateDebut(intervention.getDateDebut());
        response.setDateFin(intervention.getDateFin());
        response.setCommentaire(intervention.getCommentaire());
        response.setPreventifId(intervention.getPreventif() != null ? intervention.getPreventif().getId() : null);
        response.setCreatedById(intervention.getCreatedBy() != null ? intervention.getCreatedBy().getId() : null);
        response.setCodeIntervention(intervention.getCodeIntervention());
        if (intervention.getEquipement() != null) {
            response.setEquipementId(intervention.getEquipement().getId());
            response.setEquipementDescription(intervention.getEquipement().getDescription());
        }

        return response;
    }
}