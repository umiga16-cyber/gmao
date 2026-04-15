package com.gmao.app.Controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.gmao.app.Service.DisponibiliteService;
import com.gmao.app.dto.DisponibiliteCreateRequest;
import com.gmao.app.dto.DisponibiliteResponse;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/disponibilites")
public class DisponibiliteController {

    private final DisponibiliteService disponibiliteService;

    public DisponibiliteController(DisponibiliteService disponibiliteService) {
        this.disponibiliteService = disponibiliteService;
    }

    @PostMapping
    public ResponseEntity<DisponibiliteResponse> save(@Valid @RequestBody DisponibiliteCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(disponibiliteService.save(request));
    }

    @GetMapping("/user/{userId:\\d+}")
    public ResponseEntity<List<DisponibiliteResponse>> findByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(disponibiliteService.findByUser(userId));
    }

    @GetMapping("/date")
    public ResponseEntity<List<DisponibiliteResponse>> findByDate(@RequestParam LocalDate date) {
        return ResponseEntity.ok(disponibiliteService.findByDate(date));
    }
}