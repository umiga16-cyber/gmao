package com.gmao.app.Service.impl;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.gmao.app.Model.Equipement;
import com.gmao.app.Model.Intervention;
import com.gmao.app.Model.InterventionPrs;
import com.gmao.app.Model.Preventif;
import com.gmao.app.Model.Prs;
import com.gmao.app.Model.PrsMouvement;
import com.gmao.app.Model.User;
import com.gmao.app.Model.enums.MovementType;
import com.gmao.app.Repository.EquipementRepository;
import com.gmao.app.Repository.InterventionPrsRepository;
import com.gmao.app.Repository.InterventionRepository;
import com.gmao.app.Repository.PreventifRepository;
import com.gmao.app.Repository.PrsMouvementRepository;
import com.gmao.app.Repository.PrsRepository;
import com.gmao.app.Repository.UserRepository;
import com.gmao.app.Service.InterventionService;
import com.gmao.app.dto.InterventionCreateRequest;
import com.gmao.app.dto.InterventionDetailResponse;
import com.gmao.app.dto.InterventionPrsLineResponse;
import com.gmao.app.dto.InterventionResponse;
import com.gmao.app.dto.InterventionUpdateRequest;
import com.gmao.app.dto.PrsUsageRequest;
import com.gmao.app.mapper.InterventionMapper;

@Service
@Transactional
public class InterventionServiceImpl implements InterventionService {

    private final InterventionRepository interventionRepository;
    private final EquipementRepository equipementRepository;
    private final UserRepository appUserRepository;
    private final PreventifRepository preventifRepository;
    private final InterventionPrsRepository interventionPrsRepository;
    private final PrsRepository prsRepository;
    private final PrsMouvementRepository prsMouvementRepository;
    private final InterventionMapper interventionMapper;

    public InterventionServiceImpl(
            InterventionRepository interventionRepository,
            EquipementRepository equipementRepository,
            UserRepository appUserRepository,
            PreventifRepository preventifRepository,
            InterventionPrsRepository interventionPrsRepository,
            PrsRepository prsRepository,
            PrsMouvementRepository prsMouvementRepository,
            InterventionMapper interventionMapper) {
        this.interventionRepository = interventionRepository;
        this.equipementRepository = equipementRepository;
        this.appUserRepository = appUserRepository;
        this.preventifRepository = preventifRepository;
        this.interventionPrsRepository = interventionPrsRepository;
        this.prsRepository = prsRepository;
        this.prsMouvementRepository = prsMouvementRepository;
        this.interventionMapper = interventionMapper;
    }
    private void synchronizeEquipementStatusWithIntervention(Intervention intervention) {
        if (intervention == null || intervention.getEquipement() == null || intervention.getStatut() == null) {
            return;
        }

        Equipement equipement = intervention.getEquipement();

        String interventionStatus = intervention.getStatut().trim().toUpperCase();
        String equipementStatus = equipement.getStatut() == null
                ? ""
                : equipement.getStatut().trim().toUpperCase();

        if ("ARCHIVED".equals(equipementStatus)) {
            throw new IllegalStateException("Impossible de modifier le statut d’un équipement archivé via une intervention.");
        }

        if ("HS".equals(equipementStatus)) {
            throw new IllegalStateException("Un équipement HS ne peut pas être remis en maintenance ou actif automatiquement via une intervention.");
        }

        if ("EN_COURS".equals(interventionStatus)) {
            if ("ACTIF".equals(equipementStatus)) {
                equipement.setStatut("MAINTENANCE");
                equipement.setActif(Boolean.TRUE);
                equipementRepository.save(equipement);
            }
            return;
        }

        if ("TERMINEE".equals(interventionStatus)) {
            if ("MAINTENANCE".equals(equipementStatus)) {
                equipement.setStatut("ACTIF");
                equipement.setActif(Boolean.TRUE);
                equipementRepository.save(equipement);
            }
        }
    }
    @Override
    @Transactional(readOnly = true)
    public List<InterventionResponse> filter(String statut, String type, String equipementKeyword) {
        return interventionRepository.findAll()
                .stream()
                .filter(i -> statut == null || statut.isBlank()
                        || (i.getStatut() != null && i.getStatut().equalsIgnoreCase(statut)))
                .filter(i -> type == null || type.isBlank()
                        || (i.getType() != null && i.getType().equalsIgnoreCase(type)))
                .filter(i -> equipementKeyword == null || equipementKeyword.isBlank()
                        || (i.getEquipement() != null
                        && i.getEquipement().getDescription() != null
                        && i.getEquipement().getDescription().toLowerCase()
                        .contains(equipementKeyword.toLowerCase())))
                .map(interventionMapper::mapToResponse)
                .toList();
    }

