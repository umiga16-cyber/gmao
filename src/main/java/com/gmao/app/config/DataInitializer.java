package com.gmao.app.config;

import java.time.LocalDate;
import java.time.LocalDateTime;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import com.gmao.app.Model.Company;
import com.gmao.app.Model.CompanySettings;
import com.gmao.app.Model.Currency;
import com.gmao.app.Model.Disponibilite;
import com.gmao.app.Model.Equipement;
import com.gmao.app.Model.GeneralPreferences;
import com.gmao.app.Model.Intervention;
import com.gmao.app.Model.Preventif;
import com.gmao.app.Model.Role;
import com.gmao.app.Model.User;
import com.gmao.app.Model.enums.BusinessType;
import com.gmao.app.Model.enums.DateFormat;
import com.gmao.app.Model.enums.FrequencyType;
import com.gmao.app.Model.enums.Language;
import com.gmao.app.Repository.CompanyRepository;
import com.gmao.app.Repository.CurrencyRepository;
import com.gmao.app.Repository.DisponibiliteRepository;
import com.gmao.app.Repository.EquipementRepository;
import com.gmao.app.Repository.InterventionRepository;
import com.gmao.app.Repository.PreventifRepository;
import com.gmao.app.Repository.RoleRepository;
import com.gmao.app.Repository.UserRepository;

@Configuration
public class DataInitializer {

