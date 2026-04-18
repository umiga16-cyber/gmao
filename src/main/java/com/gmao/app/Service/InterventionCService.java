package com.gmao.app.Service;

import com.gmao.app.Model.InterventionClient; 
import com.gmao.app.Repository.InterventionCRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class InterventionCService {

    @Autowired
    private InterventionCRepository interventionCRepository;

    // Obtener todas las intervenciones
    public List<InterventionClient> getAllInterventions() {
        return interventionCRepository.findAll();
    }

    // Obtener una intervención por ID
    public Optional<InterventionClient> getInterventionById(Long id) {
        return interventionCRepository.findById(id);
    }

    // Crear una nueva intervención
    public InterventionClient createIntervention(InterventionClient intervention) {
        return interventionCRepository.save(intervention);
    }

    // Actualizar una intervención existente
    public InterventionClient updateIntervention(Long id, InterventionClient interventionDetails) {
        InterventionClient intervention = interventionCRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Intervention not found"));

        intervention.setLibelle(interventionDetails.getLibelle());
        intervention.setType(interventionDetails.getType());
        intervention.setStatut(interventionDetails.getStatut());
        intervention.setDateDebut(interventionDetails.getDateDebut());
        intervention.setDateFin(interventionDetails.getDateFin());
        intervention.setEquipement(interventionDetails.getEquipement());
        intervention.setCommentaire(interventionDetails.getCommentaire());

        return interventionCRepository.save(intervention);
    }

    // Eliminar una intervención
    public void deleteIntervention(Long id) {
        InterventionClient intervention = interventionCRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Intervention not found"));

        interventionCRepository.delete(intervention);
    }
}