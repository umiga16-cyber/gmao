package com.gmao.app.Service;

import java.util.List;

import com.gmao.app.dto.PrsCreateRequest;
import com.gmao.app.dto.PrsImportDTO;
import com.gmao.app.dto.PrsResponse;
import com.gmao.app.dto.PrsUpdateRequest;

public interface PrsService {

    PrsResponse create(PrsCreateRequest request);

    PrsResponse update(Long id, PrsUpdateRequest request);

    PrsResponse getById(Long id);

    List<PrsResponse> getAll();

    List<PrsResponse> search(String keyword);

    void delete(Long id);

    boolean canDelete(Long id);

    int importPrs(List<PrsImportDTO> prsList);
}