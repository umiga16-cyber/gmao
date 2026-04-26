package com.gmao.app.Model;

import java.time.ZoneId;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.gmao.app.Model.enums.BusinessType;
import com.gmao.app.Model.enums.DateFormat;
import com.gmao.app.Model.enums.Language;

import jakarta.persistence.*;

@Entity
@Table(name = "general_preferences")
public class GeneralPreferences {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    private Language language = Language.EN;

    @Enumerated(EnumType.STRING)
    private DateFormat dateFormat = DateFormat.MMDDYY;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "currency_id")
    private Currency currency;

    @Enumerated(EnumType.STRING)
    private BusinessType businessType = BusinessType.GENERAL_ASSET_MANAGEMENT;

    @Column(nullable = false)
    private String timeZone = ZoneId.systemDefault().getId();

    private boolean autoAssignWorkOrders;
    private boolean autoAssignRequests;
    private boolean disableClosedWorkOrdersNotif;
    private boolean askFeedBackOnWOClosed = true;
    private boolean laborCostInTotalCost = true;
    private boolean woUpdateForRequesters = true;
    private boolean simplifiedWorkOrder;
    private int daysBeforePrevMaintNotification = 1;

    @Column(nullable = false, length = 5)
    private String csvSeparator = ",";

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_settings_id", nullable = false, unique = true)
    @JsonIgnore
    private CompanySettings companySettings;

    public GeneralPreferences() {
    }

    public Long getId() {
        return id;
    }

    public Language getLanguage() {
        return language;
    }

    public void setLanguage(Language language) {
        this.language = language;
    }

    public DateFormat getDateFormat() {
        return dateFormat;
    }

    public void setDateFormat(DateFormat dateFormat) {
        this.dateFormat = dateFormat;
    }

    public Currency getCurrency() {
        return currency;
    }

    public void setCurrency(Currency currency) {
        this.currency = currency;
    }

    public BusinessType getBusinessType() {
        return businessType;
    }

    public void setBusinessType(BusinessType businessType) {
        this.businessType = businessType;
    }

    public String getTimeZone() {
        return timeZone;
    }

    public void setTimeZone(String timeZone) {
        this.timeZone = timeZone;
    }

    public boolean isAutoAssignWorkOrders() {
        return autoAssignWorkOrders;
    }

    public void setAutoAssignWorkOrders(boolean autoAssignWorkOrders) {
        this.autoAssignWorkOrders = autoAssignWorkOrders;
    }

    public boolean isAutoAssignRequests() {
        return autoAssignRequests;
    }

    public void setAutoAssignRequests(boolean autoAssignRequests) {
        this.autoAssignRequests = autoAssignRequests;
    }

    public boolean isDisableClosedWorkOrdersNotif() {
        return disableClosedWorkOrdersNotif;
    }

    public void setDisableClosedWorkOrdersNotif(boolean disableClosedWorkOrdersNotif) {
        this.disableClosedWorkOrdersNotif = disableClosedWorkOrdersNotif;
    }

    public boolean isAskFeedBackOnWOClosed() {
        return askFeedBackOnWOClosed;
    }

    public void setAskFeedBackOnWOClosed(boolean askFeedBackOnWOClosed) {
        this.askFeedBackOnWOClosed = askFeedBackOnWOClosed;
    }

    public boolean isLaborCostInTotalCost() {
        return laborCostInTotalCost;
    }

    public void setLaborCostInTotalCost(boolean laborCostInTotalCost) {
        this.laborCostInTotalCost = laborCostInTotalCost;
    }

    public boolean isWoUpdateForRequesters() {
        return woUpdateForRequesters;
    }

    public void setWoUpdateForRequesters(boolean woUpdateForRequesters) {
        this.woUpdateForRequesters = woUpdateForRequesters;
    }

    public boolean isSimplifiedWorkOrder() {
        return simplifiedWorkOrder;
    }

    public void setSimplifiedWorkOrder(boolean simplifiedWorkOrder) {
        this.simplifiedWorkOrder = simplifiedWorkOrder;
    }

    public int getDaysBeforePrevMaintNotification() {
        return daysBeforePrevMaintNotification;
    }

    public void setDaysBeforePrevMaintNotification(int daysBeforePrevMaintNotification) {
        this.daysBeforePrevMaintNotification = daysBeforePrevMaintNotification;
    }

    public String getCsvSeparator() {
        return csvSeparator;
    }

    public void setCsvSeparator(String csvSeparator) {
        this.csvSeparator = csvSeparator;
    }

    public CompanySettings getCompanySettings() {
        return companySettings;
    }

    public void setCompanySettings(CompanySettings companySettings) {
        this.companySettings = companySettings;
    }
}