    @Override
    public boolean canBeDeleted(Long id) {
        getInterventionOrThrow(id);
        return true;
    }
    
    @Override
    public InterventionResponse create(InterventionCreateRequest request) {
        validateCreateRequest(request);
        validateDates(request.getDateDebut(), request.getDateFin());

        checkCodeInterventionUniqueness(request.getCodeIntervention(), null);

        Equipement equipement = getEquipementOrThrow(request.getEquipementId());
        User createdBy = getCurrentAuthenticatedUser();
        Preventif preventif = getPreventifOrNull(request.getPreventifId());

        Intervention intervention = interventionMapper.mapToEntity(request);
        intervention.setEquipement(equipement);
        intervention.setCreatedBy(createdBy);
        intervention.setPreventif(preventif);

        if (intervention.getStatut() == null || intervention.getStatut().isBlank()) {
            intervention.setStatut("PLANIFIEE");
        }

        Intervention saved = interventionRepository.save(intervention);
        synchronizeEquipementStatusWithIntervention(saved);

        if (request.getPrsItems() != null && !request.getPrsItems().isEmpty()) {
            applyPrsConsumptionOnCreate(saved, request.getPrsItems());
        }

        return interventionMapper.mapToResponse(saved);
    }
    private User getCurrentAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalStateException("Utilisateur connecté introuvable.");
        }

        String email = authentication.getName();

        if (email == null || email.isBlank() || "anonymousUser".equalsIgnoreCase(email)) {
            throw new IllegalStateException("Utilisateur connecté introuvable.");
        }

        return appUserRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("Utilisateur connecté introuvable en base : " + email));
    }
    @Override
    public InterventionResponse update(Long id, InterventionUpdateRequest request) {
        validateUpdateRequest(request);
        validateDates(request.getDateDebut(), request.getDateFin());

        checkCodeInterventionUniqueness(request.getCodeIntervention(), id);

        Intervention intervention = getInterventionOrThrow(id);

        User originalCreatedBy = intervention.getCreatedBy();

        interventionMapper.mapToEntity(request, intervention);

        
        intervention.setCreatedBy(originalCreatedBy);

        if (request.getEquipementId() != null) {
            intervention.setEquipement(getEquipementOrThrow(request.getEquipementId()));
        }

        if (request.getPreventifId() != null) {
            intervention.setPreventif(getPreventifOrNull(request.getPreventifId()));
        }

        Intervention saved = interventionRepository.save(intervention);
        synchronizeEquipementStatusWithIntervention(saved);
        syncPrsConsumptionOnUpdate(saved, request.getPrsItems());

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
        Intervention intervention = getInterventionOrThrow(id);
        InterventionDetailResponse detail = interventionMapper.mapToDetailResponse(intervention);

        List<InterventionPrsLineResponse> prsItems = interventionPrsRepository.findByInterventionId(intervention.getId())
                .stream()
                .map(line -> {
                    InterventionPrsLineResponse dto = new InterventionPrsLineResponse();
                    dto.setPrsId(line.getPrs().getId());
                    dto.setPrsLibelle(line.getPrs().getLibelle());
                    dto.setQuantite(line.getQuantite());
                    return dto;
                })
                .toList();

        detail.setPrsItems(prsItems);
        return detail;
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
        restorePrsConsumptionOnDelete(intervention);
        interventionRepository.delete(intervention);
    }
    private String normalizeInterventionStatus(String statut) {
        if (statut == null || statut.isBlank()) {
            throw new IllegalArgumentException("Le statut est obligatoire.");
        }

        String value = statut.trim().toUpperCase();

        if (!"PLANIFIEE".equals(value)
                && !"EN_COURS".equals(value)
                && !"TERMINEE".equals(value)
                && !"ANNULEE".equals(value)) {
            throw new IllegalArgumentException("Statut intervention invalide : " + statut);
        }

        return value;
    }

    @Override
    public InterventionResponse changeStatus(Long id, String statut) {
        String targetStatus = normalizeInterventionStatus(statut);

        Intervention intervention = getInterventionOrThrow(id);
        intervention.setStatut(targetStatus);

        Intervention saved = interventionRepository.save(intervention);
        synchronizeEquipementStatusWithIntervention(saved);

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

    private boolean containsIgnoreCase(String source, String value) {
        return source != null && source.toLowerCase().contains(value);
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

        if (request.getCodeIntervention() == null || request.getCodeIntervention().isBlank()) {
            throw new IllegalArgumentException("Le code intervention est obligatoire.");
        }

        if (request.getCodeMateriel() == null || request.getCodeMateriel().isBlank()) {
            throw new IllegalArgumentException("Le code matériel est obligatoire.");
        }

        if (request.getLibele() == null || request.getLibele().isBlank()) {
            throw new IllegalArgumentException("Le libellé est obligatoire.");
        }

        if (request.getEquipementId() == null) {
            throw new IllegalArgumentException("L'id équipement est obligatoire.");
        }
    }

    private void validateUpdateRequest(InterventionUpdateRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("La requête de mise à jour est obligatoire.");
        }

        if (request.getCodeIntervention() != null && request.getCodeIntervention().isBlank()) {
            throw new IllegalArgumentException("Le code intervention ne peut pas être vide.");
        }

        if (request.getCodeMateriel() != null && request.getCodeMateriel().isBlank()) {
            throw new IllegalArgumentException("Le code matériel ne peut pas être vide.");
        }

        if (request.getLibele() != null && request.getLibele().isBlank()) {
            throw new IllegalArgumentException("Le libellé ne peut pas être vide.");
        }

        if (request.getStatut() != null && request.getStatut().isBlank()) {
            throw new IllegalArgumentException("Le statut ne peut pas être vide.");
        }
    }
    private void checkCodeInterventionUniqueness(String codeIntervention, Long currentId) {
        if (codeIntervention == null || codeIntervention.isBlank()) {
            return;
        }

        String value = codeIntervention.trim();

        boolean exists = currentId == null
                ? interventionRepository.existsByCodeInterventionIgnoreCase(value)
                : interventionRepository.existsByCodeInterventionIgnoreCaseAndIdNot(value, currentId);

        if (exists) {
            throw new IllegalArgumentException("Le code intervention existe déjà : " + value);
        }
    }
    private void validateDates(java.time.LocalDateTime dateDebut, java.time.LocalDateTime dateFin) {
        if (dateDebut != null && dateFin != null && dateFin.isBefore(dateDebut)) {
            throw new IllegalArgumentException("La date de fin ne peut pas être antérieure à la date de début.");
        }
    }

    private Map<Long, BigDecimal> normalizePrsItems(List<PrsUsageRequest> items) {
        Map<Long, BigDecimal> result = new HashMap<>();

        if (items == null) {
            return result;
        }

        for (PrsUsageRequest item : items) {
            if (item == null || item.getPrsId() == null || item.getQuantite() == null) {
                continue;
            }

            if (item.getQuantite().compareTo(BigDecimal.ZERO) <= 0) {
                throw new IllegalArgumentException("La quantité PR doit être supérieure à 0.");
            }

            result.merge(item.getPrsId(), item.getQuantite(), BigDecimal::add);
        }

        return result;
    }

    private void applyPrsConsumptionOnCreate(Intervention intervention, List<PrsUsageRequest> prsItems) {
        Map<Long, BigDecimal> normalized = normalizePrsItems(prsItems);

        for (Map.Entry<Long, BigDecimal> entry : normalized.entrySet()) {
            Long prsId = entry.getKey();
            BigDecimal qty = entry.getValue();

            Prs prs = prsRepository.findById(prsId)
                    .orElseThrow(() -> new RuntimeException("PR introuvable: " + prsId));

            if (prs.getQuantiteStock().compareTo(qty) < 0) {
                throw new IllegalStateException("Stock insuffisant pour la PR : " + prs.getLibelle());
            }

            prs.setQuantiteStock(prs.getQuantiteStock().subtract(qty));
            prsRepository.save(prs);

            InterventionPrs line = new InterventionPrs();
            line.setIntervention(intervention);
            line.setPrs(prs);
            line.setQuantite(qty);
            interventionPrsRepository.save(line);

            PrsMouvement mouvement = new PrsMouvement();
            mouvement.setPrs(prs);
            mouvement.setIntervention(intervention);
            mouvement.setQuantite(qty);
            mouvement.setOrigine("INTERVENTION#" + intervention.getId());
            mouvement.setType(MovementType.SORTIE);
            prsMouvementRepository.save(mouvement);
        }
    }

    private void syncPrsConsumptionOnUpdate(Intervention intervention, List<PrsUsageRequest> newItems) {
        Map<Long, BigDecimal> oldMap = interventionPrsRepository.findByInterventionId(intervention.getId())
                .stream()
                .collect(Collectors.toMap(
                        line -> line.getPrs().getId(),
                        InterventionPrs::getQuantite
                ));

        Map<Long, BigDecimal> newMap = normalizePrsItems(newItems);

        Set<Long> allPrsIds = new HashSet<>();
        allPrsIds.addAll(oldMap.keySet());
        allPrsIds.addAll(newMap.keySet());

        for (Long prsId : allPrsIds) {
            BigDecimal oldQty = oldMap.getOrDefault(prsId, BigDecimal.ZERO);
            BigDecimal newQty = newMap.getOrDefault(prsId, BigDecimal.ZERO);
            BigDecimal delta = newQty.subtract(oldQty);

            Prs prs = prsRepository.findById(prsId)
                    .orElseThrow(() -> new RuntimeException("PR introuvable: " + prsId));

            if (delta.compareTo(BigDecimal.ZERO) > 0) {
                if (prs.getQuantiteStock().compareTo(delta) < 0) {
                    throw new IllegalStateException("Stock insuffisant pour la PR : " + prs.getLibelle());
                }

                prs.setQuantiteStock(prs.getQuantiteStock().subtract(delta));
                prsRepository.save(prs);

                PrsMouvement mouvement = new PrsMouvement();
                mouvement.setPrs(prs);
                mouvement.setIntervention(intervention);
                mouvement.setQuantite(delta);
                mouvement.setOrigine("INTERVENTION_UPDATE#" + intervention.getId());
                mouvement.setType(MovementType.SORTIE);
                prsMouvementRepository.save(mouvement);
            } else if (delta.compareTo(BigDecimal.ZERO) < 0) {
                BigDecimal returnedQty = delta.abs();

                prs.setQuantiteStock(prs.getQuantiteStock().add(returnedQty));
                prsRepository.save(prs);

                PrsMouvement mouvement = new PrsMouvement();
                mouvement.setPrs(prs);
                mouvement.setIntervention(intervention);
                mouvement.setQuantite(returnedQty);
                mouvement.setOrigine("INTERVENTION_UPDATE_RETURN#" + intervention.getId());
                mouvement.setType(MovementType.ENTREE);
                prsMouvementRepository.save(mouvement);
            }
        }

        interventionPrsRepository.deleteByInterventionId(intervention.getId());

        for (Map.Entry<Long, BigDecimal> entry : newMap.entrySet()) {
            Prs prs = prsRepository.findById(entry.getKey())
                    .orElseThrow(() -> new RuntimeException("PR introuvable: " + entry.getKey()));

            InterventionPrs line = new InterventionPrs();
            line.setIntervention(intervention);
            line.setPrs(prs);
            line.setQuantite(entry.getValue());
            interventionPrsRepository.save(line);
        }
    }

    private void restorePrsConsumptionOnDelete(Intervention intervention) {
        List<InterventionPrs> lines = interventionPrsRepository.findByInterventionId(intervention.getId());

        for (InterventionPrs line : lines) {
            Prs prs = line.getPrs();
            BigDecimal qty = line.getQuantite();

            prs.setQuantiteStock(prs.getQuantiteStock().add(qty));
            prsRepository.save(prs);

            PrsMouvement mouvement = new PrsMouvement();
            mouvement.setPrs(prs);
            mouvement.setIntervention(intervention);
            mouvement.setQuantite(qty);
            mouvement.setOrigine("INTERVENTION_DELETE_RETURN#" + intervention.getId());
            mouvement.setType(MovementType.ENTREE);
            prsMouvementRepository.save(mouvement);
        }

        interventionPrsRepository.deleteByInterventionId(intervention.getId());
    }
}