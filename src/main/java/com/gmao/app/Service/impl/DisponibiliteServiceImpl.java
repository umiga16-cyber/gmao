package com.gmao.app.Service.impl;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.gmao.app.Model.Disponibilite;
import com.gmao.app.Model.User;
import com.gmao.app.Repository.DisponibiliteRepository;
import com.gmao.app.Repository.UserRepository;
import com.gmao.app.Service.DisponibiliteService;
import com.gmao.app.dto.DisponibiliteCreateRequest;
import com.gmao.app.dto.DisponibiliteResponse;
import com.gmao.app.mapper.DisponibiliteMapper;

@Service
@Transactional
public class DisponibiliteServiceImpl implements DisponibiliteService {

    private final DisponibiliteRepository disponibiliteRepository;
    private final UserRepository appUserRepository;
    private final DisponibiliteMapper disponibiliteMapper;

    public DisponibiliteServiceImpl(DisponibiliteRepository disponibiliteRepository,
                                    UserRepository appUserRepository,
                                    DisponibiliteMapper disponibiliteMapper) {
        this.disponibiliteRepository = disponibiliteRepository;
        this.appUserRepository = appUserRepository;
        this.disponibiliteMapper = disponibiliteMapper;
    }

    @Override
    public DisponibiliteResponse save(DisponibiliteCreateRequest request) {
        if (request == null || request.getUserId() == null || request.getDate() == null || request.getDisponible() == null) {
            throw new IllegalArgumentException("Les informations de disponibilité sont obligatoires.");
        }

        User user = appUserRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable avec l'id : " + request.getUserId()));

        Disponibilite disponibilite = disponibiliteRepository.findByUserIdAndDate(request.getUserId(), request.getDate())
                .orElse(new Disponibilite());

        disponibilite.setUser(user);
        disponibilite.setDate(request.getDate());
        disponibilite.setDisponible(request.getDisponible());

        Disponibilite saved = disponibiliteRepository.save(disponibilite);
        return disponibiliteMapper.mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DisponibiliteResponse> findByUser(Long userId) {
        return disponibiliteRepository.findByUserId(userId)
                .stream()
                .map(disponibiliteMapper::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<DisponibiliteResponse> findByDate(LocalDate date) {
        return disponibiliteRepository.findByDate(date)
                .stream()
                .map(disponibiliteMapper::mapToResponse)
                .collect(Collectors.toList());
    }
}