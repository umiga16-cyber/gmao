package com.gmao.app.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.gmao.app.Model.Company;

public interface CompanyRepository extends JpaRepository<Company, Long> {

    boolean existsByNameIgnoreCase(String name);

    List<Company> findByDemoTrue();

    List<Company> findByDemoFalse();
}