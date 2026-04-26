package com.gmao.app.Repository;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.gmao.app.Model.Equipement;

public interface EquipementRepository extends JpaRepository<Equipement, Long> {

    Optional<Equipement> findByCode(String code);

    boolean existsByCode(String code);

    List<Equipement> findByTypeIgnoreCase(String type);

    List<Equipement> findByStatutIgnoreCase(String statut);

    List<Equipement> findByParentIsNull();

    List<Equipement> findByParentId(Long parentId);

    List<Equipement> findByDescriptionContainingIgnoreCase(String keyword);

    @Query("""
        select e from Equipement e
        where lower(e.description) like lower(concat('%', :keyword, '%'))
           or lower(e.code) like lower(concat('%', :keyword, '%'))
           or lower(e.numeroSerie) like lower(concat('%', :keyword, '%'))
    """)
    List<Equipement> search(@Param("keyword") String keyword);
    
    List<Equipement> findByCompanyId(Long companyId);
}