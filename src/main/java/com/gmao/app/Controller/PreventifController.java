package com.gmao.app.Controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.gmao.app.Model.enums.FrequencyType;
import com.gmao.app.Service.PreventifService;
import com.gmao.app.dto.PreventifCreateRequest;
import com.gmao.app.dto.PreventifDetailResponse;
import com.gmao.app.dto.PreventifResponse;
import com.gmao.app.dto.PreventifUpdateRequest;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/preventifs")
public class PreventifController {

    private final PreventifService preventifService;

    public PreventifController(PreventifService preventifService) {
        this.preventifService = preventifService;
    }

    @PostMapping
    public ResponseEntity<PreventifResponse> create(@Valid @RequestBody PreventifCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(preventifService.create(request));
    }

    @PutMapping("/{id:\\d+}")
    public ResponseEntity<PreventifResponse> update(@PathVariable Long id,
                                                    @Valid @RequestBody PreventifUpdateRequest request) {
        return ResponseEntity.ok(preventifService.update(id, request));
    }

    @GetMapping("/{id:\\d+}")
    public ResponseEntity<PreventifResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(preventifService.getById(id));
    }

    @GetMapping("/{id:\\d+}/detail")
    public ResponseEntity<PreventifDetailResponse> getDetail(@PathVariable Long id) {
        return ResponseEntity.ok(preventifService.getDetail(id));
    }

    @GetMapping
    public ResponseEntity<List<PreventifResponse>> getAll() {
        return ResponseEntity.ok(preventifService.getAll());
    }

    @DeleteMapping("/{id:\\d+}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        preventifService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id:\\d+}/status")
    public ResponseEntity<PreventifResponse> changeStatus(@PathVariable Long id,
                                                          @RequestParam String statut) {
        return ResponseEntity.ok(preventifService.changeStatus(id, statut));
    }

    @PatchMapping("/{id:\\d+}/archive")
    public ResponseEntity<PreventifResponse> archive(@PathVariable Long id) {
        return ResponseEntity.ok(preventifService.archive(id));
    }

    @GetMapping("/search")
    public ResponseEntity<List<PreventifResponse>> search(@RequestParam String keyword) {
        return ResponseEntity.ok(preventifService.search(keyword));
    }

    @GetMapping("/equipement/{equipementId:\\d+}")
    public ResponseEntity<List<PreventifResponse>> findByEquipement(@PathVariable Long equipementId) {
        return ResponseEntity.ok(preventifService.findByEquipement(equipementId));
    }

    @GetMapping("/statut/{statut}")
    public ResponseEntity<List<PreventifResponse>> findByStatut(@PathVariable String statut) {
        return ResponseEntity.ok(preventifService.findByStatut(statut));
    }

    @GetMapping("/type-frequence/{typeFrequence}")
    public ResponseEntity<List<PreventifResponse>> findByTypeFrequence(@PathVariable FrequencyType typeFrequence) {
        return ResponseEntity.ok(preventifService.findByTypeFrequence(typeFrequence));
    }

    @GetMapping("/due-before")
    public ResponseEntity<List<PreventifResponse>> findDueBefore(@RequestParam LocalDate date) {
        return ResponseEntity.ok(preventifService.findDueBefore(date));
    }
}