package com.gmao.app.Service;

import java.util.List;

import com.gmao.app.dto.EquipementCreateRequest;
import com.gmao.app.dto.EquipementDetailResponse;
import com.gmao.app.dto.EquipementResponse;
import com.gmao.app.dto.EquipementTreeResponse;
import com.gmao.app.dto.EquipementUpdateRequest;

public interface EquipementService {

    EquipementResponse create(EquipementCreateRequest request);

    EquipementResponse update(Long id, EquipementUpdateRequest request);

    EquipementResponse getById(Long id);

    List<EquipementResponse> getAll();

    void delete(Long id);

    void archive(Long id);

    void unarchive(Long id);
    List<EquipementResponse> findByCompany(Long companyId);

    EquipementResponse changeStatus(Long id, String statut);

    List<EquipementResponse> search(String keyword);

    List<EquipementResponse> findByType(String type);

    List<EquipementResponse> findByStatut(String statut);

    List<EquipementResponse> findRoots();

    List<EquipementResponse> findChildren(Long parentId);

    EquipementResponse assignParent(Long childId, Long parentId);

    EquipementResponse detachParent(Long childId);

    List<EquipementTreeResponse> getTree();

    EquipementDetailResponse getDetail(Long id);

//    List<InterventionResponse> getInterventions(Long equipementId);

//    List<PreventifResponse> getPreventifs(Long equipementId);

    boolean existsByCode(String code);

    boolean canBeDeleted(Long id);
}