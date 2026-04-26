package com.gmao.app.restcontroller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.gmao.app.Service.UserService;
import com.gmao.app.dto.UserCreateRequest;
import com.gmao.app.dto.UserResponse;
import com.gmao.app.dto.UserUpdateRequest;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping
    public ResponseEntity<UserResponse> create(@Valid @RequestBody UserCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.create(request));
    }

    @PutMapping("/{id:\\d+}")
    public ResponseEntity<UserResponse> update(@PathVariable Long id,
                                               @Valid @RequestBody UserUpdateRequest request) {
        return ResponseEntity.ok(userService.update(id, request));
    }

    @GetMapping("/{id:\\d+}")
    public ResponseEntity<UserResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getById(id));
    }

    @GetMapping
    public ResponseEntity<List<UserResponse>> getAll() {
        return ResponseEntity.ok(userService.getAll());
    }

    @GetMapping("/role/{roleId:\\d+}")
    public ResponseEntity<List<UserResponse>> findByRole(@PathVariable Long roleId) {
        return ResponseEntity.ok(userService.findByRole(roleId));
    }

    @GetMapping("/statut/{statut}")
    public ResponseEntity<List<UserResponse>> findByStatut(@PathVariable String statut) {
        return ResponseEntity.ok(userService.findByStatut(statut));
    }

    @GetMapping("/eligible")
    public ResponseEntity<List<UserResponse>> getEligibleUsers(@RequestParam LocalDate date,
                                                               @RequestParam(required = false) Long roleId) {
        return ResponseEntity.ok(userService.getEligibleUsers(date, roleId));
    }

    @PatchMapping("/{id:\\d+}/status")
    public ResponseEntity<UserResponse> changeStatus(@PathVariable Long id,
                                                     @RequestParam String statut) {
        return ResponseEntity.ok(userService.changeStatus(id, statut));
    }

    @PatchMapping("/{id:\\d+}/archive")
    public ResponseEntity<UserResponse> archive(@PathVariable Long id) {
        return ResponseEntity.ok(userService.archive(id));
    }

    @DeleteMapping("/{id:\\d+}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        userService.delete(id);
        return ResponseEntity.noContent().build();
    }
}