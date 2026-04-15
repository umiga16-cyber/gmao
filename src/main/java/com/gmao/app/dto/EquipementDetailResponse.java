package com.gmao.app.dto;

import java.time.LocalDate;
import java.util.List;

public class EquipementDetailResponse {
    private Long id;
    private String code;
    private String description;
    private String type;
    private String marque;
    private String modele;
    private String numeroSerie;
    private String localisation;
    private String statut;
    private String criticite;
    private Boolean actif;
    private LocalDate dateInstallation;
    private LocalDate dateMiseEnService;
    private String commentaire;
    private Long parentId;
    private List<EquipementResponse> children;
	public Long getId() {
		return id;
	}
	public void setId(Long id) {
		this.id = id;
	}
	public String getCode() {
		return code;
	}
	public void setCode(String code) {
		this.code = code;
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
	public String getStatut() {
		return statut;
	}
	public void setStatut(String statut) {
		this.statut = statut;
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
	public String getCommentaire() {
		return commentaire;
	}
	public void setCommentaire(String commentaire) {
		this.commentaire = commentaire;
	}
	public Long getParentId() {
		return parentId;
	}
	public void setParentId(Long parentId) {
		this.parentId = parentId;
	}
	public List<EquipementResponse> getChildren() {
		return children;
	}
	public void setChildren(List<EquipementResponse> children) {
		this.children = children;
	}
    
}