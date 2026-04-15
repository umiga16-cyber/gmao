package com.gmao.app.Model;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "prs")
public class Prs {
	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "prs_id")
    private Long id;

    @Column(name = "libelle", nullable = false, length = 200)
    private String libelle;

    @Column(name = "quantite_stock", nullable = false, precision = 19, scale = 3)
    private BigDecimal quantiteStock = BigDecimal.ZERO;

    @Column(name = "seuil_mini", nullable = false, precision = 19, scale = 3)
    private BigDecimal seuilMini = BigDecimal.ZERO;

    @JsonIgnore
    @OneToMany(mappedBy = "prs", fetch = FetchType.LAZY)
    private Set<InterventionPrs> interventionPrs = new HashSet<>();

    @JsonIgnore
    @OneToMany(mappedBy = "prs", fetch = FetchType.LAZY)
    private Set<PrsMouvement> mouvements = new HashSet<>();

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getLibelle() {
		return libelle;
	}

	public void setLibelle(String libelle) {
		this.libelle = libelle;
	}

	public BigDecimal getQuantiteStock() {
		return quantiteStock;
	}

	public void setQuantiteStock(BigDecimal quantiteStock) {
		this.quantiteStock = quantiteStock;
	}

	public BigDecimal getSeuilMini() {
		return seuilMini;
	}

	public void setSeuilMini(BigDecimal seuilMini) {
		this.seuilMini = seuilMini;
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

	public Prs() {
		super();
		 
	}

	public Prs(String libelle, BigDecimal quantiteStock, BigDecimal seuilMini, Set<InterventionPrs> interventionPrs,
			Set<PrsMouvement> mouvements) {
		super();
		this.libelle = libelle;
		this.quantiteStock = quantiteStock;
		this.seuilMini = seuilMini;
		this.interventionPrs = interventionPrs;
		this.mouvements = mouvements;
	}
    
    
}
