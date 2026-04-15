package com.gmao.app.Controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.gmao.app.Service.InterventionService;
import com.gmao.app.dto.InterventionCreateRequest;
import com.gmao.app.dto.InterventionDetailResponse;
import com.gmao.app.dto.InterventionResponse;
import com.gmao.app.dto.InterventionUpdateRequest;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/interventions")
public class InterventionController {

    private final InterventionService interventionService;

    public InterventionController(InterventionService interventionService) {
        this.interventionService = interventionService;
    }

    @PostMapping
    public ResponseEntity<InterventionResponse> create(@Valid @RequestBody InterventionCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(interventionService.create(request));
    }

    @PutMapping("/{id:\\d+}")
    public ResponseEntity<InterventionResponse> update(@PathVariable Long id,
                                                       @Valid @RequestBody InterventionUpdateRequest request) {
        return ResponseEntity.ok(interventionService.update(id, request));
    }

    @GetMapping("/{id:\\d+}")
    public ResponseEntity<InterventionResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(interventionService.getById(id));
    }

    @GetMapping("/{id:\\d+}/detail")
    public ResponseEntity<InterventionDetailResponse> getDetail(@PathVariable Long id) {
        return ResponseEntity.ok(interventionService.getDetail(id));
    }

    @GetMapping
    public ResponseEntity<List<InterventionResponse>> getAll() {
        return ResponseEntity.ok(interventionService.getAll());
    }

    @DeleteMapping("/{id:\\d+}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        interventionService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id:\\d+}/status")
    public ResponseEntity<InterventionResponse> changeStatus(@PathVariable Long id,
                                                             @RequestParam String statut) {
        return ResponseEntity.ok(interventionService.changeStatus(id, statut));
    }

    @GetMapping("/search")
    public ResponseEntity<List<InterventionResponse>> search(@RequestParam String keyword) {
        return ResponseEntity.ok(interventionService.search(keyword));
    }

    @GetMapping("/equipement/{equipementId:\\d+}")
    public ResponseEntity<List<InterventionResponse>> findByEquipement(@PathVariable Long equipementId) {
        return ResponseEntity.ok(interventionService.findByEquipement(equipementId));
    }

    @GetMapping("/statut/{statut}")
    public ResponseEntity<List<InterventionResponse>> findByStatut(@PathVariable String statut) {
        return ResponseEntity.ok(interventionService.findByStatut(statut));
    }

    @GetMapping("/created-by/{createdById:\\d+}")
    public ResponseEntity<List<InterventionResponse>> findByCreatedBy(@PathVariable Long createdById) {
        return ResponseEntity.ok(interventionService.findByCreatedBy(createdById));
    }

    @GetMapping("/preventif/{preventifId:\\d+}")
    public ResponseEntity<List<InterventionResponse>> findByPreventif(@PathVariable Long preventifId) {
        return ResponseEntity.ok(interventionService.findByPreventif(preventifId));
    }
}