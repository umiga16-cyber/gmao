package com.gmao.app.Model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.gmao.app.Model.enums.MovementType;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "prs_mouvement")
public class PrsMouvement {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "prs_id", nullable = false)
	private Prs prs;

	@Enumerated(EnumType.STRING)
	@Column(name = "type", nullable = false, length = 10)
	private MovementType type;

	@Column(name = "quantite", nullable = false, precision = 19, scale = 3)
	private BigDecimal quantite;

	@Column(name = "origine", length = 100)
	private String origine;

	@Column(name = "date", nullable = false)
	private LocalDateTime date;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "intervention_id")
	private Intervention intervention;

	@PrePersist
	public void prePersist() {
		if (date == null) {
			date = LocalDateTime.now();
		}
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public Prs getPrs() {
		return prs;
	}

	public void setPrs(Prs prs) {
		this.prs = prs;
	}

	public MovementType getType() {
		return type;
	}

	public void setType(MovementType type) {
		this.type = type;
	}

	public BigDecimal getQuantite() {
		return quantite;
	}

	public void setQuantite(BigDecimal quantite) {
		this.quantite = quantite;
	}

	public String getOrigine() {
		return origine;
	}

	public void setOrigine(String origine) {
		this.origine = origine;
	}

	public LocalDateTime getDate() {
		return date;
	}

	public void setDate(LocalDateTime date) {
		this.date = date;
	}

	public Intervention getIntervention() {
		return intervention;
	}

	public void setIntervention(Intervention intervention) {
		this.intervention = intervention;
	}

	public PrsMouvement(Prs prs, MovementType type, BigDecimal quantite, String origine, LocalDateTime date,
			Intervention intervention) {
		super();
		this.prs = prs;
		this.type = type;
		this.quantite = quantite;
		this.origine = origine;
		this.date = date;
		this.intervention = intervention;
	}

	public PrsMouvement() {
		super();
 
	}
	
	
}
