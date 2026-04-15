package com.gmao.app.Controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.gmao.app.Service.UserService;
 
import com.gmao.app.dto.UserCreateRequest;
import com.gmao.app.dto.UserResponse;
import com.gmao.app.dto.UserUpdateRequest;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService appUserService;

    public UserController(UserService appUserService) {
        this.appUserService = appUserService;
    }

    @PostMapping
    public ResponseEntity<UserResponse> create(@Valid @RequestBody UserCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(appUserService.create(request));
    }

    @PutMapping("/{id:\\d+}")
    public ResponseEntity<UserResponse> update(@PathVariable Long id,
                                                  @Valid @RequestBody UserUpdateRequest request) {
        return ResponseEntity.ok(appUserService.update(id, request));
    }

    @GetMapping("/{id:\\d+}")
    public ResponseEntity<UserResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(appUserService.getById(id));
    }

    @GetMapping
    public ResponseEntity<List<UserResponse>> getAll() {
        return ResponseEntity.ok(appUserService.getAll());
    }

    @GetMapping("/role/{roleId:\\d+}")
    public ResponseEntity<List<UserResponse>> findByRole(@PathVariable Long roleId) {
        return ResponseEntity.ok(appUserService.findByRole(roleId));
    }

    @GetMapping("/statut/{statut}")
    public ResponseEntity<List<UserResponse>> findByStatut(@PathVariable String statut) {
        return ResponseEntity.ok(appUserService.findByStatut(statut));
    }

    @GetMapping("/eligible")
    public ResponseEntity<List<UserResponse>> getEligibleUsers(@RequestParam LocalDate date,
                                                                  @RequestParam(required = false) Long roleId) {
        return ResponseEntity.ok(appUserService.getEligibleUsers(date, roleId));
    }

    @PatchMapping("/{id:\\d+}/status")
    public ResponseEntity<UserResponse> changeStatus(@PathVariable Long id,
                                                        @RequestParam String statut) {
        return ResponseEntity.ok(appUserService.changeStatus(id, statut));
    }

    @PatchMapping("/{id:\\d+}/archive")
    public ResponseEntity<UserResponse> archive(@PathVariable Long id) {
        return ResponseEntity.ok(appUserService.archive(id));
    }
}