package com.gmao.app.mapper;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.gmao.app.Model.Equipement;
import com.gmao.app.dto.EquipementCreateRequest;
import com.gmao.app.dto.EquipementDetailResponse;
import com.gmao.app.dto.EquipementResponse;
import com.gmao.app.dto.EquipementTreeResponse;
import com.gmao.app.dto.EquipementUpdateRequest;

@Component
public class EquipementMapper {

    public Equipement mapToEntity(EquipementCreateRequest request) {
        Equipement entity = new Equipement();
        entity.setCode(request.getCode() != null ? request.getCode().trim() : null);
        entity.setDescription(request.getDescription() != null ? request.getDescription().trim() : null);
        entity.setType(request.getType());
        entity.setMarque(request.getMarque());
        entity.setModele(request.getModele());
        entity.setNumeroSerie(request.getNumeroSerie());
        entity.setLocalisation(request.getLocalisation());
        entity.setStatut(request.getStatut());
        entity.setDateInstallation(request.getDateInstallation());
        entity.setDateMiseEnService(request.getDateMiseEnService());
        entity.setCriticite(request.getCriticite());
        entity.setCommentaire(request.getCommentaire());
        entity.setActif(Boolean.TRUE);
        return entity;
    }

    public void mapToEntity(EquipementUpdateRequest request, Equipement entity) {
        entity.setDescription(request.getDescription());
        entity.setType(request.getType());
        entity.setMarque(request.getMarque());
        entity.setModele(request.getModele());
        entity.setNumeroSerie(request.getNumeroSerie());
        entity.setLocalisation(request.getLocalisation());
        entity.setStatut(request.getStatut());
        entity.setDateInstallation(request.getDateInstallation());
        entity.setDateMiseEnService(request.getDateMiseEnService());
        entity.setCriticite(request.getCriticite());
        entity.setCommentaire(request.getCommentaire());

        if (request.getActif() != null) {
            entity.setActif(request.getActif());
        }
    }

    public EquipementResponse mapToResponse(Equipement entity) {
        EquipementResponse response = new EquipementResponse();
        response.setId(entity.getId());
        response.setCode(entity.getCode());
        response.setDescription(entity.getDescription());
        response.setType(entity.getType());
        response.setCompanyId(entity.getCompany() != null ? entity.getCompany().getId() : null);
        response.setCompanyName(entity.getCompany() != null ? entity.getCompany().getName() : null);
        response.setStatut(entity.getStatut());
        response.setLocalisation(entity.getLocalisation());
        response.setActif(entity.getActif());
        response.setParentId(entity.getParent() != null ? entity.getParent().getId() : null);
        return response;
    }

    public EquipementDetailResponse mapToDetailResponse(Equipement entity) {
        EquipementDetailResponse response = new EquipementDetailResponse();
        response.setId(entity.getId());
        response.setCode(entity.getCode());
        response.setDescription(entity.getDescription());
        response.setType(entity.getType());
        response.setMarque(entity.getMarque());
        response.setModele(entity.getModele());
        response.setCompanyId(entity.getCompany() != null ? entity.getCompany().getId() : null);
        response.setCompanyName(entity.getCompany() != null ? entity.getCompany().getName() : null);
        response.setNumeroSerie(entity.getNumeroSerie());
        response.setLocalisation(entity.getLocalisation());
        response.setStatut(entity.getStatut());
        response.setCriticite(entity.getCriticite());
        response.setActif(entity.getActif());
        response.setDateInstallation(entity.getDateInstallation());
        response.setDateMiseEnService(entity.getDateMiseEnService());
        response.setCommentaire(entity.getCommentaire());
        response.setParentId(entity.getParent() != null ? entity.getParent().getId() : null);

        List<EquipementResponse> children = entity.getChildren() == null
                ? Collections.emptyList()
                : entity.getChildren().stream()
                        .map(this::mapToResponse)
                        .collect(Collectors.toList());

        response.setChildren(children);
        return response;
    }

    public EquipementTreeResponse mapToTreeResponse(Equipement entity) {
        EquipementTreeResponse response = new EquipementTreeResponse();
        response.setId(entity.getId());
        response.setCode(entity.getCode());
        response.setDescription(entity.getDescription());
        response.setType(entity.getType());
        response.setStatut(entity.getStatut());

        List<EquipementTreeResponse> children = entity.getChildren() == null
                ? Collections.emptyList()
                : entity.getChildren().stream()
                        .map(this::mapToTreeResponse)
                        .collect(Collectors.toList());

        response.setChildren(children);
        return response;
    }
}