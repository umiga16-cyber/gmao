package com.gmao.app.mapper;

import org.springframework.stereotype.Component;

import com.gmao.app.Model.Preventif;
import com.gmao.app.dto.PreventifCreateRequest;
import com.gmao.app.dto.PreventifDetailResponse;
import com.gmao.app.dto.PreventifResponse;
import com.gmao.app.dto.PreventifUpdateRequest;

@Component
public class PreventifMapper {

    public Preventif mapToEntity(PreventifCreateRequest request) {
        Preventif entity = new Preventif();
        entity.setFrequence(request.getFrequence());
        entity.setTypeFrequence(request.getTypeFrequence());
        entity.setProchaineDate(request.getProchaineDate());
        entity.setOperations(request.getOperations());
        entity.setHorizon(request.getHorizon());
        entity.setStatut(request.getStatut());
        entity.setActif(request.getActif() != null ? request.getActif() : Boolean.TRUE);
        return entity;
    }

    public void mapToEntity(PreventifUpdateRequest request, Preventif entity) {
        if (request.getFrequence() != null) {
            entity.setFrequence(request.getFrequence());
        }
        if (request.getTypeFrequence() != null) {
            entity.setTypeFrequence(request.getTypeFrequence());
        }
        if (request.getProchaineDate() != null) {
            entity.setProchaineDate(request.getProchaineDate());
        }
        if (request.getOperations() != null) {
            entity.setOperations(request.getOperations());
        }
        if (request.getHorizon() != null) {
            entity.setHorizon(request.getHorizon());
        }
        if (request.getStatut() != null) {
            entity.setStatut(request.getStatut());
        }
        if (request.getActif() != null) {
            entity.setActif(request.getActif());
        }
    }

    public PreventifResponse mapToResponse(Preventif entity) {
        PreventifResponse response = new PreventifResponse();
        response.setId(entity.getId());
        response.setEquipementId(entity.getEquipement() != null ? entity.getEquipement().getId() : null);
        response.setEquipementDescription(entity.getEquipement() != null ? entity.getEquipement().getDescription() : null);
        response.setFrequence(entity.getFrequence());
        response.setTypeFrequence(entity.getTypeFrequence());
        response.setProchaineDate(entity.getProchaineDate());
        response.setStatut(entity.getStatut());
        response.setActif(entity.getActif());
        return response;
    }

    public PreventifDetailResponse mapToDetailResponse(Preventif entity) {
        PreventifDetailResponse response = new PreventifDetailResponse();
        response.setId(entity.getId());
        response.setEquipementId(entity.getEquipement() != null ? entity.getEquipement().getId() : null);
        response.setEquipementDescription(entity.getEquipement() != null ? entity.getEquipement().getDescription() : null);
        response.setFrequence(entity.getFrequence());
        response.setTypeFrequence(entity.getTypeFrequence());
        response.setProchaineDate(entity.getProchaineDate());
        response.setOperations(entity.getOperations());
        response.setHorizon(entity.getHorizon());
        response.setStatut(entity.getStatut());
        response.setActif(entity.getActif());
        return response;
    }
}