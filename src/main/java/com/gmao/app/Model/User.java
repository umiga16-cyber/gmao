package com.gmao.app.Model;

import java.util.HashSet;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "users")
public class User {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "user_id")
	private Long id;

	@Column(name = "nom", nullable = false)
	@NotBlank(message = "El nombre es obligatorio")
	private String nom;

	@Column(nullable = false, unique = true)
	@NotBlank(message = "El email es obligatorio")
	@Email(message = "Email inválido")
	private String email;

	@Column(nullable = false)
	@NotBlank(message = "La contraseña es obligatoria")
	@Size(min = 6, message = "La contraseña debe tener al menos 6 caracteres")
	private String password;

	@Column(name = "statut")
	private String statut = "ACTIF";

	@ManyToOne(fetch = FetchType.EAGER)
	@JoinColumn(name = "role_id")
	private Role role;
	@Column(name = "actif")
	private Boolean actif = Boolean.TRUE;
	@JsonIgnore
	@OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
	private Set<Disponibilite> disponibilites = new HashSet<>();

	@JsonIgnore
	@OneToMany(mappedBy = "createdBy", fetch = FetchType.LAZY)
	private Set<Intervention> interventionsCreated = new HashSet<>();

	public User() {
	}

	public Boolean getActif() {
		return actif;
	}

	public void setActif(Boolean actif) {
		this.actif = actif;
	}

	 

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getNom() {
		return nom;
	}

	public void setNom(String nom) {
		this.nom = nom;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public String getStatut() {
		return statut;
	}

	public void setStatut(String statut) {
		this.statut = statut;
	}

	public Role getRole() {
		return role;
	}

	public void setRole(Role role) {
		this.role = role;
	}

	public Set<Disponibilite> getDisponibilites() {
		return disponibilites;
	}

	public void setDisponibilites(Set<Disponibilite> disponibilites) {
		this.disponibilites = disponibilites;
	}

	public Set<Intervention> getInterventionsCreated() {
		return interventionsCreated;
	}

	public void setInterventionsCreated(Set<Intervention> interventionsCreated) {
		this.interventionsCreated = interventionsCreated;
	}

	public User(@NotBlank(message = "El nombre es obligatorio") String nom,
			@NotBlank(message = "El email es obligatorio") @Email(message = "Email inválido") String email,
			@NotBlank(message = "La contraseña es obligatoria") @Size(min = 6, message = "La contraseña debe tener al menos 6 caracteres") String password,
			String statut, Role role, Boolean actif, Set<Disponibilite> disponibilites,
			Set<Intervention> interventionsCreated) {
		super();
		this.nom = nom;
		this.email = email;
		this.password = password;
		this.statut = statut;
		this.role = role;
		this.actif = actif;
		this.disponibilites = disponibilites;
		this.interventionsCreated = interventionsCreated;
	}

	 

}