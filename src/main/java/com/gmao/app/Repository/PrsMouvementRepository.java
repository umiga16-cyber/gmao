package com.gmao.app.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.gmao.app.Model.PrsMouvement;

public interface PrsMouvementRepository extends JpaRepository<PrsMouvement, Long> {
    List<PrsMouvement> findByPrsId(Long prsId);
    List<PrsMouvement> findByInterventionId(Long interventionId);
}