package com.gmao.app.Service.impl;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.gmao.app.Model.Disponibilite;
import com.gmao.app.Model.Role;
import com.gmao.app.Model.User;
import com.gmao.app.Repository.DisponibiliteRepository;
import com.gmao.app.Repository.RoleRepository;
import com.gmao.app.Repository.UserRepository;
import com.gmao.app.Service.UserService;
import com.gmao.app.dto.UserCreateRequest;
import com.gmao.app.dto.UserResponse;
import com.gmao.app.dto.UserUpdateRequest;
import com.gmao.app.mapper.UserMapper;

@Service
@Transactional
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final DisponibiliteRepository disponibiliteRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    public UserServiceImpl(UserRepository userRepository,
                           RoleRepository roleRepository,
                           DisponibiliteRepository disponibiliteRepository,
                           UserMapper userMapper,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.disponibiliteRepository = disponibiliteRepository;
        this.userMapper = userMapper;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public UserResponse create(UserCreateRequest request) {
        validateCreateRequest(request);

        if (userRepository.existsByEmail(request.getEmail().trim())) {
            throw new IllegalArgumentException("L'email existe déjà.");
        }

        Role role = getRoleOrThrow(request.getRoleId());

        User user = new User();
        user.setNom(request.getNom().trim());
        user.setRole(role);
        user.setEmail(request.getEmail().trim());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setStatut(request.getStatut() != null ? request.getStatut() : "ACTIVE");
        user.setActif(request.getActif() != null ? request.getActif() : Boolean.TRUE);

        return userMapper.mapToResponse(userRepository.save(user));
    }

    @Override
    public UserResponse update(Long id, UserUpdateRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("La requête de mise à jour est obligatoire.");
        }

        User user = getUserOrThrow(id);

        if (request.getNom() != null) {
            user.setNom(request.getNom().trim());
        }
        if (request.getRoleId() != null) {
            user.setRole(getRoleOrThrow(request.getRoleId()));
        }
        if (request.getEmail() != null) {
            String email = request.getEmail().trim();
            if (!email.equalsIgnoreCase(user.getEmail()) && userRepository.existsByEmail(email)) {
                throw new IllegalArgumentException("L'email existe déjà.");
            }
            user.setEmail(email);
        }
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        if (request.getStatut() != null) {
            user.setStatut(request.getStatut());
        }
        if (request.getActif() != null) {
            user.setActif(request.getActif());
        }

        return userMapper.mapToResponse(userRepository.save(user));
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getById(Long id) {
        return userMapper.mapToResponse(getUserOrThrow(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> getAll() {
        return userRepository.findAll()
                .stream()
                .map(userMapper::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> findByRole(Long roleId) {
        getRoleOrThrow(roleId);

        return userRepository.findByRoleId(roleId)
                .stream()
                .map(userMapper::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> findByStatut(String statut) {
        if (statut == null || statut.isBlank()) {
            throw new IllegalArgumentException("Le statut est obligatoire.");
        }

        return userRepository.findByStatut(statut)
                .stream()
                .map(userMapper::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> getEligibleUsers(LocalDate date, Long roleId) {
        if (date == null) {
            throw new IllegalArgumentException("La date est obligatoire.");
        }

        List<User> users = roleId != null
                ? userRepository.findByRoleId(roleId)
                : userRepository.findByActifTrue();

        return users.stream()
                .filter(u -> Boolean.TRUE.equals(u.getActif()))
                .filter(u -> u.getStatut() == null || "ACTIVE".equalsIgnoreCase(u.getStatut()))
                .filter(u -> isAvailable(u.getId(), date))
                .map(userMapper::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public UserResponse changeStatus(Long id, String statut) {
        if (statut == null || statut.isBlank()) {
            throw new IllegalArgumentException("Le statut est obligatoire.");
        }

        User user = getUserOrThrow(id);
        user.setStatut(statut.trim());

        return userMapper.mapToResponse(userRepository.save(user));
    }

    @Override
    public UserResponse archive(Long id) {
        User user = getUserOrThrow(id);
        user.setActif(Boolean.FALSE);
        user.setStatut("INACTIVE");

        return userMapper.mapToResponse(userRepository.save(user));
    }

    @Override
    public void delete(Long id) {
        User user = getUserOrThrow(id);

        if (disponibiliteRepository.existsByUserId(id)) {
            throw new IllegalStateException(
                "Impossible de supprimer cet utilisateur car il possède encore des disponibilités liées. Supprimez d'abord ses disponibilités ou archivez-le."
            );
        }

        userRepository.delete(user);
    }
    private boolean isAvailable(Long userId, LocalDate date) {
        return disponibiliteRepository.findByUserIdAndDate(userId, date)
                .map(Disponibilite::getDisponible)
                .orElse(Boolean.TRUE);
    }

    private User getUserOrThrow(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable avec l'id : " + id));
    }

    private Role getRoleOrThrow(Long id) {
        return roleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rôle introuvable avec l'id : " + id));
    }

    private void validateCreateRequest(UserCreateRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("La requête de création est obligatoire.");
        }
        if (request.getNom() == null || request.getNom().isBlank()) {
            throw new IllegalArgumentException("Le nom est obligatoire.");
        }
        if (request.getRoleId() == null) {
            throw new IllegalArgumentException("Le rôle est obligatoire.");
        }
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            throw new IllegalArgumentException("L'email est obligatoire.");
        }
        if (request.getPassword() == null || request.getPassword().isBlank()) {
            throw new IllegalArgumentException("Le mot de passe est obligatoire.");
        }
    }
}