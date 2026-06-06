package com.gmao.app.Service.impl;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.gmao.app.Model.Equipement;

import com.gmao.app.Repository.EquipementRepository;
import com.gmao.app.Service.EquipementService;
import com.gmao.app.dto.EquipementCreateRequest;
import com.gmao.app.dto.EquipementDetailResponse;
import com.gmao.app.dto.EquipementResponse;
import com.gmao.app.dto.EquipementTreeResponse;
import com.gmao.app.dto.EquipementUpdateRequest;
import com.gmao.app.mapper.EquipementMapper;

@Service
@Transactional
public class EquipementServiceImpl implements EquipementService {

	private final EquipementRepository equipementRepository;
	private final EquipementMapper equipementMapper;


	public EquipementServiceImpl(EquipementRepository equipementRepository, EquipementMapper equipementMapper) {
		this.equipementRepository = equipementRepository;
		this.equipementMapper = equipementMapper;
	}

	private void validateInstallationDates(java.time.LocalDate dateInstallation,
			java.time.LocalDate dateMiseEnService) {
		if (dateInstallation != null && dateMiseEnService != null && !dateInstallation.isBefore(dateMiseEnService)) {
			throw new IllegalArgumentException(
					"La date d’installation doit être strictement antérieure à la date de mise en service.");
		}
	}

	@Override
	public EquipementResponse create(EquipementCreateRequest request) {
		validateCreateRequest(request);
		validateInstallationDates(request.getDateInstallation(), request.getDateMiseEnService());
		checkCodeUniqueness(request.getCode());

		Equipement equipement = equipementMapper.mapToEntity(request);
		// INC 6: à la création, seul ACTIF est autorisé
		applyEquipmentStatus(equipement, ACTIF);
		if (request.getParentId() != null) {
			Equipement parent = getEquipementOrThrow(request.getParentId());
			validateParentRelation(equipement, parent);
			equipement.setParent(parent);
		}
		Equipement saved = equipementRepository.save(equipement);
		return equipementMapper.mapToResponse(saved);
	}

	@Override
	public EquipementResponse update(Long id, EquipementUpdateRequest request) {
	    validateUpdateRequest(request);

	    Equipement equipement = getEquipementOrThrow(id);

	    /*
	     * INC 6:
	     * The classic edit form must not change the equipment status.
	     * Status is managed only by:
	     * - intervention EN_COURS  -> MAINTENANCE
	     * - intervention TERMINEE  -> ACTIF
	     * - manual status button   -> HS / ARCHIVED / ACTIF according to workflow
	     */
	    String oldStatus = equipement.getStatut() == null || equipement.getStatut().isBlank()
	            ? ACTIF
	            : normalizeStatus(equipement.getStatut());

	    equipementMapper.mapToEntity(request, equipement);

	    /*
	     * Important:
	     * The mapper can overwrite statut with request.getStatut().
	     * We restore the original status to prevent status change from edit form.
	     */
	    applyEquipmentStatus(equipement, oldStatus);

	    validateInstallationDates(equipement.getDateInstallation(), equipement.getDateMiseEnService());

	    if (request.getParentId() != null) {
	        Equipement parent = getEquipementOrThrow(request.getParentId());
	        validateParentRelation(equipement, parent);
	        equipement.setParent(parent);
	    } else {
	        equipement.setParent(null);
	    }
	    Equipement saved = equipementRepository.save(equipement);
	    return equipementMapper.mapToResponse(saved);
	}


	@Override
	@Transactional(readOnly = true)
	public EquipementResponse getById(Long id) {
		return equipementMapper.mapToResponse(getEquipementOrThrow(id));
	}

	@Override
	@Transactional(readOnly = true)
	public List<EquipementResponse> getAll() {
		return equipementRepository.findAll().stream().map(equipementMapper::mapToResponse)
				.collect(Collectors.toList());
	}

	public List<EquipementResponse> importEquipements(List<EquipementCreateRequest> requests) {
    List<EquipementResponse> results = new ArrayList<>();
    int index = 0;
    for (EquipementCreateRequest req : requests) {
        index++;
        try {
            // Si el código viene vacío, generar uno automáticamente
            if (req.getCode() == null || req.getCode().trim().isEmpty()) {
                req.setCode(generateNextCode());
            }
            // Llamar al create existente (que ya valida unicidad)
            EquipementResponse response = create(req);
            results.add(response);
        } catch (Exception e) {
            throw new RuntimeException("Erreur ligne " + index + ": " + e.getMessage());
        }
    }
    return results;
}

// Método auxiliar para generar el siguiente código (similar al frontend)
private String generateNextCode() {
    String maxCode = equipementRepository.findMaxCode();
    if (maxCode == null) return "EQ-000000001";
    int num = Integer.parseInt(maxCode.substring(3));
    int next = num + 1;
    return String.format("EQ-%09d", next);
}

