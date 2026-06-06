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

		response.setNumeroSerie(entity.getNumeroSerie());
		response.setLocalisation(entity.getLocalisation());
		response.setStatut(entity.getStatut());
		response.setCriticite(entity.getCriticite());
		response.setActif(entity.getActif());
		response.setDateInstallation(entity.getDateInstallation());
		response.setDateMiseEnService(entity.getDateMiseEnService());
		response.setCommentaire(entity.getCommentaire());
		response.setParentId(entity.getParent() != null ? entity.getParent().getId() : null);

		List<EquipementResponse> children = entity.getChildren() == null ? Collections.emptyList()
				: entity.getChildren().stream().map(this::mapToResponse).collect(Collectors.toList());

		response.setChildren(children);
		return response;
	}

	public EquipementTreeResponse mapToTreeResponse(Equipement equipement) {
		if (equipement == null) {
			return null;
		}

		EquipementTreeResponse response = new EquipementTreeResponse();
		response.setId(equipement.getId());
		response.setCode(equipement.getCode());
		response.setDescription(equipement.getDescription());
		response.setType(equipement.getType());
		response.setStatut(equipement.getStatut());
		response.setLocalisation(equipement.getLocalisation());
		response.setParentId(equipement.getParent() != null ? equipement.getParent().getId() : null);

		if (equipement.getChildren() != null) {
			response.setChildren(equipement.getChildren().stream().map(this::mapToTreeResponse).toList());
		}

		return response;
	}
}