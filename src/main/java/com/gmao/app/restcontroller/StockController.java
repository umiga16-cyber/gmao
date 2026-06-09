package com.gmao.app.restcontroller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.gmao.app.Service.PrsService;
import com.gmao.app.dto.PrsCreateRequest;
import com.gmao.app.dto.PrsImportDTO;
import com.gmao.app.dto.PrsResponse;
import com.gmao.app.dto.PrsUpdateRequest;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/stock")
public class StockController {

    private final PrsService prsService;

    public StockController(PrsService prsService) {
        this.prsService = prsService;
    }

    @PostMapping
    public ResponseEntity<PrsResponse> create(@Valid @RequestBody PrsCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(prsService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PrsResponse> update(@PathVariable Long id,
                                              @Valid @RequestBody PrsUpdateRequest request) {
        return ResponseEntity.ok(prsService.update(id, request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PrsResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(prsService.getById(id));
    }

    @GetMapping
    public ResponseEntity<List<PrsResponse>> getAll(@RequestParam(required = false) String keyword) {
        if (keyword != null && !keyword.isBlank()) {
            return ResponseEntity.ok(prsService.search(keyword));
        }
        return ResponseEntity.ok(prsService.getAll());
    }

    @GetMapping("/{id}/can-delete")
    public ResponseEntity<Boolean> canDelete(@PathVariable Long id) {
        return ResponseEntity.ok(prsService.canDelete(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        prsService.delete(id);
        return ResponseEntity.noContent().build();
    }
    @PostMapping("/import")
public ResponseEntity<?> importPrs(@RequestBody List<PrsImportDTO> prsList) {
    int imported = prsService.importPrs(prsList);
    return ResponseEntity.ok(Map.of("imported", imported));
}
}