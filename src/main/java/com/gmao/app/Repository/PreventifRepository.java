package com.gmao.app.Repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.gmao.app.Model.Preventif;
import com.gmao.app.Model.enums.FrequencyType;

public interface PreventifRepository extends JpaRepository<Preventif, Long> {

    List<Preventif> findByEquipementId(Long equipementId);

    List<Preventif> findByStatut(String statut);

    List<Preventif> findByTypeFrequence(FrequencyType typeFrequence);

    List<Preventif> findByProchaineDateBefore(LocalDate date);
}