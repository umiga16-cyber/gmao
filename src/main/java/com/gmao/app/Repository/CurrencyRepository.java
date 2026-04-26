package com.gmao.app.Repository;


import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.gmao.app.Model.Currency;

public interface CurrencyRepository extends JpaRepository<Currency, Long> {
    Optional<Currency> findByCode(String code);
}
