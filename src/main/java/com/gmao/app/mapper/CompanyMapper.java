package com.gmao.app.mapper;

import org.springframework.stereotype.Component;

import com.gmao.app.Model.Company;
import com.gmao.app.Model.GeneralPreferences;
import com.gmao.app.dto.CompanyDetailResponse;
import com.gmao.app.dto.CompanyResponse;

@Component
public class CompanyMapper {

    public CompanyResponse mapToResponse(Company company) {
        CompanyResponse response = new CompanyResponse();
        response.setId(company.getId());
        response.setName(company.getName());
        response.setEmail(company.getEmail());
        response.setCity(company.getCity());
        response.setEmployeesCount(company.getEmployeesCount());
        response.setDemo(company.isDemo());
        return response;
    }

    public CompanyDetailResponse mapToDetailResponse(Company company) {
        CompanyDetailResponse response = new CompanyDetailResponse();
        response.setId(company.getId());
        response.setName(company.getName());
        response.setAddress(company.getAddress());
        response.setPhone(company.getPhone());
        response.setWebsite(company.getWebsite());
        response.setEmail(company.getEmail());
        response.setEmployeesCount(company.getEmployeesCount());
        response.setLogoUrl(company.getLogoUrl());
        response.setCity(company.getCity());
        response.setState(company.getState());
        response.setZipCode(company.getZipCode());
        response.setDemo(company.isDemo());

        if (company.getCompanySettings() != null) {
            GeneralPreferences gp = company.getCompanySettings().getGeneralPreferences();
            if (gp != null) {
                response.setLanguage(gp.getLanguage());
                response.setDateFormat(gp.getDateFormat());
                response.setCurrencyCode(gp.getCurrency() != null ? gp.getCurrency().getCode() : null);
                response.setBusinessType(gp.getBusinessType());
                response.setTimeZone(gp.getTimeZone());
            }
        }

        return response;
    }
}