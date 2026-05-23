package com.gmao.app.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.gmao.app.Model.User;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    List<User> findByRoleId(Long roleId);

    List<User> findByStatut(String statut);

    List<User> findByActifTrue();

    @Query(value = """
        SELECT r.NOM
        FROM USERS u
        JOIN ROLES r ON u.ROLE_ID = r.ROLE_ID
        WHERE u.EMAIL = :email
        """, nativeQuery = true)
    String findRoleNameByEmail(@Param("email") String email);

    @Query(value = """
        SELECT u.NOM
        FROM USERS u
        WHERE u.EMAIL = :email
        """, nativeQuery = true)
    String findNomByEmail(@Param("email") String email);
}