	@Override
	public void delete(Long id) {
		Equipement equipement = getEquipementOrThrow(id);

		if (!canBeDeleted(id)) {
			throw new IllegalStateException(
					"Impossible de supprimer cet équipement car il possède des enfants, des interventions ou des préventifs.");
		}

		equipementRepository.delete(equipement);
	}

	@Override
	public void archive(Long id) {
		Equipement equipement = getEquipementOrThrow(id);

		validateManualStatusTransition(equipement, ARCHIVED);
		applyEquipmentStatus(equipement, ARCHIVED);

		equipementRepository.save(equipement);
	}

	@Override
	public void unarchive(Long id) {
		Equipement equipement = getEquipementOrThrow(id);

		validateManualStatusTransition(equipement, ACTIF);
		applyEquipmentStatus(equipement, ACTIF);

		equipementRepository.save(equipement);
	}

	@Override
	public EquipementResponse changeStatus(Long id, String statut) {
		String targetStatus = normalizeStatus(statut);

		Equipement equipement = getEquipementOrThrow(id);

		validateManualStatusTransition(equipement, targetStatus);
		applyEquipmentStatus(equipement, targetStatus);

		Equipement saved = equipementRepository.save(equipement);
		return equipementMapper.mapToResponse(saved);
	}

	@Override
	@Transactional(readOnly = true)
	public List<EquipementResponse> search(String keyword) {
		if (keyword == null || keyword.isBlank()) {
			return getAll();
		}

		return equipementRepository.search(keyword.trim()).stream().map(equipementMapper::mapToResponse)
				.collect(Collectors.toList());
	}

	@Override
	@Transactional(readOnly = true)
	public List<EquipementResponse> findByType(String type) {
		if (type == null || type.isBlank()) {
			throw new IllegalArgumentException("Le type est obligatoire.");
		}

		return equipementRepository.findByTypeIgnoreCase(type.trim()).stream().map(equipementMapper::mapToResponse)
				.collect(Collectors.toList());
	}

	@Override
	@Transactional(readOnly = true)
	public List<EquipementResponse> findByStatut(String statut) {
		if (statut == null || statut.isBlank()) {
			throw new IllegalArgumentException("Le statut est obligatoire.");
		}

		return equipementRepository.findByStatutIgnoreCase(statut.trim()).stream().map(equipementMapper::mapToResponse)
				.collect(Collectors.toList());
	}

	@Override
	@Transactional(readOnly = true)
	public List<EquipementResponse> findRoots() {
		return equipementRepository.findByParentIsNull().stream().map(equipementMapper::mapToResponse)
				.collect(Collectors.toList());
	}

	@Override
	@Transactional(readOnly = true)
	public List<EquipementResponse> findChildren(Long parentId) {
		getEquipementOrThrow(parentId);

		return equipementRepository.findByParentId(parentId).stream().map(equipementMapper::mapToResponse)
				.collect(Collectors.toList());
	}

	@Override
	public EquipementResponse assignParent(Long childId, Long parentId) {
		Equipement child = getEquipementOrThrow(childId);
		Equipement parent = getEquipementOrThrow(parentId);

		validateParentRelation(child, parent);

		child.setParent(parent);
		Equipement saved = equipementRepository.save(child);
		return equipementMapper.mapToResponse(saved);
	}

	@Override
	public EquipementResponse detachParent(Long childId) {
		Equipement child = getEquipementOrThrow(childId);
		child.setParent(null);

		Equipement saved = equipementRepository.save(child);
		return equipementMapper.mapToResponse(saved);
	}

	@Override
	@Transactional(readOnly = true)
	public List<EquipementTreeResponse> getTree() {
		return equipementRepository.findByParentIsNull().stream().map(equipementMapper::mapToTreeResponse)
				.collect(Collectors.toList());
	}

	@Override
	@Transactional(readOnly = true)
	public EquipementDetailResponse getDetail(Long id) {
		return equipementMapper.mapToDetailResponse(getEquipementOrThrow(id));
	}

	@Override
	@Transactional(readOnly = true)
	public boolean existsByCode(String code) {
		if (code == null || code.isBlank()) {
			return false;
		}
		return equipementRepository.existsByCode(code.trim());
	}

	@Override
	@Transactional(readOnly = true)
	public boolean canBeDeleted(Long id) {
		Equipement equipement = getEquipementOrThrow(id);

		boolean hasChildren = equipement.getChildren() != null && !equipement.getChildren().isEmpty();
		boolean hasInterventions = equipement.getInterventions() != null && !equipement.getInterventions().isEmpty();
		boolean hasPreventifs = equipement.getPreventifs() != null && !equipement.getPreventifs().isEmpty();

		return !hasChildren && !hasInterventions && !hasPreventifs;
	}

