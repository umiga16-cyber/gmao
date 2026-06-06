package com.gmao.app.config;

import java.time.LocalDate;
import java.time.LocalDateTime;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

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
	CommandLineRunner initData(RoleRepository roleRepository, UserRepository appUserRepository,
			CurrencyRepository currencyRepository,
			EquipementRepository equipementRepository, PreventifRepository preventifRepository,
			InterventionRepository interventionRepository, DisponibiliteRepository disponibiliteRepository,
			PasswordEncoder passwordEncoder) {
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
			// =========================
			// ROLES
			// =========================
			Role adminRole = new Role();
			adminRole.setNom("ADMIN");

			Role managerRole = new Role();
			managerRole.setNom("MANAGER");

			Role technicianRole = new Role();
			technicianRole.setNom("TECHNICIAN");

			Role planificateurRole = new Role();
			planificateurRole.setNom("PLANIFICATEUR");

			Role magasinierRole = new Role();
			magasinierRole.setNom("MAGASINIER");

			Role supervisorRole = new Role();
			supervisorRole.setNom("SUPERVISOR");

			Role visiteurRole = new Role();
			visiteurRole.setNom("VISITEUR");

			roleRepository.save(adminRole);
			roleRepository.save(managerRole);
			roleRepository.save(technicianRole);
			roleRepository.save(planificateurRole);
			roleRepository.save(magasinierRole);
			roleRepository.save(visiteurRole);
			roleRepository.save(supervisorRole);



			GeneralPreferences prefs1 = new GeneralPreferences();
			prefs1.setLanguage(Language.FR);
			prefs1.setDateFormat(DateFormat.DDMMYY);
			prefs1.setCurrency(eur);
			prefs1.setBusinessType(BusinessType.MANUFACTURING_MANAGEMENT);
			prefs1.setTimeZone("Europe/Paris");



		

			GeneralPreferences prefs2 = new GeneralPreferences();
		
			prefs2.setLanguage(Language.EN);
			prefs2.setDateFormat(DateFormat.MMDDYY);
			prefs2.setCurrency(usd);
			prefs2.setBusinessType(BusinessType.FACILITY_MANAGEMENT);
			prefs2.setTimeZone("Europe/Amsterdam");



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

			User manager = new User();
			manager.setNom("Manager User");
			manager.setRole(managerRole);
			manager.setEmail("manager@gmao.test");
			manager.setPassword(passwordEncoder.encode("manager123"));
			manager.setStatut("ACTIVE");
			manager.setActif(true);

			User planner = new User();
			planner.setNom("Planificateur User");
			planner.setRole(planificateurRole);
			planner.setEmail("planner@gmao.test");
			planner.setPassword(passwordEncoder.encode("planner123"));
			planner.setStatut("ACTIVE");
			planner.setActif(true);

			User magasinier = new User();
			magasinier.setNom("Magasinier User");
			magasinier.setRole(magasinierRole);
			magasinier.setEmail("magasinier@gmao.test");
			magasinier.setPassword(passwordEncoder.encode("mag123"));
			magasinier.setStatut("ACTIVE");
			magasinier.setActif(true);

			User visiteur = new User();
			visiteur.setNom("Visiteur User");
			visiteur.setRole(visiteurRole);
			visiteur.setEmail("visiteur@gmao.test");
			visiteur.setPassword(passwordEncoder.encode("visit123"));
			visiteur.setStatut("ACTIVE");
			visiteur.setActif(true);

			appUserRepository.save(manager);
			appUserRepository.save(planner);
			appUserRepository.save(magasinier);
			appUserRepository.save(visiteur);
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
			 
			eq1.setNumeroSerie("ATL-001-2026");
			eq1.setLocalisation("Usine A - Zone 1");
			eq1.setStatut("ACTIF");
			eq1.setDateInstallation(LocalDate.now().minusYears(2));
			eq1.setDateMiseEnService(LocalDate.now().minusYears(2).plusDays(7));
			eq1.setCriticite("ALTA");
			eq1.setActif(true);
			eq1.setCommentaire("Équipement critique pour la production.");

			Equipement eq2 = new Equipement();
			eq2.setCode("EQ-AT-002");
			eq2.setDescription("Pompe de refroidissement");
			eq2.setType("PUMP");
			eq2.setMarque("Grundfos");
			 
			eq2.setNumeroSerie("PMP-8821");
			eq2.setLocalisation("Usine A - Zone 2");
			eq2.setStatut("MAINTENANCE");
			eq2.setDateInstallation(LocalDate.now().minusMonths(18));
			eq2.setDateMiseEnService(LocalDate.now().minusMonths(18).plusDays(2));
			eq2.setCriticite("MEDIA");
			eq2.setActif(true);
			eq2.setCommentaire("Maintenance préventive en cours.");

			Equipement eq3 = new Equipement();
			eq3.setCode("EQ-NV-001");
			eq3.setDescription("Groupe électrogène secondaire");
			eq3.setType("GENERATOR");
			eq3.setMarque("Caterpillar");
			 
			eq3.setNumeroSerie("GEN-2045");
			eq3.setLocalisation("Bâtiment B - Sous-sol");
			eq3.setStatut("HS");
			eq3.setDateInstallation(LocalDate.now().minusYears(4));
			eq3.setDateMiseEnService(LocalDate.now().minusYears(4).plusDays(3));
			eq3.setCriticite("ALTA");
			eq3.setActif(true);
			eq3.setCommentaire("Hors service, remplacement à prévoir.");
	

			Equipement eq4 = new Equipement();
			eq4.setCode("EQ-NV-002");
			eq4.setDescription("Tableau électrique principal");
			eq4.setType("ELECTRICAL_PANEL");
			eq4.setMarque("Schneider");
		 
			eq4.setNumeroSerie("EL-7788");
			eq4.setLocalisation("Bâtiment B - RDC");
			eq4.setStatut("ACTIF");
			eq4.setDateInstallation(LocalDate.now().minusYears(1));
			eq4.setDateMiseEnService(LocalDate.now().minusYears(1).plusDays(5));
			eq4.setCriticite("MEDIA");
			eq4.setActif(true);
			eq4.setCommentaire("Inspection visuelle mensuelle.");


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
			i1.setCodeIntervention("INT-001");
			i1.setLibele("Remplacement filtre compresseur");
			i1.setType("CORRECTIVE");
			i1.setEquipement(eq1);
			i1.setStatut("PLANIFIEE");
			i1.setDateDebut(LocalDateTime.now().minusDays(1));
			i1.setDateFin(LocalDateTime.now().plusDays(1));
			i1.setCommentaire("Intervention prioritaire.");
			i1.setPreventif(p1);
			i1.setCreatedBy(admin);

			Intervention i2 = new Intervention();
			i2.setCodeIntervention("INT-002");
			i2.setLibele("Inspection tableau électrique");
			i2.setType("PREVENTIVE");
			i2.setEquipement(eq4);
			i2.setStatut("EN_COURS");
			i2.setDateDebut(LocalDateTime.now());
			i2.setDateFin(LocalDateTime.now().plusHours(4));
			i2.setCommentaire("Prévoir arrêt électrique partiel.");
			i2.setPreventif(p2);
			i2.setCreatedBy(supervisor);

			Intervention i3 = new Intervention();
			i3.setCodeIntervention("INT-003");
			i3.setLibele("Diagnostic groupe électrogène");
			i3.setType("CORRECTIVE");
			i3.setEquipement(eq3);
			i3.setStatut("PLANIFIEE");
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