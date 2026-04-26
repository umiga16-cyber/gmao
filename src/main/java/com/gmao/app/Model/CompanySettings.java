package com.gmao.app.Model;

import jakarta.persistence.*;

@Entity
@Table(name = "company_settings")
public class CompanySettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false, unique = true)
    private Company company;

    @OneToOne(mappedBy = "companySettings", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private GeneralPreferences generalPreferences;

    public CompanySettings() {
    }

    public Long getId() {
        return id;
    }

    public Company getCompany() {
        return company;
    }

    public void setCompany(Company company) {
        this.company = company;
    }

    public GeneralPreferences getGeneralPreferences() {
        return generalPreferences;
    }

    public void setGeneralPreferences(GeneralPreferences generalPreferences) {
        this.generalPreferences = generalPreferences;
    }
}