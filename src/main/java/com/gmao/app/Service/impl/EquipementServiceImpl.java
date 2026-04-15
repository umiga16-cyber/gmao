package com.gmao.app.Service.impl;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    public EquipementServiceImpl(EquipementRepository equipementRepository,
                                 EquipementMapper equipementMapper) {
        this.equipementRepository = equipementRepository;
        this.equipementMapper = equipementMapper;
    }

    @Override
    public EquipementResponse create(EquipementCreateRequest request) {
        validateCreateRequest(request);
        checkCodeUniqueness(request.getCode());

        Equipement equipement = equipementMapper.mapToEntity(request);

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
        equipementMapper.mapToEntity(request, equipement);

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
        return equipementRepository.findAll()
                .stream()
                .map(equipementMapper::mapToResponse)
                .collect(Collectors.toList());
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
        equipement.setActif(Boolean.FALSE);

        if (equipement.getStatut() == null || equipement.getStatut().isBlank()) {
            equipement.setStatut("ARCHIVED");
        }

        equipementRepository.save(equipement);
    }

    @Override
    public EquipementResponse changeStatus(Long id, String statut) {
        if (statut == null || statut.isBlank()) {
            throw new IllegalArgumentException("Le statut est obligatoire.");
        }

        Equipement equipement = getEquipementOrThrow(id);
        equipement.setStatut(statut.trim());

        Equipement saved = equipementRepository.save(equipement);
        return equipementMapper.mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EquipementResponse> search(String keyword) {
        if (keyword == null || keyword.isBlank()) {
            return getAll();
        }

        return equipementRepository.search(keyword.trim())
                .stream()
                .map(equipementMapper::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<EquipementResponse> findByType(String type) {
        if (type == null || type.isBlank()) {
            throw new IllegalArgumentException("Le type est obligatoire.");
        }

        return equipementRepository.findByTypeIgnoreCase(type.trim())
                .stream()
                .map(equipementMapper::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<EquipementResponse> findByStatut(String statut) {
        if (statut == null || statut.isBlank()) {
            throw new IllegalArgumentException("Le statut est obligatoire.");
        }

        return equipementRepository.findByStatutIgnoreCase(statut.trim())
                .stream()
                .map(equipementMapper::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<EquipementResponse> findRoots() {
        return equipementRepository.findByParentIsNull()
                .stream()
                .map(equipementMapper::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<EquipementResponse> findChildren(Long parentId) {
        getEquipementOrThrow(parentId);

        return equipementRepository.findByParentId(parentId)
                .stream()
                .map(equipementMapper::mapToResponse)
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
        return equipementRepository.findByParentIsNull()
                .stream()
                .map(equipementMapper::mapToTreeResponse)
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
}