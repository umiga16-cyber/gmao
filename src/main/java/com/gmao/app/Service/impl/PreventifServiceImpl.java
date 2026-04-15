package com.gmao.app.Service.impl;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.gmao.app.Model.Equipement;
import com.gmao.app.Model.Preventif;
import com.gmao.app.Model.enums.FrequencyType;
import com.gmao.app.Repository.EquipementRepository;
import com.gmao.app.Repository.PreventifRepository;
import com.gmao.app.Service.PreventifService;
import com.gmao.app.dto.PreventifCreateRequest;
import com.gmao.app.dto.PreventifDetailResponse;
import com.gmao.app.dto.PreventifResponse;
import com.gmao.app.dto.PreventifUpdateRequest;
import com.gmao.app.mapper.PreventifMapper;

@Service
@Transactional
public class PreventifServiceImpl implements PreventifService {

    private final PreventifRepository preventifRepository;
    private final EquipementRepository equipementRepository;
    private final PreventifMapper preventifMapper;

    public PreventifServiceImpl(PreventifRepository preventifRepository,
                                EquipementRepository equipementRepository,
                                PreventifMapper preventifMapper) {
        this.preventifRepository = preventifRepository;
        this.equipementRepository = equipementRepository;
        this.preventifMapper = preventifMapper;
    }

    @Override
    public PreventifResponse create(PreventifCreateRequest request) {
        validateCreateRequest(request);

        Equipement equipement = getEquipementOrThrow(request.getEquipementId());

        Preventif preventif = preventifMapper.mapToEntity(request);
        preventif.setEquipement(equipement);

        if (preventif.getStatut() == null || preventif.getStatut().isBlank()) {
            preventif.setStatut("ACTIVE");
        }

        Preventif saved = preventifRepository.save(preventif);
        return preventifMapper.mapToResponse(saved);
    }

    @Override
    public PreventifResponse update(Long id, PreventifUpdateRequest request) {
        validateUpdateRequest(request);

        Preventif preventif = getPreventifOrThrow(id);
        preventifMapper.mapToEntity(request, preventif);

        if (request.getEquipementId() != null) {
            preventif.setEquipement(getEquipementOrThrow(request.getEquipementId()));
        }

        Preventif saved = preventifRepository.save(preventif);
        return preventifMapper.mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public PreventifResponse getById(Long id) {
        return preventifMapper.mapToResponse(getPreventifOrThrow(id));
    }

    @Override
    @Transactional(readOnly = true)
    public PreventifDetailResponse getDetail(Long id) {
        return preventifMapper.mapToDetailResponse(getPreventifOrThrow(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<PreventifResponse> getAll() {
        return preventifRepository.findAll()
                .stream()
                .map(preventifMapper::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public void delete(Long id) {
        Preventif preventif = getPreventifOrThrow(id);
        preventifRepository.delete(preventif);
    }

    @Override
    public PreventifResponse changeStatus(Long id, String statut) {
        if (statut == null || statut.isBlank()) {
            throw new IllegalArgumentException("Le statut est obligatoire.");
        }

        Preventif preventif = getPreventifOrThrow(id);
        preventif.setStatut(statut.trim());

        Preventif saved = preventifRepository.save(preventif);
        return preventifMapper.mapToResponse(saved);
    }

    @Override
    public PreventifResponse archive(Long id) {
        Preventif preventif = getPreventifOrThrow(id);
        preventif.setActif(Boolean.FALSE);
        preventif.setStatut("ARCHIVED");

        Preventif saved = preventifRepository.save(preventif);
        return preventifMapper.mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PreventifResponse> search(String keyword) {
        if (keyword == null || keyword.isBlank()) {
            return getAll();
        }

        String value = keyword.trim().toLowerCase();

        return preventifRepository.findAll()
                .stream()
                .filter(p ->
                        containsIgnoreCase(p.getStatut(), value)
                        || containsIgnoreCase(p.getOperations(), value)
                        || (p.getTypeFrequence() != null && p.getTypeFrequence().name().toLowerCase().contains(value))
                        || (p.getEquipement() != null && containsIgnoreCase(p.getEquipement().getDescription(), value))
                )
                .map(preventifMapper::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PreventifResponse> findByEquipement(Long equipementId) {
        getEquipementOrThrow(equipementId);

        return preventifRepository.findByEquipementId(equipementId)
                .stream()
                .map(preventifMapper::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PreventifResponse> findByStatut(String statut) {
        if (statut == null || statut.isBlank()) {
            throw new IllegalArgumentException("Le statut est obligatoire.");
        }

        return preventifRepository.findByStatut(statut)
                .stream()
                .map(preventifMapper::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PreventifResponse> findByTypeFrequence(FrequencyType typeFrequence) {
        if (typeFrequence == null) {
            throw new IllegalArgumentException("Le type de fréquence est obligatoire.");
        }

        return preventifRepository.findByTypeFrequence(typeFrequence)
                .stream()
                .map(preventifMapper::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PreventifResponse> findDueBefore(LocalDate date) {
        if (date == null) {
            throw new IllegalArgumentException("La date est obligatoire.");
        }

        return preventifRepository.findByProchaineDateBefore(date)
                .stream()
                .map(preventifMapper::mapToResponse)
                .collect(Collectors.toList());
    }

    private Preventif getPreventifOrThrow(Long id) {
        return preventifRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Préventif introuvable avec l'id : " + id));
    }

    private Equipement getEquipementOrThrow(Long id) {
        return equipementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Equipement introuvable avec l'id : " + id));
    }

    private void validateCreateRequest(PreventifCreateRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("La requête de création est obligatoire.");
        }
        if (request.getEquipementId() == null) {
            throw new IllegalArgumentException("L'id équipement est obligatoire.");
        }
        if (request.getFrequence() == null || request.getFrequence() <= 0) {
            throw new IllegalArgumentException("La fréquence doit être supérieure à 0.");
        }
        if (request.getTypeFrequence() == null) {
            throw new IllegalArgumentException("Le type de fréquence est obligatoire.");
        }
    }

    private void validateUpdateRequest(PreventifUpdateRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("La requête de mise à jour est obligatoire.");
        }
        if (request.getFrequence() != null && request.getFrequence() <= 0) {
            throw new IllegalArgumentException("La fréquence doit être supérieure à 0.");
        }
        if (request.getStatut() != null && request.getStatut().isBlank()) {
            throw new IllegalArgumentException("Le statut ne peut pas être vide.");
        }
    }

    private boolean containsIgnoreCase(String source, String value) {
        return source != null && source.toLowerCase().contains(value);
    }
}