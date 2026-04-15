package com.gmao.app.Service;

import java.util.List;

import com.gmao.app.dto.RoleCreateRequest;
import com.gmao.app.dto.RoleResponse;

public interface RoleService {
    RoleResponse create(RoleCreateRequest request);
    List<RoleResponse> getAll();
}