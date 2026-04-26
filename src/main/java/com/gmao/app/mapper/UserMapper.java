package com.gmao.app.mapper;

import org.springframework.stereotype.Component;

import com.gmao.app.Model.User;
import com.gmao.app.dto.UserResponse;

@Component
public class UserMapper {

	public UserResponse mapToResponse(User user) {
		UserResponse response = new UserResponse();
		response.setId(user.getId());
		response.setNom(user.getNom());
		response.setEmail(user.getEmail());
		response.setStatut(user.getStatut());
		response.setActif(user.getActif());

		if (user.getRole() != null) {
			response.setRoleId(user.getRole().getId());
			response.setRoleNom(user.getRole().getNom());
		}

		return response;
	}
}