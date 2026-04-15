package com.gmao.app.Repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.gmao.app.Model.Disponibilite;

public interface DisponibiliteRepository extends JpaRepository<Disponibilite, Long> {
    List<Disponibilite> findByUserId(Long userId);
    List<Disponibilite> findByDate(LocalDate date);
    boolean existsByUserIdAndDate(Long userId, LocalDate date);
}