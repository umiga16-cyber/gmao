package com.gmao.app.Service;

import java.util.List;

import com.gmao.app.dto.InterventionCreateRequest;
import com.gmao.app.dto.InterventionDetailResponse;
import com.gmao.app.dto.InterventionResponse;
import com.gmao.app.dto.InterventionUpdateRequest;

public interface InterventionService {

    InterventionResponse create(InterventionCreateRequest request);

    InterventionResponse update(Long id, InterventionUpdateRequest request);

    InterventionResponse getById(Long id);

    InterventionDetailResponse getDetail(Long id);

    List<InterventionResponse> getAll();

    void delete(Long id);

    InterventionResponse changeStatus(Long id, String statut);

    List<InterventionResponse> search(String keyword);

    List<InterventionResponse> findByEquipement(Long equipementId);

    List<InterventionResponse> findByStatut(String statut);

    List<InterventionResponse> findByCreatedBy(Long createdById);

    List<InterventionResponse> findByPreventif(Long preventifId);
}