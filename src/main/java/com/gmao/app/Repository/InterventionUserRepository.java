package com.gmao.app.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.gmao.app.Model.InterventionUser;

public interface InterventionUserRepository extends JpaRepository<InterventionUser, Long> {
    List<InterventionUser> findByInterventionId(Long interventionId);
    List<InterventionUser> findByUserId(Long userId);
}
