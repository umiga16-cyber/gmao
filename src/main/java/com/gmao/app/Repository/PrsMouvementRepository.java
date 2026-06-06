package com.gmao.app.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.gmao.app.Model.PrsMouvement;

public interface PrsMouvementRepository extends JpaRepository<PrsMouvement, Long> {
	List<PrsMouvement> findByPrsId(Long prsId);

	List<PrsMouvement> findByInterventionId(Long interventionId);

	boolean existsByPrsId(Long prsId);

	long countByPrsId(Long prsId);

	List<PrsMouvement> findByPrsIdOrderByDateDesc(Long prsId);

	boolean existsByInterventionId(Long interventionId);

	long countByInterventionId(Long interventionId);
	
	
	@Modifying(clearAutomatically = true, flushAutomatically = true)
	@Query("delete from PrsMouvement m where m.intervention.id = :interventionId")
	void deleteByInterventionId(@Param("interventionId") Long interventionId);
}