package com.gmao.app.restcontroller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.gmao.app.Service.CompanyService;
import com.gmao.app.dto.CompanyCreateRequest;
import com.gmao.app.dto.CompanyDetailResponse;
import com.gmao.app.dto.CompanyResponse;
import com.gmao.app.dto.CompanyUpdateRequest;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/companies")
public class CompanyController {

    private final CompanyService companyService;

    public CompanyController(CompanyService companyService) {
        this.companyService = companyService;
    }

    @PostMapping
    public ResponseEntity<CompanyResponse> create(@Valid @RequestBody CompanyCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(companyService.create(request));
    }

    @PutMapping("/{id:\\d+}")
    public ResponseEntity<CompanyResponse> update(@PathVariable Long id,
                                                  @RequestBody CompanyUpdateRequest request) {
        return ResponseEntity.ok(companyService.update(id, request));
    }

    @GetMapping("/{id:\\d+}")
    public ResponseEntity<CompanyResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(companyService.getById(id));
    }

    @GetMapping("/{id:\\d+}/detail")
    public ResponseEntity<CompanyDetailResponse> getDetail(@PathVariable Long id) {
        return ResponseEntity.ok(companyService.getDetail(id));
    }

    @GetMapping
    public ResponseEntity<List<CompanyResponse>> getAll() {
        return ResponseEntity.ok(companyService.getAll());
    }

    @DeleteMapping("/{id:\\d+}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        companyService.delete(id);
        return ResponseEntity.noContent().build();
    }
}