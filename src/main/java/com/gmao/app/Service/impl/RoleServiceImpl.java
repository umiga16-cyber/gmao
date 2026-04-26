package com.gmao.app.Service.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.gmao.app.Model.Role;
import com.gmao.app.Repository.RoleRepository;
import com.gmao.app.Service.RoleService;
import com.gmao.app.dto.RoleCreateRequest;
import com.gmao.app.dto.RoleResponse;

@Service
@Transactional
public class RoleServiceImpl implements RoleService {

    private final RoleRepository roleRepository;

    public RoleServiceImpl(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    @Override
    public RoleResponse create(RoleCreateRequest request) {
        if (request == null || request.getNom() == null || request.getNom().isBlank()) {
            throw new IllegalArgumentException("Le nom du rôle est obligatoire.");
        }

        String nom = request.getNom().trim().toUpperCase();

        if (roleRepository.existsByNom(nom)) {
            throw new IllegalArgumentException("Ce rôle existe déjà.");
        }

        Role role = new Role();
        role.setNom(nom);

        Role saved = roleRepository.save(role);

        RoleResponse response = new RoleResponse();
        response.setId(saved.getId());
        response.setNom(saved.getNom());
        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public List<RoleResponse> getAll() {
        return roleRepository.findAll()
                .stream()
                .map(role -> {
                    RoleResponse response = new RoleResponse();
                    response.setId(role.getId());
                    response.setNom(role.getNom());
                    return response;
                })
                .collect(Collectors.toList());
    }
}