	private Equipement getEquipementOrThrow(Long id) {
		return equipementRepository.findById(id)
				.orElseThrow(() -> new RuntimeException("Equipement introuvable avec l'id : " + id));
	}

	private void validateCreateRequest(EquipementCreateRequest request) {
		if (request == null) {
			throw new IllegalArgumentException("La requête de création est obligatoire.");
		}
		if (request.getCode() == null || request.getCode().isBlank()) {
			throw new IllegalArgumentException("Le code équipement est obligatoire.");
		}
		if (request.getDescription() == null || request.getDescription().isBlank()) {
			throw new IllegalArgumentException("La description est obligatoire.");
		}
	}

	private void validateUpdateRequest(EquipementUpdateRequest request) {
		if (request == null) {
			throw new IllegalArgumentException("La requête de mise à jour est obligatoire.");
		}
		if (request.getDescription() != null && request.getDescription().isBlank()) {
			throw new IllegalArgumentException("La description ne peut pas être vide.");
		}
		if (request.getStatut() != null && request.getStatut().isBlank()) {
			throw new IllegalArgumentException("Le statut ne peut pas être vide.");
		}
	}

	private void validateParentRelation(Equipement child, Equipement parent) {
		if (child == null || parent == null) {
			throw new IllegalArgumentException("La relation parent/enfant est invalide.");
		}

		if (child.getId() != null && Objects.equals(child.getId(), parent.getId())) {
			throw new IllegalArgumentException("Un équipement ne peut pas être son propre parent.");
		}

		Equipement current = parent;
		while (current != null) {
			if (child.getId() != null && Objects.equals(current.getId(), child.getId())) {
				throw new IllegalArgumentException("Relation hiérarchique circulaire détectée.");
			}
			current = current.getParent();
		}
	}

	private void checkCodeUniqueness(String code) {
		if (equipementRepository.existsByCode(code.trim())) {
			throw new IllegalArgumentException("Le code équipement existe déjà : " + code);
		}
	}

	private static final String ACTIF = "ACTIF";
	private static final String MAINTENANCE = "MAINTENANCE";
	private static final String HS = "HS";
	private static final String ARCHIVED = "ARCHIVED";

	private String normalizeStatus(String statut) {
		if (statut == null || statut.isBlank()) {
			throw new IllegalArgumentException("Le statut est obligatoire.");
		}

		String value = statut.trim().toUpperCase();

		if (!ACTIF.equals(value) && !MAINTENANCE.equals(value) && !HS.equals(value) && !ARCHIVED.equals(value)) {
			throw new IllegalArgumentException("Statut équipement invalide : " + statut);
		}

		return value;
	}

	private void applyEquipmentStatus(Equipement equipement, String statut) {
		equipement.setStatut(statut);
		equipement.setActif(!ARCHIVED.equals(statut));
	}

	private void validateManualStatusTransition(Equipement equipement, String targetStatus) {
		String currentStatus = normalizeStatus(equipement.getStatut());

		if (currentStatus.equals(targetStatus)) {
			return;
		}

		switch (currentStatus) {
		case ACTIF -> {
			if (ARCHIVED.equals(targetStatus)) {
				requireAdmin("archiver un équipement actif");
				return;
			}

			if (MAINTENANCE.equals(targetStatus)) {
				throw new IllegalStateException(
						"Le passage ACTIF vers MAINTENANCE doit se faire uniquement via une intervention en cours.");
			}
		}

		case MAINTENANCE -> {
			if (HS.equals(targetStatus)) {
				return;
			}

			if (ACTIF.equals(targetStatus)) {
				throw new IllegalStateException(
						"Le passage MAINTENANCE vers ACTIF doit se faire automatiquement à la clôture de l’intervention.");
			}
		}

		case HS -> {
			if (MAINTENANCE.equals(targetStatus)) {
				return;
			}

			if (ARCHIVED.equals(targetStatus)) {
				requireAdmin("archiver un équipement HS");
				return;
			}
		}

		case ARCHIVED -> {
			if (ACTIF.equals(targetStatus)) {
				requireAdmin("réactiver un équipement archivé");
				return;
			}
		}

		default -> throw new IllegalStateException("Statut courant non géré : " + currentStatus);
		}

		throw new IllegalStateException("Changement de statut non autorisé : " + currentStatus + " -> " + targetStatus);
	}

	private void requireAdmin(String action) {
		var authentication = org.springframework.security.core.context.SecurityContextHolder.getContext()
				.getAuthentication();

		boolean isAdmin = authentication != null && authentication.getAuthorities() != null
				&& authentication.getAuthorities().stream()
						.anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()) || "ADMIN".equals(a.getAuthority()));

		if (!isAdmin) {
			throw new IllegalStateException("Action réservée à un administrateur : " + action);
		}
	}
}