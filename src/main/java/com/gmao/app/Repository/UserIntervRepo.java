package com.gmao.app.Repository;

import com.gmao.app.Model.UserInterv;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

//@Repository
public interface UserIntervRepo {
//extends JpaRepository<UserInterv, Long> {
    
//    Optional<UserInterv> findByEmail(String email);
//    
//    List<UserInterv> findByStatut(UserInterv.Statut statut);
//    
//    @Query("SELECT COUNT(u) FROM UserInterv u WHERE u.statut = :statut")
//    Long countByStatut(@Param("statut") UserInterv.Statut statut);
//    
//    @Query("SELECT COUNT(u) FROM UserInterv u WHERE u.role = :role")
//    Long countByRole(@Param("role") UserInterv.Role role);
//    
//    @Query("SELECT COUNT(u) FROM UserInterv u")
//    Long countTotalUsers();
//    
//    List<UserInterv> findByRole(UserInterv.Role role);
}