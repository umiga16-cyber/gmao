package com.gmao.app.Model;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.gmao.app.Model.enums.FrequencyType;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
@Table(name = "preventif")
public class Preventif {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "prev_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "equipement_id", nullable = false)
    private Equipement equipement;

    @Column(name = "frequence", nullable = false)
    private Integer frequence;

    @Enumerated(EnumType.STRING)
    @Column(name = "type_frequence", nullable = false, length = 20)
    private FrequencyType typeFrequence;

    @Column(name = "prochaine_date")
    private LocalDate prochaineDate;

    @Lob
    @Column(name = "operations")
    private String operations;

    @Column(name = "horizon")
    private Integer horizon;

    @Column(name = "statut", length = 30)
    private String statut;

    @JsonIgnore
    @OneToMany(mappedBy = "preventif", fetch = FetchType.LAZY)
    private Set<Intervention> interventions = new HashSet<>();

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public Equipement getEquipement() {
		return equipement;
	}

	public void setEquipement(Equipement equipement) {
		this.equipement = equipement;
	}

	public Integer getFrequence() {
		return frequence;
	}

	public void setFrequence(Integer frequence) {
		this.frequence = frequence;
	}

	public FrequencyType getTypeFrequence() {
		return typeFrequence;
	}

	public void setTypeFrequence(FrequencyType typeFrequence) {
		this.typeFrequence = typeFrequence;
	}

	public LocalDate getProchaineDate() {
		return prochaineDate;
	}

	public void setProchaineDate(LocalDate prochaineDate) {
		this.prochaineDate = prochaineDate;
	}

	public String getOperations() {
		return operations;
	}

	public void setOperations(String operations) {
		this.operations = operations;
	}

	public Integer getHorizon() {
		return horizon;
	}

	public void setHorizon(Integer horizon) {
		this.horizon = horizon;
	}

	public String getStatut() {
		return statut;
	}

	public void setStatut(String statut) {
		this.statut = statut;
	}

	public Set<Intervention> getInterventions() {
		return interventions;
	}

	public void setInterventions(Set<Intervention> interventions) {
		this.interventions = interventions;
	}

	public Preventif() {
		super();
		 
	}

	public Preventif(Equipement equipement, Integer frequence, FrequencyType typeFrequence, LocalDate prochaineDate,
			String operations, Integer horizon, String statut, Set<Intervention> interventions) {
		super();
		this.equipement = equipement;
		this.frequence = frequence;
		this.typeFrequence = typeFrequence;
		this.prochaineDate = prochaineDate;
		this.operations = operations;
		this.horizon = horizon;
		this.statut = statut;
		this.interventions = interventions;
	}
    
    
}