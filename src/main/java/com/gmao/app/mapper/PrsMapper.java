package com.gmao.app.mapper;

import org.springframework.stereotype.Component;

import com.gmao.app.Model.Prs;
import com.gmao.app.dto.PrsResponse;

@Component
public class PrsMapper {

    public PrsResponse toResponse(Prs prs, long mouvementsCount, long interventionsCount, boolean canDelete) {
        PrsResponse response = new PrsResponse();
        response.setId(prs.getId());
        response.setCode(prs.getCode());               // 👈 nuevo
        response.setLibelle(prs.getLibelle());
        response.setReference(prs.getReference());     // 👈 nuevo
        response.setPmp(prs.getPmp());                 // 👈 nuevo
        response.setQuantiteStock(prs.getQuantiteStock());
        response.setSeuilMini(prs.getSeuilMini());
        response.setMouvementsCount(mouvementsCount);
        response.setInterventionsCount(interventionsCount);
        response.setCanDelete(canDelete);
        return response;
    }
}