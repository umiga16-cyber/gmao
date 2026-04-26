package com.gmao.app.restcontroller;

import java.util.List;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import com.gmao.app.Service.EquipementService;
import com.gmao.app.dto.EquipementCreateRequest;
import com.gmao.app.dto.EquipementDetailResponse;
import com.gmao.app.dto.EquipementResponse;
import com.gmao.app.dto.EquipementTreeResponse;
import com.gmao.app.dto.EquipementUpdateRequest;

import org.springframework.ui.Model;

@RestController
@RequestMapping("/api/equipements")
public class EquipementController {

	private final EquipementService equipementService;


	@GetMapping("/company/{companyId:\\d+}")
	public ResponseEntity<List<EquipementResponse>> findByCompany(@PathVariable Long companyId) {
		return ResponseEntity.ok(equipementService.findByCompany(companyId));
	}

	public EquipementController(EquipementService equipementService) {
		this.equipementService = equipementService;
	
	}

	@PostMapping
	public ResponseEntity<EquipementResponse> create(@Valid @RequestBody EquipementCreateRequest request) {
		EquipementResponse response = equipementService.create(request);
		return ResponseEntity.status(HttpStatus.CREATED).body(response);
	}

	@PutMapping("/{id:\\d+}")
	public ResponseEntity<EquipementResponse> update(@PathVariable Long id,
			@Valid @RequestBody EquipementUpdateRequest request) {
		EquipementResponse response = equipementService.update(id, request);
		return ResponseEntity.ok(response);
	}

	@GetMapping("/{id:\\d+}")
	public ResponseEntity<EquipementResponse> getById(@PathVariable Long id) {
		EquipementResponse response = equipementService.getById(id);
		return ResponseEntity.ok(response);
	}

	@GetMapping
	public ResponseEntity<List<EquipementResponse>> getAll(Model model) {
		List<EquipementResponse> response = equipementService.getAll();
		return ResponseEntity.ok(response);
	}

	@DeleteMapping("/{id:\\d+}")
	public ResponseEntity<Void> delete(@PathVariable Long id) {
		equipementService.delete(id);
		return ResponseEntity.noContent().build();
	}

	@PatchMapping("/{id:\\d+}/archive")
	public ResponseEntity<Void> archive(@PathVariable Long id) {
		equipementService.archive(id);
		return ResponseEntity.noContent().build();
	}

	@PatchMapping("/{id:\\d+}/unarchive")
	public ResponseEntity<Void> unarchive(@PathVariable Long id) {
		equipementService.unarchive(id);
		return ResponseEntity.ok().build();
	}

	@PatchMapping("/{id:\\d+}/status")
	public ResponseEntity<EquipementResponse> changeStatus(@PathVariable Long id, @RequestParam String statut) {
		EquipementResponse response = equipementService.changeStatus(id, statut);
		return ResponseEntity.ok(response);
	}

	@GetMapping("/search")
	public ResponseEntity<List<EquipementResponse>> search(@RequestParam String keyword) {
		List<EquipementResponse> response = equipementService.search(keyword);
		return ResponseEntity.ok(response);
	}

	@GetMapping("/type/{type}")
	public ResponseEntity<List<EquipementResponse>> findByType(@PathVariable String type) {
		List<EquipementResponse> response = equipementService.findByType(type);
		return ResponseEntity.ok(response);
	}

	@GetMapping("/statut/{statut}")
	public ResponseEntity<List<EquipementResponse>> findByStatut(@PathVariable String statut) {
		List<EquipementResponse> response = equipementService.findByStatut(statut);
		return ResponseEntity.ok(response);
	}

	@GetMapping("/roots")
	public ResponseEntity<List<EquipementResponse>> findRoots() {
		List<EquipementResponse> response = equipementService.findRoots();
		return ResponseEntity.ok(response);
	}

	@GetMapping("/{parentId:\\d+}/children")
	public ResponseEntity<List<EquipementResponse>> findChildren(@PathVariable Long parentId) {
		List<EquipementResponse> response = equipementService.findChildren(parentId);
		return ResponseEntity.ok(response);
	}

	@PutMapping("/{childId:\\d+}/parent/{parentId:\\d+}")
	public ResponseEntity<EquipementResponse> assignParent(@PathVariable Long childId, @PathVariable Long parentId) {
		EquipementResponse response = equipementService.assignParent(childId, parentId);
		return ResponseEntity.ok(response);
	}

	@DeleteMapping("/{childId:\\d+}/parent")
	public ResponseEntity<EquipementResponse> detachParent(@PathVariable Long childId) {
		EquipementResponse response = equipementService.detachParent(childId);
		return ResponseEntity.ok(response);
	}

	@GetMapping("/tree")
	public ResponseEntity<List<EquipementTreeResponse>> getTree() {
		List<EquipementTreeResponse> response = equipementService.getTree();
		return ResponseEntity.ok(response);
	}

	@GetMapping("/{id:\\d+}/detail")
	public ResponseEntity<EquipementDetailResponse> getDetail(@PathVariable Long id) {
		EquipementDetailResponse response = equipementService.getDetail(id);
		return ResponseEntity.ok(response);
	}

	@GetMapping("/exists")
	public ResponseEntity<Boolean> existsByCode(@RequestParam String code) {
		boolean exists = equipementService.existsByCode(code);
		return ResponseEntity.ok(exists);
	}

	@GetMapping("/{id:\\d+}/can-delete")
	public ResponseEntity<Boolean> canBeDeleted(@PathVariable Long id) {
		boolean canDelete = equipementService.canBeDeleted(id);
		return ResponseEntity.ok(canDelete);
	}
}