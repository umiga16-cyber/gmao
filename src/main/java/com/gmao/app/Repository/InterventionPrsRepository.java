package com.gmao.app.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.gmao.app.Model.InterventionPrs;

public interface InterventionPrsRepository extends JpaRepository<InterventionPrs, Long> {
	List<InterventionPrs> findByInterventionId(Long interventionId);

	List<InterventionPrs> findByPrsId(Long prsId);

	boolean existsByPrsId(Long prsId);

	long countByPrsId(Long prsId);

	Optional<InterventionPrs> findByInterventionIdAndPrsId(Long interventionId, Long prsId);

	boolean existsByInterventionId(Long interventionId);

	@Modifying
	@Query("delete from InterventionPrs ip where ip.intervention.id = :interventionId")
	void deleteByInterventionId(@Param("interventionId") Long interventionId);
}