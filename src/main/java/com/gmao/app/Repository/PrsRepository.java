package com.gmao.app.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.gmao.app.Model.Prs;

public interface PrsRepository extends JpaRepository<Prs, Long> {

    @Query("select p from Prs p where p.quantiteStock <= p.seuilMini")
    List<Prs> findLowStock();
}