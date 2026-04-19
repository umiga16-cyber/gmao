package com.gmao.app.Service;
    

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import com.gmao.app.Model.UserInterv;
import com.gmao.app.Repository.UserIntervRepo;

@Service
public class UserIntervService {

    @Autowired
    private UserIntervRepo userIntervRepo;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public List<UserInterv> findAll() {
        return userIntervRepo.findAll();
    }

    public Page<UserInterv> findAll(Pageable pageable) {
        return userIntervRepo.findAll(pageable);
    }

    public Optional<UserInterv> findById(Long id) {
        return userIntervRepo.findById(id);
    }

    public UserInterv save(UserInterv user) {
        if (user.getUserId() == null) {
            user.setDateCreation(LocalDateTime.now());
        }
        user.setDateModification(LocalDateTime.now());
        
        // Codificar contraseña si es nueva
        if (user.getPassword() != null && !user.getPassword().startsWith("$2")) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        }
        
        return userIntervRepo.save(user);
    }

    public void deleteById(Long id) {
        userIntervRepo.deleteById(id);
    }

    public Optional<UserInterv> findByEmail(String email) {
        return userIntervRepo.findByEmail(email);
    }

    // Estadísticas para el dashboard
    public Long getTotalUsers() {
        return userIntervRepo.countTotalUsers();
    }

    public Long getUsersActifs() {
        return userIntervRepo.countByStatut(UserInterv.Statut.ACTIF);
    }

    public Long getUsersInactifs() {
        return userIntervRepo.countByStatut(UserInterv.Statut.ANNULE);
    }


    public Long getAdminsCount() {
        return userIntervRepo.countByRole(UserInterv.Role.ADMIN);
    }

    public List<UserInterv> getUsersByRole(UserInterv.Role role) {
        return userIntervRepo.findByRole(role);
    }

    public boolean existsByEmail(String email) {
        return userIntervRepo.findByEmail(email).isPresent();
    }
}
