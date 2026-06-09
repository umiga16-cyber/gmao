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

    @Column(name = "code", nullable = false, unique = true, length = 50)
    private String code;

    @Column(name = "libelle", nullable = false, length = 200)
    private String libelle;

    @Column(name = "reference", length = 100)
    private String reference;

    @Column(name = "pmp", nullable = false, precision = 15, scale = 2)
    private BigDecimal pmp = BigDecimal.ZERO;

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

    // Constructores
    public Prs() {}

    public Prs(String code, String libelle, String reference, BigDecimal pmp, BigDecimal quantiteStock, BigDecimal seuilMini) {
        this.code = code;
        this.libelle = libelle;
        this.reference = reference;
        this.pmp = pmp;
        this.quantiteStock = quantiteStock;
        this.seuilMini = seuilMini;
    }

    // Getters y setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getLibelle() { return libelle; }
    public void setLibelle(String libelle) { this.libelle = libelle; }

    public String getReference() { return reference; }
    public void setReference(String reference) { this.reference = reference; }

    public BigDecimal getPmp() { return pmp; }
    public void setPmp(BigDecimal pmp) { this.pmp = pmp; }

    public BigDecimal getQuantiteStock() { return quantiteStock; }
    public void setQuantiteStock(BigDecimal quantiteStock) { this.quantiteStock = quantiteStock; }

    public BigDecimal getSeuilMini() { return seuilMini; }
    public void setSeuilMini(BigDecimal seuilMini) { this.seuilMini = seuilMini; }

    public Set<InterventionPrs> getInterventionPrs() { return interventionPrs; }
    public void setInterventionPrs(Set<InterventionPrs> interventionPrs) { this.interventionPrs = interventionPrs; }

    public Set<PrsMouvement> getMouvements() { return mouvements; }
    public void setMouvements(Set<PrsMouvement> mouvements) { this.mouvements = mouvements; }
}