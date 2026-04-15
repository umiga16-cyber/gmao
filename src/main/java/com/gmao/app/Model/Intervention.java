package com.gmao.app.Model;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "intervention")
public class Intervention {
	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "intervention_id")
    private Long id;

    @Column(name = "libele", nullable = false, length = 200)
    private String libele;

    @Column(name = "type", length = 80)
    private String type;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "equipement_id", nullable = false)
    private Equipement equipement;

    @Column(name = "statut", length = 30)
    private String statut;

    @Column(name = "date_debut")
    private LocalDateTime dateDebut;

    @Column(name = "date_fin")
    private LocalDateTime dateFin;

    @Lob
    @Column(name = "commentaire")
    private String commentaire;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prev_id")
    private Preventif preventif;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @JsonIgnore
    @OneToMany(mappedBy = "intervention", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<InterventionUser> interventionUsers = new HashSet<>();

    @JsonIgnore
    @OneToMany(mappedBy = "intervention", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<InterventionPrs> interventionPrs = new HashSet<>();

    @JsonIgnore
    @OneToMany(mappedBy = "intervention", fetch = FetchType.LAZY)
    private Set<PrsMouvement> mouvements = new HashSet<>();

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getLibele() {
		return libele;
	}

	public void setLibele(String libele) {
		this.libele = libele;
	}

	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}

	public Equipement getEquipement() {
		return equipement;
	}

	public void setEquipement(Equipement equipement) {
		this.equipement = equipement;
	}

	public String getStatut() {
		return statut;
	}

	public void setStatut(String statut) {
		this.statut = statut;
	}

	public LocalDateTime getDateDebut() {
		return dateDebut;
	}

	public void setDateDebut(LocalDateTime dateDebut) {
		this.dateDebut = dateDebut;
	}

	public LocalDateTime getDateFin() {
		return dateFin;
	}

	public void setDateFin(LocalDateTime dateFin) {
		this.dateFin = dateFin;
	}

	public String getCommentaire() {
		return commentaire;
	}

	public void setCommentaire(String commentaire) {
		this.commentaire = commentaire;
	}

	public Preventif getPreventif() {
		return preventif;
	}

	public void setPreventif(Preventif preventif) {
		this.preventif = preventif;
	}

	public User getCreatedBy() {
		return createdBy;
	}

	public void setCreatedBy(User createdBy) {
		this.createdBy = createdBy;
	}

	public Set<InterventionUser> getInterventionUsers() {
		return interventionUsers;
	}

	public void setInterventionUsers(Set<InterventionUser> interventionUsers) {
		this.interventionUsers = interventionUsers;
	}

	public Set<InterventionPrs> getInterventionPrs() {
		return interventionPrs;
	}

	public void setInterventionPrs(Set<InterventionPrs> interventionPrs) {
		this.interventionPrs = interventionPrs;
	}

	public Set<PrsMouvement> getMouvements() {
		return mouvements;
	}

	public void setMouvements(Set<PrsMouvement> mouvements) {
		this.mouvements = mouvements;
	}

	public Intervention() {
		super();
	 
	}

	public Intervention(String libele, String type, Equipement equipement, String statut, LocalDateTime dateDebut,
			LocalDateTime dateFin, String commentaire, Preventif preventif, User createdBy,
			Set<InterventionUser> interventionUsers, Set<InterventionPrs> interventionPrs,
			Set<PrsMouvement> mouvements) {
		super();
		this.libele = libele;
		this.type = type;
		this.equipement = equipement;
		this.statut = statut;
		this.dateDebut = dateDebut;
		this.dateFin = dateFin;
		this.commentaire = commentaire;
		this.preventif = preventif;
		this.createdBy = createdBy;
		this.interventionUsers = interventionUsers;
		this.interventionPrs = interventionPrs;
		this.mouvements = mouvements;
	}
    
    
}