    @Bean
    @Transactional
    CommandLineRunner initData(
            RoleRepository roleRepository,
            UserRepository appUserRepository,
            CurrencyRepository currencyRepository,
            CompanyRepository companyRepository,
            EquipementRepository equipementRepository,
            PreventifRepository preventifRepository,
            InterventionRepository interventionRepository,
            DisponibiliteRepository disponibiliteRepository,
            PasswordEncoder passwordEncoder
    ) {
        return args -> {
            // Prevent duplicate seed on every restart
            if (roleRepository.count() > 0 || appUserRepository.count() > 0 || equipementRepository.count() > 0) {
                return;
            }

            // =========================
            // CURRENCIES
            // =========================
            Currency eur = new Currency();
            eur.setName("Euro");
            eur.setCode("EUR");

            Currency usd = new Currency();
            usd.setName("US Dollar");
            usd.setCode("USD");

            currencyRepository.save(eur);
            currencyRepository.save(usd);

            // =========================
            // ROLES
            // =========================
            Role adminRole = new Role();
            adminRole.setNom("ADMIN");

            Role technicianRole = new Role();
            technicianRole.setNom("TECHNICIAN");

            Role supervisorRole = new Role();
            supervisorRole.setNom("SUPERVISOR");

            roleRepository.save(adminRole);
            roleRepository.save(technicianRole);
            roleRepository.save(supervisorRole);

            // =========================
            // COMPANIES
            // =========================
            Company company1 = new Company();
            company1.setName("Atlas Industrie");
            company1.setAddress("12 Rue de Production");
            company1.setPhone("+33 1 40 20 30 40");
            company1.setWebsite("https://atlas-industrie.test");
            company1.setEmail("contact@atlas.test");
            company1.setEmployeesCount(120);
            company1.setLogoUrl("https://dummyimage.com/200x80/667eea/ffffff&text=Atlas");
            company1.setCity("Paris");
            company1.setState("Ile-de-France");
            company1.setZipCode("75010");
            company1.setDemo(false);

            CompanySettings settings1 = new CompanySettings();
            settings1.setCompany(company1);

            GeneralPreferences prefs1 = new GeneralPreferences();
            prefs1.setCompanySettings(settings1);
            prefs1.setLanguage(Language.FR);
            prefs1.setDateFormat(DateFormat.DDMMYY);
            prefs1.setCurrency(eur);
            prefs1.setBusinessType(BusinessType.MANUFACTURING_MANAGEMENT);
            prefs1.setTimeZone("Europe/Paris");

            settings1.setGeneralPreferences(prefs1);
            company1.setCompanySettings(settings1);

            Company company2 = new Company();
            company2.setName("Nova Facility Services");
            company2.setAddress("45 Avenue Centrale");
            company2.setPhone("+31 20 555 8899");
            company2.setWebsite("https://nova-facility.test");
            company2.setEmail("hello@nova.test");
            company2.setEmployeesCount(65);
            company2.setLogoUrl("https://dummyimage.com/200x80/764ba2/ffffff&text=Nova");
            company2.setCity("Amsterdam");
            company2.setState("Noord-Holland");
            company2.setZipCode("1012");
            company2.setDemo(true);

            CompanySettings settings2 = new CompanySettings();
            settings2.setCompany(company2);

            GeneralPreferences prefs2 = new GeneralPreferences();
            prefs2.setCompanySettings(settings2);
            prefs2.setLanguage(Language.EN);
            prefs2.setDateFormat(DateFormat.MMDDYY);
            prefs2.setCurrency(usd);
            prefs2.setBusinessType(BusinessType.FACILITY_MANAGEMENT);
            prefs2.setTimeZone("Europe/Amsterdam");

            settings2.setGeneralPreferences(prefs2);
            company2.setCompanySettings(settings2);

            companyRepository.save(company1);
            companyRepository.save(company2);

            // =========================
            // USERS
            // =========================
            User admin = new User();
            admin.setNom("Naoufal Admin");
            admin.setRole(adminRole);
            admin.setEmail("admin@gmao.test");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setStatut("ACTIVE");
            admin.setActif(true);

            User tech1 = new User();
            tech1.setNom("Yassine Technician");
            tech1.setRole(technicianRole);
            tech1.setEmail("tech1@gmao.test");
            tech1.setPassword(passwordEncoder.encode("tech123"));
            tech1.setStatut("ACTIVE");
            tech1.setActif(true);

            User tech2 = new User();
            tech2.setNom("Sara Technician");
            tech2.setRole(technicianRole);
            tech2.setEmail("tech2@gmao.test");
            tech2.setPassword(passwordEncoder.encode("tech123"));
            tech2.setStatut("ACTIVE");
            tech2.setActif(true);

            User supervisor = new User();
            supervisor.setNom("Khadija Supervisor");
            supervisor.setRole(supervisorRole);
            supervisor.setEmail("supervisor@gmao.test");
            supervisor.setPassword(passwordEncoder.encode("super123"));
            supervisor.setStatut("ACTIVE");
            supervisor.setActif(true);

            appUserRepository.save(admin);
            appUserRepository.save(tech1);
            appUserRepository.save(tech2);
            appUserRepository.save(supervisor);

                  
            // =========================
            // AVAILABILITY
            // =========================
            Disponibilite d1 = new Disponibilite();
            d1.setUser(tech1);
            d1.setDate(LocalDate.now().plusDays(1));
            d1.setDisponible(true);

            Disponibilite d2 = new Disponibilite();
            d2.setUser(tech2);
            d2.setDate(LocalDate.now().plusDays(1));
            d2.setDisponible(false);

            Disponibilite d3 = new Disponibilite();
            d3.setUser(supervisor);
            d3.setDate(LocalDate.now().plusDays(1));
            d3.setDisponible(true);

            disponibiliteRepository.save(d1);
            disponibiliteRepository.save(d2);
            disponibiliteRepository.save(d3);

            // =========================
            // EQUIPEMENTS
            // =========================
            Equipement eq1 = new Equipement();
            eq1.setCode("EQ-AT-001");
            eq1.setDescription("Compresseur principal");
            eq1.setType("COMPRESSOR");
            eq1.setMarque("Atlas Copco");
            eq1.setModele("GA75");
            eq1.setNumeroSerie("ATL-001-2026");
            eq1.setLocalisation("Usine A - Zone 1");
            eq1.setStatut("ACTIF");
            eq1.setDateInstallation(LocalDate.now().minusYears(2));
            eq1.setDateMiseEnService(LocalDate.now().minusYears(2).plusDays(7));
            eq1.setCriticite("ALTA");
            eq1.setActif(true);
            eq1.setCommentaire("Équipement critique pour la production.");
            // Uncomment if you already added company relation in Equipement
            // eq1.setCompany(company1);

            Equipement eq2 = new Equipement();
            eq2.setCode("EQ-AT-002");
            eq2.setDescription("Pompe de refroidissement");
            eq2.setType("PUMP");
            eq2.setMarque("Grundfos");
            eq2.setModele("CRN 10");
            eq2.setNumeroSerie("PMP-8821");
            eq2.setLocalisation("Usine A - Zone 2");
            eq2.setStatut("MAINTENANCE");
            eq2.setDateInstallation(LocalDate.now().minusMonths(18));
            eq2.setDateMiseEnService(LocalDate.now().minusMonths(18).plusDays(2));
            eq2.setCriticite("MEDIA");
            eq2.setActif(true);
            eq2.setCommentaire("Maintenance préventive en cours.");
            // eq2.setCompany(company1);

            Equipement eq3 = new Equipement();
            eq3.setCode("EQ-NV-001");
            eq3.setDescription("Groupe électrogène secondaire");
            eq3.setType("GENERATOR");
            eq3.setMarque("Caterpillar");
            eq3.setModele("CAT 320");
            eq3.setNumeroSerie("GEN-2045");
            eq3.setLocalisation("Bâtiment B - Sous-sol");
            eq3.setStatut("HS");
            eq3.setDateInstallation(LocalDate.now().minusYears(4));
            eq3.setDateMiseEnService(LocalDate.now().minusYears(4).plusDays(3));
            eq3.setCriticite("ALTA");
            eq3.setActif(true);
            eq3.setCommentaire("Hors service, remplacement à prévoir.");
            // eq3.setCompany(company2);

            Equipement eq4 = new Equipement();
            eq4.setCode("EQ-NV-002");
            eq4.setDescription("Tableau électrique principal");
            eq4.setType("ELECTRICAL_PANEL");
            eq4.setMarque("Schneider");
            eq4.setModele("MasterPact");
            eq4.setNumeroSerie("EL-7788");
            eq4.setLocalisation("Bâtiment B - RDC");
            eq4.setStatut("ACTIF");
            eq4.setDateInstallation(LocalDate.now().minusYears(1));
            eq4.setDateMiseEnService(LocalDate.now().minusYears(1).plusDays(5));
            eq4.setCriticite("MEDIA");
            eq4.setActif(true);
            eq4.setCommentaire("Inspection visuelle mensuelle.");
            // eq4.setCompany(company2);

            equipementRepository.save(eq1);
            equipementRepository.save(eq2);
            equipementRepository.save(eq3);
            equipementRepository.save(eq4);

            // Example parent-child relation
            eq2.setParent(eq1);
            equipementRepository.save(eq2);

            // =========================
            // PREVENTIFS
            // =========================
            Preventif p1 = new Preventif();
            p1.setEquipement(eq1);
            p1.setFrequence(30);
            p1.setTypeFrequence(FrequencyType.DAILY);
            p1.setProchaineDate(LocalDate.now().plusDays(30));
            p1.setOperations("Vérifier pression, filtres, température et niveau d'huile.");
            p1.setHorizon(7);
            p1.setStatut("ACTIVE");
            p1.setActif(true);

            Preventif p2 = new Preventif();
            p2.setEquipement(eq4);
            p2.setFrequence(1);
            p2.setTypeFrequence(FrequencyType.MONTHLY);
            p2.setProchaineDate(LocalDate.now().plusMonths(1));
            p2.setOperations("Contrôle des connexions et nettoyage du tableau.");
            p2.setHorizon(5);
            p2.setStatut("ACTIVE");
            p2.setActif(true);

            preventifRepository.save(p1);
            preventifRepository.save(p2);

            // =========================
            // INTERVENTIONS
            // =========================
            Intervention i1 = new Intervention();
            i1.setLibele("Remplacement filtre compresseur");
            i1.setType("CORRECTIVE");
            i1.setEquipement(eq1);
            i1.setStatut("OPEN");
            i1.setDateDebut(LocalDateTime.now().minusDays(1));
            i1.setDateFin(LocalDateTime.now().plusDays(1));
            i1.setCommentaire("Intervention prioritaire.");
            i1.setPreventif(p1);
            i1.setCreatedBy(admin);

            Intervention i2 = new Intervention();
            i2.setLibele("Inspection tableau électrique");
            i2.setType("PREVENTIVE");
            i2.setEquipement(eq4);
            i2.setStatut("IN_PROGRESS");
            i2.setDateDebut(LocalDateTime.now());
            i2.setDateFin(LocalDateTime.now().plusHours(4));
            i2.setCommentaire("Prévoir arrêt électrique partiel.");
            i2.setPreventif(p2);
            i2.setCreatedBy(supervisor);

            Intervention i3 = new Intervention();
            i3.setLibele("Diagnostic groupe électrogène");
            i3.setType("DIAGNOSTIC");
            i3.setEquipement(eq3);
            i3.setStatut("OPEN");
            i3.setDateDebut(LocalDateTime.now().plusDays(2));
            i3.setDateFin(LocalDateTime.now().plusDays(2).plusHours(2));
            i3.setCommentaire("Identifier la cause de la panne.");
            i3.setCreatedBy(admin);

            interventionRepository.save(i1);
            interventionRepository.save(i2);
            interventionRepository.save(i3);

            System.out.println("==================================================");
            System.out.println("FAKE DATA INSERTED SUCCESSFULLY");
            System.out.println("Admin login    : admin@gmao.test / admin123");
            System.out.println("Tech login     : tech1@gmao.test / tech123");
            System.out.println("Supervisor     : supervisor@gmao.test / super123");
            System.out.println("==================================================");
        };
    }
}