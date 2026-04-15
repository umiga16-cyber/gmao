package com.gmao.app.mapper;

import org.springframework.stereotype.Component;

import com.gmao.app.Model.Role;
import com.gmao.app.dto.RoleCreateRequest;
import com.gmao.app.dto.RoleResponse;

@Component
public class RoleMapper {

    public Role mapToEntity(RoleCreateRequest request) {
        Role role = new Role();
        role.setNom(request.getNom() != null ? request.getNom().trim() : null);
        return role;
    }

    public RoleResponse mapToResponse(Role role) {
        RoleResponse response = new RoleResponse();
        response.setId(role.getRoleId());
        response.setNom(role.getNom());
        return response;
    }
}