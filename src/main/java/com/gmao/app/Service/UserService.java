package com.gmao.app.Service;

import java.time.LocalDate;
import java.util.List;

import com.gmao.app.dto.UserCreateRequest;
import com.gmao.app.dto.UserResponse;
import com.gmao.app.dto.UserUpdateRequest;

public interface UserService {

    UserResponse create(UserCreateRequest request);

    UserResponse update(Long id, UserUpdateRequest request);

    UserResponse getById(Long id);

    List<UserResponse> getAll();

    List<UserResponse> findByRole(Long roleId);

    List<UserResponse> findByStatut(String statut);

    List<UserResponse> getEligibleUsers(LocalDate date, Long roleId);

    UserResponse changeStatus(Long id, String statut);

    UserResponse archive(Long id);

    void delete(Long id);
}