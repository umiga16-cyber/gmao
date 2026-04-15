package com.gmao.app.Service;

import java.time.LocalDate;
import java.util.List;

import com.gmao.app.Model.enums.FrequencyType;
import com.gmao.app.dto.PreventifCreateRequest;
import com.gmao.app.dto.PreventifDetailResponse;
import com.gmao.app.dto.PreventifResponse;
import com.gmao.app.dto.PreventifUpdateRequest;

public interface PreventifService {

    PreventifResponse create(PreventifCreateRequest request);

    PreventifResponse update(Long id, PreventifUpdateRequest request);

    PreventifResponse getById(Long id);

    PreventifDetailResponse getDetail(Long id);

    List<PreventifResponse> getAll();

    void delete(Long id);

    PreventifResponse changeStatus(Long id, String statut);

    PreventifResponse archive(Long id);

    List<PreventifResponse> search(String keyword);

    List<PreventifResponse> findByEquipement(Long equipementId);

    List<PreventifResponse> findByStatut(String statut);

    List<PreventifResponse> findByTypeFrequence(FrequencyType typeFrequence);

    List<PreventifResponse> findDueBefore(LocalDate date);
}