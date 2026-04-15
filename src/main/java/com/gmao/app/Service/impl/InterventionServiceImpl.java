package com.gmao.app.Service.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.gmao.app.Model.User;
import com.gmao.app.Model.Equipement;
import com.gmao.app.Model.Intervention;
import com.gmao.app.Model.Preventif;
import com.gmao.app.Repository.UserRepository;
import com.gmao.app.Repository.EquipementRepository;
import com.gmao.app.Repository.InterventionRepository;
import com.gmao.app.Repository.PreventifRepository;
import com.gmao.app.Service.InterventionService;
import com.gmao.app.dto.InterventionCreateRequest;
import com.gmao.app.dto.InterventionDetailResponse;
import com.gmao.app.dto.InterventionResponse;
import com.gmao.app.dto.InterventionUpdateRequest;
import com.gmao.app.mapper.InterventionMapper;

@Service
@Transactional
public class InterventionServiceImpl implements InterventionService {

    private final InterventionRepository interventionRepository;
    private final EquipementRepository equipementRepository;
    private final UserRepository appUserRepository;
    private final PreventifRepository preventifRepository;
    private final InterventionMapper interventionMapper;

    public InterventionServiceImpl(InterventionRepository interventionRepository,
                                   EquipementRepository equipementRepository,
                                   UserRepository appUserRepository,
                                   PreventifRepository preventifRepository,
                                   InterventionMapper interventionMapper) {
        this.interventionRepository = interventionRepository;
        this.equipementRepository = equipementRepository;
        this.appUserRepository = appUserRepository;
        this.preventifRepository = preventifRepository;
        this.interventionMapper = interventionMapper;
    }

    @Override
    public InterventionResponse create(InterventionCreateRequest request) {
        validateCreateRequest(request);
        validateDates(request.getDateDebut(), request.getDateFin());

        Equipement equipement = getEquipementOrThrow(request.getEquipementId());
        User createdBy = getUserOrThrow(request.getCreatedById());
        Preventif preventif = getPreventifOrNull(request.getPreventifId());

        Intervention intervention = interventionMapper.mapToEntity(request);
        intervention.setEquipement(equipement);
        intervention.setCreatedBy(createdBy);
        intervention.setPreventif(preventif);

        if (intervention.getStatut() == null || intervention.getStatut().isBlank()) {
            intervention.setStatut("OPEN");
        }

        Intervention saved = interventionRepository.save(intervention);
        return interventionMapper.mapToResponse(saved);
    }

