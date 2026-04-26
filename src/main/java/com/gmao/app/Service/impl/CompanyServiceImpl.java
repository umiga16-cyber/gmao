package com.gmao.app.Service.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.gmao.app.Model.Company;
import com.gmao.app.Model.CompanySettings;
import com.gmao.app.Model.Currency;
import com.gmao.app.Model.GeneralPreferences;
import com.gmao.app.Repository.CompanyRepository;
import com.gmao.app.Repository.CurrencyRepository;
import com.gmao.app.Service.CompanyService;
import com.gmao.app.dto.CompanyCreateRequest;
import com.gmao.app.dto.CompanyDetailResponse;
import com.gmao.app.dto.CompanyResponse;
import com.gmao.app.dto.CompanyUpdateRequest;
import com.gmao.app.mapper.CompanyMapper;

@Service
@Transactional
public class CompanyServiceImpl implements CompanyService {

    private final CompanyRepository companyRepository;
    private final CurrencyRepository currencyRepository;
    private final CompanyMapper companyMapper;

    public CompanyServiceImpl(CompanyRepository companyRepository,
                              CurrencyRepository currencyRepository,
                              CompanyMapper companyMapper) {
        this.companyRepository = companyRepository;
        this.currencyRepository = currencyRepository;
        this.companyMapper = companyMapper;
    }

    @Override
    public CompanyResponse create(CompanyCreateRequest request) {
        if (request == null || request.getName() == null || request.getName().isBlank()) {
            throw new IllegalArgumentException("Le nom de la société est obligatoire.");
        }

        if (companyRepository.existsByNameIgnoreCase(request.getName().trim())) {
            throw new IllegalArgumentException("Une société avec ce nom existe déjà.");
        }

        Company company = new Company();
        applyCompanyFields(company, request);

        CompanySettings settings = new CompanySettings();
        settings.setCompany(company);

        GeneralPreferences preferences = new GeneralPreferences();
        preferences.setCompanySettings(settings);

        if (request.getLanguage() != null) preferences.setLanguage(request.getLanguage());
        if (request.getDateFormat() != null) preferences.setDateFormat(request.getDateFormat());
        if (request.getBusinessType() != null) preferences.setBusinessType(request.getBusinessType());
        if (request.getTimeZone() != null && !request.getTimeZone().isBlank()) preferences.setTimeZone(request.getTimeZone());

        if (request.getCurrencyCode() != null && !request.getCurrencyCode().isBlank()) {
            Currency currency = currencyRepository.findByCode(request.getCurrencyCode())
                    .orElseThrow(() -> new IllegalArgumentException("Devise introuvable: " + request.getCurrencyCode()));
            preferences.setCurrency(currency);
        }

        settings.setGeneralPreferences(preferences);
        company.setCompanySettings(settings);

        Company saved = companyRepository.save(company);
        return companyMapper.mapToResponse(saved);
    }

    @Override
    public CompanyResponse update(Long id, CompanyUpdateRequest request) {
        Company company = getCompanyOrThrow(id);

        if (request == null) {
            throw new IllegalArgumentException("La requête de mise à jour est obligatoire.");
        }

        applyCompanyFields(company, request);

        if (company.getCompanySettings() == null) {
            CompanySettings settings = new CompanySettings();
            settings.setCompany(company);
            company.setCompanySettings(settings);
        }

        if (company.getCompanySettings().getGeneralPreferences() == null) {
            GeneralPreferences preferences = new GeneralPreferences();
            preferences.setCompanySettings(company.getCompanySettings());
            company.getCompanySettings().setGeneralPreferences(preferences);
        }

        GeneralPreferences gp = company.getCompanySettings().getGeneralPreferences();

        if (request.getLanguage() != null) gp.setLanguage(request.getLanguage());
        if (request.getDateFormat() != null) gp.setDateFormat(request.getDateFormat());
        if (request.getBusinessType() != null) gp.setBusinessType(request.getBusinessType());
        if (request.getTimeZone() != null && !request.getTimeZone().isBlank()) gp.setTimeZone(request.getTimeZone());

        if (request.getCurrencyCode() != null && !request.getCurrencyCode().isBlank()) {
            Currency currency = currencyRepository.findByCode(request.getCurrencyCode())
                    .orElseThrow(() -> new IllegalArgumentException("Devise introuvable: " + request.getCurrencyCode()));
            gp.setCurrency(currency);
        }

        Company saved = companyRepository.save(company);
        return companyMapper.mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public CompanyResponse getById(Long id) {
        return companyMapper.mapToResponse(getCompanyOrThrow(id));
    }

    @Override
    @Transactional(readOnly = true)
    public CompanyDetailResponse getDetail(Long id) {
        return companyMapper.mapToDetailResponse(getCompanyOrThrow(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<CompanyResponse> getAll() {
        return companyRepository.findAll()
                .stream()
                .map(companyMapper::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public void delete(Long id) {
        Company company = getCompanyOrThrow(id);
        companyRepository.delete(company);
    }

    private Company getCompanyOrThrow(Long id) {
        return companyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Société introuvable avec l'id : " + id));
    }

    private void applyCompanyFields(Company company, CompanyCreateRequest request) {
        company.setName(request.getName() != null ? request.getName().trim() : null);
        company.setAddress(request.getAddress());
        company.setPhone(request.getPhone());
        company.setWebsite(request.getWebsite());
        company.setEmail(request.getEmail());
        company.setEmployeesCount(request.getEmployeesCount());
        company.setLogoUrl(request.getLogoUrl());
        company.setCity(request.getCity());
        company.setState(request.getState());
        company.setZipCode(request.getZipCode());
        company.setDemo(request.getDemo() != null && request.getDemo());
    }

    private void applyCompanyFields(Company company, CompanyUpdateRequest request) {
        if (request.getName() != null && !request.getName().isBlank()) company.setName(request.getName().trim());
        if (request.getAddress() != null) company.setAddress(request.getAddress());
        if (request.getPhone() != null) company.setPhone(request.getPhone());
        if (request.getWebsite() != null) company.setWebsite(request.getWebsite());
        if (request.getEmail() != null) company.setEmail(request.getEmail());
        if (request.getEmployeesCount() != null) company.setEmployeesCount(request.getEmployeesCount());
        if (request.getLogoUrl() != null) company.setLogoUrl(request.getLogoUrl());
        if (request.getCity() != null) company.setCity(request.getCity());
        if (request.getState() != null) company.setState(request.getState());
        if (request.getZipCode() != null) company.setZipCode(request.getZipCode());
        if (request.getDemo() != null) company.setDemo(request.getDemo());
    }
}