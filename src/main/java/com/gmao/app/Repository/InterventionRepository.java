package com.gmao.app.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.gmao.app.Model.Intervention;

public interface InterventionRepository extends JpaRepository<Intervention, Long> {

    List<Intervention> findByEquipementId(Long equipementId);

    List<Intervention> findByStatutIgnoreCase(String statut);

    List<Intervention> findByCreatedById(Long createdById);

    List<Intervention> findByPreventifId(Long preventifId);

   
}