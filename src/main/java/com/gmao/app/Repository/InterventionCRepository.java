package com.gmao.app.Repository;
import org.springframework.data.jpa.repository.JpaRepository;
import com.gmao.app.Model.InterventionClient;
import com.gmao.app.Model.Intervention;
import java.util.List;



public interface InterventionCRepository  extends JpaRepository<InterventionClient, Long> {
    List<InterventionClient> findByLibelleContainingIgnoreCase(String libelle);
    List<InterventionClient> findByTypeIgnoreCase(String type);
    List<InterventionClient> findByStatutIgnoreCase(String statut);
    List<InterventionClient> findByEquipementId(Long equipementId);
}
