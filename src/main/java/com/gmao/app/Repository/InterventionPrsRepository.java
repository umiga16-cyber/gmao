package com.gmao.app.Repository;


import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.gmao.app.Model.InterventionPrs;

public interface InterventionPrsRepository extends JpaRepository<InterventionPrs, Long> {
    List<InterventionPrs> findByInterventionId(Long interventionId);
    List<InterventionPrs> findByPrsId(Long prsId);
}