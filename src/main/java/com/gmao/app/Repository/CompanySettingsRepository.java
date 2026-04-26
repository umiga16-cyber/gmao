package com.gmao.app.Repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.gmao.app.Model.CompanySettings;

public interface CompanySettingsRepository extends JpaRepository<CompanySettings, Long> {
}