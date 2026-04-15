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
		Intervention entity = new Intervention();
		entity.setLibele(request.getLibele() != null ? request.getLibele().trim() : null);
		entity.setType(request.getType());
		entity.setStatut(request.getStatut());
		entity.setDateDebut(request.getDateDebut());
		entity.setDateFin(request.getDateFin());
		entity.setCommentaire(request.getCommentaire());
		return entity;
	}

	public void mapToEntity(InterventionUpdateRequest request, Intervention entity) {
		if (request.getLibele() != null) {
			entity.setLibele(request.getLibele().trim());
		}
		if (request.getType() != null) {
			entity.setType(request.getType());
		}
		if (request.getStatut() != null) {
			entity.setStatut(request.getStatut());
		}
		entity.setDateDebut(request.getDateDebut());
		entity.setDateFin(request.getDateFin());
		entity.setCommentaire(request.getCommentaire());
	}

	public InterventionResponse mapToResponse(Intervention entity) {
		InterventionResponse response = new InterventionResponse();
		response.setId(entity.getId());
		response.setLibele(entity.getLibele());
		response.setType(entity.getType());
		response.setEquipementId(entity.getEquipement() != null ? entity.getEquipement().getId() : null);
		response.setEquipementDescription(
				entity.getEquipement() != null ? entity.getEquipement().getDescription() : null);
		response.setStatut(entity.getStatut());
		response.setDateDebut(entity.getDateDebut());
		response.setDateFin(entity.getDateFin());
		response.setPreventifId(entity.getPreventif() != null ? entity.getPreventif().getId() : null);
		response.setCreatedById(entity.getCreatedBy() != null ? entity.getCreatedBy().getId() : null);
		return response;
	}

	public InterventionDetailResponse mapToDetailResponse(Intervention entity) {
		InterventionDetailResponse response = new InterventionDetailResponse();
		response.setId(entity.getId());
		response.setLibele(entity.getLibele());
		response.setType(entity.getType());
		response.setEquipementId(entity.getEquipement() != null ? entity.getEquipement().getId() : null);
		response.setEquipementDescription(
				entity.getEquipement() != null ? entity.getEquipement().getDescription() : null);
		response.setStatut(entity.getStatut());
		response.setDateDebut(entity.getDateDebut());
		response.setDateFin(entity.getDateFin());
		response.setCommentaire(entity.getCommentaire());
		response.setPreventifId(entity.getPreventif() != null ? entity.getPreventif().getId() : null);
		response.setCreatedById(entity.getCreatedBy() != null ? entity.getCreatedBy().getId() : null);
		return response;
	}
}