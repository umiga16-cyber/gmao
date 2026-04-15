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
import com.gmao.app.mapper.RoleMapper;

@Service
@Transactional
public class RoleServiceImpl implements RoleService {

    private final RoleRepository roleRepository;
    private final RoleMapper roleMapper;

    public RoleServiceImpl(RoleRepository roleRepository, RoleMapper roleMapper) {
        this.roleRepository = roleRepository;
        this.roleMapper = roleMapper;
    }

    @Override
    public RoleResponse create(RoleCreateRequest request) {
        if (request == null || request.getNom() == null || request.getNom().isBlank()) {
            throw new IllegalArgumentException("Le nom du rôle est obligatoire.");
        }

        String nom = request.getNom().trim();
        if (roleRepository.existsByNom(nom)) {
            throw new IllegalArgumentException("Le rôle existe déjà : " + nom);
        }

        Role saved = roleRepository.save(roleMapper.mapToEntity(request));
        return roleMapper.mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RoleResponse> getAll() {
        return roleRepository.findAll()
                .stream()
                .map(roleMapper::mapToResponse)
                .collect(Collectors.toList());
    }
}