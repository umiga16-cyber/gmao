package com.gmao.app.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.gmao.app.Model.InterventionPrs;

public interface InterventionPrsRepository extends JpaRepository<InterventionPrs, Long> {
	List<InterventionPrs> findByInterventionId(Long interventionId);

	List<InterventionPrs> findByPrsId(Long prsId);

	boolean existsByPrsId(Long prsId);

	long countByPrsId(Long prsId);

	Optional<InterventionPrs> findByInterventionIdAndPrsId(Long interventionId, Long prsId);

	boolean existsByInterventionId(Long interventionId);

	void deleteByInterventionId(Long interventionId);
}