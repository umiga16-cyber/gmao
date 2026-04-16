package com.gmao.app.mapper;

import org.springframework.stereotype.Component;

import com.gmao.app.Model.User;
import com.gmao.app.dto.UserResponse;

@Component
public class  UserMapper {

    public  UserResponse mapToResponse( User user) {
        UserResponse response = new  UserResponse();
        response.setId(user.getId());
        response.setNom(user.getNom());
        response.setRoleId(user.getRole() != null ? user.getRole().getId() : null);
        response.setRoleNom(user.getRole() != null ? user.getRole().getNom() : null);
        response.setEmail(user.getEmail());
        response.setStatut(user.getStatut());
        response.setActif(user.getActif());
        return response;
    }
}