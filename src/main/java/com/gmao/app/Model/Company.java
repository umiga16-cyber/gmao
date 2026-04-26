package com.gmao.app.Model;

import com.gmao.app.Model.audit.BaseEntity;
import jakarta.persistence.*;

@Entity
@Table(name = "company")
public class Company extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(length = 255)
    private String address;

    @Column(length = 50)
    private String phone;

    @Column(length = 150)
    private String website;

    @Column(length = 150)
    private String email;

    private Integer employeesCount;

    @Column(length = 255)
    private String logoUrl;

    @Column(length = 100)
    private String city;

    @Column(length = 100)
    private String state;

    @Column(length = 30)
    private String zipCode;

    private boolean demo;

    private boolean firstWorkOrderCreated = false;

    private boolean invitedUsers = false;

    private boolean importedAssets = false;

    @OneToOne(mappedBy = "company", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private CompanySettings companySettings;

    public Company() {
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getWebsite() {
        return website;
    }

    public void setWebsite(String website) {
        this.website = website;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Integer getEmployeesCount() {
        return employeesCount;
    }

    public void setEmployeesCount(Integer employeesCount) {
        this.employeesCount = employeesCount;
    }

    public String getLogoUrl() {
        return logoUrl;
    }

    public void setLogoUrl(String logoUrl) {
        this.logoUrl = logoUrl;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getZipCode() {
        return zipCode;
    }

    public void setZipCode(String zipCode) {
        this.zipCode = zipCode;
    }

    public boolean isDemo() {
        return demo;
    }

    public void setDemo(boolean demo) {
        this.demo = demo;
    }

    public boolean isFirstWorkOrderCreated() {
        return firstWorkOrderCreated;
    }

    public void setFirstWorkOrderCreated(boolean firstWorkOrderCreated) {
        this.firstWorkOrderCreated = firstWorkOrderCreated;
    }

    public boolean isInvitedUsers() {
        return invitedUsers;
    }

    public void setInvitedUsers(boolean invitedUsers) {
        this.invitedUsers = invitedUsers;
    }

    public boolean isImportedAssets() {
        return importedAssets;
    }

    public void setImportedAssets(boolean importedAssets) {
        this.importedAssets = importedAssets;
    }

    public CompanySettings getCompanySettings() {
        return companySettings;
    }

    public void setCompanySettings(CompanySettings companySettings) {
        this.companySettings = companySettings;
    }
}