    @Override
    public InterventionResponse update(Long id, InterventionUpdateRequest request) {
        validateUpdateRequest(request);
        validateDates(request.getDateDebut(), request.getDateFin());

        Intervention intervention = getInterventionOrThrow(id);
        interventionMapper.mapToEntity(request, intervention);

        if (request.getEquipementId() != null) {
            intervention.setEquipement(getEquipementOrThrow(request.getEquipementId()));
        }

        if (request.getCreatedById() != null) {
            intervention.setCreatedBy(getUserOrThrow(request.getCreatedById()));
        }

        if (request.getPreventifId() != null) {
            intervention.setPreventif(getPreventifOrNull(request.getPreventifId()));
        }

        Intervention saved = interventionRepository.save(intervention);
        return interventionMapper.mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public InterventionResponse getById(Long id) {
        return interventionMapper.mapToResponse(getInterventionOrThrow(id));
    }

    @Override
    @Transactional(readOnly = true)
    public InterventionDetailResponse getDetail(Long id) {
        return interventionMapper.mapToDetailResponse(getInterventionOrThrow(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<InterventionResponse> getAll() {
        return interventionRepository.findAll()
                .stream()
                .map(interventionMapper::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public void delete(Long id) {
        Intervention intervention = getInterventionOrThrow(id);
        interventionRepository.delete(intervention);
    }

    @Override
    public InterventionResponse changeStatus(Long id, String statut) {
        if (statut == null || statut.isBlank()) {
            throw new IllegalArgumentException("Le statut est obligatoire.");
        }

        Intervention intervention = getInterventionOrThrow(id);
        intervention.setStatut(statut.trim());

        Intervention saved = interventionRepository.save(intervention);
        return interventionMapper.mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<InterventionResponse> search(String keyword) {
        if (keyword == null || keyword.isBlank()) {
            return getAll();
        }

        String value = keyword.trim().toLowerCase();

        return interventionRepository.findAll()
                .stream()
                .filter(i ->
                        containsIgnoreCase(i.getLibele(), value)
                        || containsIgnoreCase(i.getType(), value)
                        || containsIgnoreCase(i.getStatut(), value)
                        || containsIgnoreCase(i.getCommentaire(), value)
                )
                .map(interventionMapper::mapToResponse)
                .collect(Collectors.toList());
    }

    private boolean containsIgnoreCase(String source, String value) {
        return source != null && source.toLowerCase().contains(value);
    }

    @Override
    @Transactional(readOnly = true)
    public List<InterventionResponse> findByEquipement(Long equipementId) {
        getEquipementOrThrow(equipementId);

        return interventionRepository.findByEquipementId(equipementId)
                .stream()
                .map(interventionMapper::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<InterventionResponse> findByStatut(String statut) {
        if (statut == null || statut.isBlank()) {
            throw new IllegalArgumentException("Le statut est obligatoire.");
        }

        return interventionRepository.findByStatutIgnoreCase(statut.trim())
                .stream()
                .map(interventionMapper::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<InterventionResponse> findByCreatedBy(Long createdById) {
        getUserOrThrow(createdById);

        return interventionRepository.findByCreatedById(createdById)
                .stream()
                .map(interventionMapper::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<InterventionResponse> findByPreventif(Long preventifId) {
        getPreventifOrThrow(preventifId);

        return interventionRepository.findByPreventifId(preventifId)
                .stream()
                .map(interventionMapper::mapToResponse)
                .collect(Collectors.toList());
    }

    private Intervention getInterventionOrThrow(Long id) {
        return interventionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Intervention introuvable avec l'id : " + id));
    }

    private Equipement getEquipementOrThrow(Long id) {
        return equipementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Equipement introuvable avec l'id : " + id));
    }

    private User getUserOrThrow(Long id) {
        return appUserRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable avec l'id : " + id));
    }

    private Preventif getPreventifOrThrow(Long id) {
        return preventifRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Préventif introuvable avec l'id : " + id));
    }

    private Preventif getPreventifOrNull(Long id) {
        if (id == null) {
            return null;
        }
        return getPreventifOrThrow(id);
    }

    private void validateCreateRequest(InterventionCreateRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("La requête de création est obligatoire.");
        }
        if (request.getLibele() == null || request.getLibele().isBlank()) {
            throw new IllegalArgumentException("Le libellé est obligatoire.");
        }
        if (request.getEquipementId() == null) {
            throw new IllegalArgumentException("L'id équipement est obligatoire.");
        }
        if (request.getCreatedById() == null) {
            throw new IllegalArgumentException("L'id du créateur est obligatoire.");
        }
    }

    private void validateUpdateRequest(InterventionUpdateRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("La requête de mise à jour est obligatoire.");
        }
        if (request.getLibele() != null && request.getLibele().isBlank()) {
            throw new IllegalArgumentException("Le libellé ne peut pas être vide.");
        }
        if (request.getStatut() != null && request.getStatut().isBlank()) {
            throw new IllegalArgumentException("Le statut ne peut pas être vide.");
        }
    }

    private void validateDates(java.time.LocalDateTime dateDebut, java.time.LocalDateTime dateFin) {
        if (dateDebut != null && dateFin != null && dateFin.isBefore(dateDebut)) {
            throw new IllegalArgumentException("La date de fin ne peut pas être antérieure à la date de début.");
        }
    }
}