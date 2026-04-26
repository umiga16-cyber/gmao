package com.gmao.app.Service;

import java.util.List;

import com.gmao.app.dto.CompanyCreateRequest;
import com.gmao.app.dto.CompanyDetailResponse;
import com.gmao.app.dto.CompanyResponse;
import com.gmao.app.dto.CompanyUpdateRequest;

public interface CompanyService {

    CompanyResponse create(CompanyCreateRequest request);

    CompanyResponse update(Long id, CompanyUpdateRequest request);

    CompanyResponse getById(Long id);

    CompanyDetailResponse getDetail(Long id);

    List<CompanyResponse> getAll();

    void delete(Long id);
}