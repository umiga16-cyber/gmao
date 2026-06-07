package com.gmao.app.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import com.gmao.app.Model.DocumentoEquipo;

public interface DocumentoEquipoRepository extends JpaRepository<DocumentoEquipo, Long> {
    List<DocumentoEquipo> findByEquipementIdOrderByFechaSubidaDesc(Long equipementId);
    void deleteByEquipementId(Long equipementId); // opcional
}
