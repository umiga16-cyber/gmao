package com.gmao.app.Model;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(name = "intervention_prs", uniqueConstraints = {
        @UniqueConstraint(name = "uk_intervention_prs", columnNames = {"intervention_id", "prs_id"})
})
public class InterventionPrs {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "intervention_id", nullable = false)
    private Intervention intervention;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "prs_id", nullable = false)
    private Prs prs;

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public Intervention getIntervention() {
		return intervention;
	}

	public void setIntervention(Intervention intervention) {
		this.intervention = intervention;
	}

	public Prs getPrs() {
		return prs;
	}

	public void setPrs(Prs prs) {
		this.prs = prs;
	}
    
    
}