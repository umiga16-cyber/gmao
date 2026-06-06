package com.gmao.app.Security;

import jakarta.servlet.DispatcherType;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth

                // Public / technical
                .dispatcherTypeMatchers(DispatcherType.ERROR).permitAll()
                .requestMatchers(
                    "/login",
                    "/error",
                    "/css/**",
                    "/js/**",
                    "/JS/**",
                    "/images/**",
                    "/h2-console/**",
                    "/favicon.ico"
                ).permitAll()

                // =========================
                // DASHBOARD
                // Admin ✅ Manager ✅ Planificateur ✅ Magasinier ✅ Visiteur ✅ Technicien ❌
                // =========================
                .requestMatchers("/dashboard")
                    .hasAnyRole("ADMIN", "MANAGER", "PLANIFICATEUR", "MAGASINIER", "VISITEUR")

                // =========================
                // USERS / ROLES
                // Admin only
                // =========================
                .requestMatchers("/users", "/roles")
                    .hasRole("ADMIN")
                .requestMatchers("/api/users/**", "/api/roles/**")
                    .hasRole("ADMIN")

                // =========================
                // EQUIPEMENTS
                // Admin CRUD
                // Manager CRUD
                // Technician Read
                // Planificateur Read
                // Visiteur Read
                // Magasinier ❌
                // =========================
                .requestMatchers(HttpMethod.GET, "/equipements-list", "/api/equipements/**")
                    .hasAnyRole("ADMIN", "MANAGER", "TECHNICIAN", "PLANIFICATEUR", "VISITEUR")

                .requestMatchers(HttpMethod.POST, "/api/equipements/**")
                    .hasAnyRole("ADMIN", "MANAGER")
                .requestMatchers(HttpMethod.PUT, "/api/equipements/**")
                    .hasAnyRole("ADMIN", "MANAGER")
                .requestMatchers(HttpMethod.PATCH, "/api/equipements/**")
                    .hasAnyRole("ADMIN", "MANAGER")
                .requestMatchers(HttpMethod.DELETE, "/api/equipements/**")
                    .hasAnyRole("ADMIN", "MANAGER")

                // =========================
                // INTERVENTIONS
                // Admin CRUD
                // Manager CRUD
                // Technician Update
                // Planificateur Create
                // Magasinier Read
                // Visiteur Read
                // =========================
                .requestMatchers(HttpMethod.GET, "/interventions", "/api/interventions/**")
                    .hasAnyRole("ADMIN", "MANAGER", "TECHNICIAN", "MAGASINIER", "VISITEUR")

                .requestMatchers(HttpMethod.POST, "/api/interventions/**")
                    .hasAnyRole("ADMIN", "MANAGER", "PLANIFICATEUR")

                .requestMatchers(HttpMethod.PUT, "/api/interventions/**")
                    .hasAnyRole("ADMIN", "MANAGER", "TECHNICIAN")
                .requestMatchers(HttpMethod.PATCH, "/api/interventions/**")
                    .hasAnyRole("ADMIN", "MANAGER", "TECHNICIAN")

                .requestMatchers(HttpMethod.DELETE, "/api/interventions/**")
                    .hasAnyRole("ADMIN", "MANAGER")

                // =========================
                // PREVENTIF
                // Admin CRUD
                // Manager CRUD
                // Technician Read
                // Planificateur Create
                // Visiteur Read
                // Magasinier ❌
                // =========================
                .requestMatchers(HttpMethod.GET, "/preventif", "/api/preventifs/**")
                    .hasAnyRole("ADMIN", "MANAGER", "TECHNICIAN", "VISITEUR")

                .requestMatchers(HttpMethod.POST, "/api/preventifs/**")
                    .hasAnyRole("ADMIN", "MANAGER", "PLANIFICATEUR")

                .requestMatchers(HttpMethod.PUT, "/api/preventifs/**")
                    .hasAnyRole("ADMIN", "MANAGER")
                .requestMatchers(HttpMethod.PATCH, "/api/preventifs/**")
                    .hasAnyRole("ADMIN", "MANAGER")
                .requestMatchers(HttpMethod.DELETE, "/api/preventifs/**")
                    .hasAnyRole("ADMIN", "MANAGER")

                // =========================
                // PRs / STOCK
                // Admin CRUD
                // Manager Update
                // Technician Read
                // Magasinier CRUD
                // Visiteur Read
                // Planificateur ❌
                // =========================
                .requestMatchers(HttpMethod.GET, "/stock", "/api/prs/**", "/api/stock/**")
                    .hasAnyRole("ADMIN", "TECHNICIAN", "MAGASINIER", "VISITEUR")

                .requestMatchers(HttpMethod.POST, "/api/prs/**", "/api/stock/**")
                    .hasAnyRole("ADMIN", "MAGASINIER")

                .requestMatchers(HttpMethod.PUT, "/api/prs/**", "/api/stock/**")
                    .hasAnyRole("ADMIN", "MANAGER", "MAGASINIER")
                .requestMatchers(HttpMethod.PATCH, "/api/prs/**", "/api/stock/**")
                    .hasAnyRole("ADMIN", "MANAGER", "MAGASINIER")

                .requestMatchers(HttpMethod.DELETE, "/api/prs/**", "/api/stock/**")
                    .hasAnyRole("ADMIN", "MAGASINIER")


            )
            .formLogin(form -> form
                .loginPage("/login")
                .loginProcessingUrl("/login")
                .usernameParameter("email")
                .passwordParameter("password")
                .defaultSuccessUrl("/dashboard", true)
                .failureUrl("/login?error=true")
                .permitAll()
            )
            .logout(logout -> logout
                .logoutUrl("/logout")
                .logoutSuccessUrl("/login?logout=true")
                .permitAll()
            )
            .headers(headers -> headers
                .cacheControl(Customizer.withDefaults())
                .frameOptions(frame -> frame.sameOrigin())
            );

        return http.build();
    }
}