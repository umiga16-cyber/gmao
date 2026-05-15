package com.gmao.app.Service.impl;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.gmao.app.Model.Prs;
import com.gmao.app.Repository.InterventionPrsRepository;
import com.gmao.app.Repository.PrsMouvementRepository;
import com.gmao.app.Repository.PrsRepository;
import com.gmao.app.Service.PrsService;
import com.gmao.app.dto.PrsCreateRequest;
import com.gmao.app.dto.PrsResponse;
import com.gmao.app.dto.PrsUpdateRequest;
import com.gmao.app.mapper.PrsMapper;

@Service
@Transactional
public class PrsServiceImpl implements PrsService {

    private final PrsRepository prsRepository;
    private final PrsMouvementRepository prsMouvementRepository;
    private final InterventionPrsRepository interventionPrsRepository;
    private final PrsMapper prsMapper;

    public PrsServiceImpl(
            PrsRepository prsRepository,
            PrsMouvementRepository prsMouvementRepository,
            InterventionPrsRepository interventionPrsRepository,
            PrsMapper prsMapper) {
        this.prsRepository = prsRepository;
        this.prsMouvementRepository = prsMouvementRepository;
        this.interventionPrsRepository = interventionPrsRepository;
        this.prsMapper = prsMapper;
    }

    @Override
    public PrsResponse create(PrsCreateRequest request) {
        validateRequest(request.getLibelle(), request.getQuantiteStock(), request.getSeuilMini());

        if (prsRepository.existsByLibelleIgnoreCase(request.getLibelle().trim())) {
            throw new IllegalArgumentException("Une PR avec ce libellé existe déjà.");
        }

        Prs prs = new Prs();
        prs.setLibelle(request.getLibelle().trim());
        prs.setQuantiteStock(request.getQuantiteStock());
        prs.setSeuilMini(request.getSeuilMini());

        Prs saved = prsRepository.save(prs);
        return prsMapper.toResponse(saved, 0L, 0L, true);
    }

    @Override
    public PrsResponse update(Long id, PrsUpdateRequest request) {
        validateRequest(request.getLibelle(), request.getQuantiteStock(), request.getSeuilMini());

        Prs prs = getOrThrow(id);
        String newLibelle = request.getLibelle().trim();

        if (!newLibelle.equalsIgnoreCase(prs.getLibelle())
                && prsRepository.existsByLibelleIgnoreCase(newLibelle)) {
            throw new IllegalArgumentException("Une PR avec ce libellé existe déjà.");
        }

        prs.setLibelle(newLibelle);
        prs.setQuantiteStock(request.getQuantiteStock());
        prs.setSeuilMini(request.getSeuilMini());

        Prs saved = prsRepository.save(prs);
        long mouvementsCount = prsMouvementRepository.countByPrsId(saved.getId());
        long interventionsCount = interventionPrsRepository.countByPrsId(saved.getId());

        return prsMapper.toResponse(saved, mouvementsCount, interventionsCount, canDelete(saved.getId()));
    }

    @Override
    @Transactional(readOnly = true)
    public PrsResponse getById(Long id) {
        Prs prs = getOrThrow(id);
        long mouvementsCount = prsMouvementRepository.countByPrsId(id);
        long interventionsCount = interventionPrsRepository.countByPrsId(id);

        return prsMapper.toResponse(prs, mouvementsCount, interventionsCount, canDelete(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<PrsResponse> getAll() {
        return prsRepository.findAll()
                .stream()
                .map(prs -> prsMapper.toResponse(
                        prs,
                        prsMouvementRepository.countByPrsId(prs.getId()),
                        interventionPrsRepository.countByPrsId(prs.getId()),
                        canDelete(prs.getId())))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PrsResponse> search(String keyword) {
        if (keyword == null || keyword.isBlank()) {
            return getAll();
        }

        return prsRepository.findByLibelleContainingIgnoreCase(keyword.trim())
                .stream()
                .map(prs -> prsMapper.toResponse(
                        prs,
                        prsMouvementRepository.countByPrsId(prs.getId()),
                        interventionPrsRepository.countByPrsId(prs.getId()),
                        canDelete(prs.getId())))
                .collect(Collectors.toList());
    }

    @Override
    public void delete(Long id) {
        Prs prs = getOrThrow(id);

        if (!canDelete(id)) {
            throw new IllegalStateException(
                "Impossible de supprimer cette PR car elle est déjà liée à des mouvements de stock ou à des interventions."
            );
        }

        prsRepository.delete(prs);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean canDelete(Long id) {
        boolean hasMouvements = prsMouvementRepository.existsByPrsId(id);
        boolean hasInterventions = interventionPrsRepository.existsByPrsId(id);
        return !hasMouvements && !hasInterventions;
    }

    private Prs getOrThrow(Long id) {
        return prsRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("PR introuvable avec l'id : " + id));
    }

    private void validateRequest(String libelle, BigDecimal quantiteStock, BigDecimal seuilMini) {
        if (libelle == null || libelle.isBlank()) {
            throw new IllegalArgumentException("Le libellé est obligatoire.");
        }
        if (quantiteStock == null || quantiteStock.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("La quantité en stock doit être positive ou nulle.");
        }
        if (seuilMini == null || seuilMini.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Le seuil minimum doit être positif ou nul.");
        }
    }
}