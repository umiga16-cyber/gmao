package com.gmao.app.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import com.gmao.app.Model.Intervention;

public interface InterventionRepository extends JpaRepository<Intervention, Long>, JpaSpecificationExecutor<Intervention> {
    List<Intervention> findByEquipementId(Long equipementId);
    List<Intervention> findByStatut(String statut);
    List<Intervention> findByCreatedById(Long createdById);
}