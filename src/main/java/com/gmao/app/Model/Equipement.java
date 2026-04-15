package com.gmao.app.Model;

import java.time.LocalDate;
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

@Entity
@Table(name = "equipement")
public class Equipement {
	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "equipement_id")
    private Long id;

    @Column(name = "description", nullable = false, length = 200)
    private String description;

    @Column(name = "type", length = 80)
    private String type;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private Equipement parent;

    @Column(name = "statut", length = 30)
    private String statut;
    
    private String code;
    private String marque;
    private String modele;
    private String numeroSerie;
    private String localisation;
    private LocalDate dateInstallation;
    private LocalDate dateMiseEnService;
    private String criticite;
    private Boolean actif;
    private String commentaire;

    @JsonIgnore
    @OneToMany(mappedBy = "parent", fetch = FetchType.LAZY)
    private Set<Equipement> children = new HashSet<>();

    @JsonIgnore
    @OneToMany(mappedBy = "equipement", fetch = FetchType.LAZY)
    private Set<Intervention> interventions = new HashSet<>();

    @JsonIgnore
    @OneToMany(mappedBy = "equipement", fetch = FetchType.LAZY)
    private Set<Preventif> preventifs = new HashSet<>();

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}

	public Equipement getParent() {
		return parent;
	}

	public void setParent(Equipement parent) {
		this.parent = parent;
	}

	public String getStatut() {
		return statut;
	}

	public void setStatut(String statut) {
		this.statut = statut;
	}

	public Set<Equipement> getChildren() {
		return children;
	}

	public void setChildren(Set<Equipement> children) {
		this.children = children;
	}

	public Set<Intervention> getInterventions() {
		return interventions;
	}

	public void setInterventions(Set<Intervention> interventions) {
		this.interventions = interventions;
	}

	public Set<Preventif> getPreventifs() {
		return preventifs;
	}

	public void setPreventifs(Set<Preventif> preventifs) {
		this.preventifs = preventifs;
	}

	public String getCode() {
		return code;
	}

	public void setCode(String code) {
		this.code = code;
	}

	public String getMarque() {
		return marque;
	}

	public void setMarque(String marque) {
		this.marque = marque;
	}

	public String getModele() {
		return modele;
	}

	public void setModele(String modele) {
		this.modele = modele;
	}

	public String getNumeroSerie() {
		return numeroSerie;
	}

	public void setNumeroSerie(String numeroSerie) {
		this.numeroSerie = numeroSerie;
	}

	public String getLocalisation() {
		return localisation;
	}

	public void setLocalisation(String localisation) {
		this.localisation = localisation;
	}

	public LocalDate getDateInstallation() {
		return dateInstallation;
	}

	public void setDateInstallation(LocalDate dateInstallation) {
		this.dateInstallation = dateInstallation;
	}

	public LocalDate getDateMiseEnService() {
		return dateMiseEnService;
	}

	public void setDateMiseEnService(LocalDate dateMiseEnService) {
		this.dateMiseEnService = dateMiseEnService;
	}

	public String getCriticite() {
		return criticite;
	}

	public void setCriticite(String criticite) {
		this.criticite = criticite;
	}

	public Boolean getActif() {
		return actif;
	}

	public void setActif(Boolean actif) {
		this.actif = actif;
	}

	public String getCommentaire() {
		return commentaire;
	}

	public void setCommentaire(String commentaire) {
		this.commentaire = commentaire;
	}

	 

	public Equipement() {
		super();
	 
	}

	public Equipement(Long id, String description, String type, Equipement parent, String statut, String code,
			String marque, String modele, String numeroSerie, String localisation, LocalDate dateInstallation,
			LocalDate dateMiseEnService, String criticite, Boolean actif, String commentaire, Set<Equipement> children,
			Set<Intervention> interventions, Set<Preventif> preventifs) {
		super();
		this.id = id;
		this.description = description;
		this.type = type;
		this.parent = parent;
		this.statut = statut;
		this.code = code;
		this.marque = marque;
		this.modele = modele;
		this.numeroSerie = numeroSerie;
		this.localisation = localisation;
		this.dateMiseEnService = dateMiseEnService;
		this.criticite = criticite;
		this.actif = actif;
		this.commentaire = commentaire;
		this.children = children;
		this.interventions = interventions;
		this.preventifs = preventifs;
	}
    
    
}
