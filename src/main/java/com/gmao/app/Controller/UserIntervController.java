package com.gmao.app.Controller;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import com.gmao.app.Model.UserInterv;
import com.gmao.app.Service.UserIntervService;


@Controller
@RequestMapping("/users")
public class UserIntervController {

    @Autowired
    private UserIntervService userIntervService;

    // Lista de usuarios
    @GetMapping
    public String listUsers(Model model, 
                           @RequestParam(defaultValue = "0") int page,
                           @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("nom").ascending());
        Page<UserInterv> usersPage = userIntervService.findAll(pageable);
        
        model.addAttribute("users", usersPage.getContent());
        model.addAttribute("currentPage", page);
        model.addAttribute("totalPages", usersPage.getTotalPages());
        
        // Estadísticas
        model.addAttribute("totalUsers", userIntervService.getTotalUsers());
        model.addAttribute("usersActifs", userIntervService.getUsersActifs());
        model.addAttribute("usersInactifs", userIntervService.getUsersInactifs());
        model.addAttribute("adminsCount", userIntervService.getAdminsCount());
        
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String email = userDetails.getUsername();
        UserInterv user = userIntervService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        model.addAttribute("userName", user.getNom());                    

        return "users-list";
    }

    // Ver usuario
    @GetMapping("/{id}")
    public String viewUser(@PathVariable Long id, Model model) {
        UserInterv user = userIntervService.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        model.addAttribute("user", user);
        return "user-details";
    }

    // Formulario nuevo usuario
    @GetMapping("/new")
    public String newUserForm(Model model) {
        model.addAttribute("user", new UserInterv());
        model.addAttribute("isNew", true);
        model.addAttribute("roles", UserInterv.Role.values());
        model.addAttribute("statuts", UserInterv.Statut.values());
        return "user-form";
    }

    // Formulario editar usuario
    @GetMapping("/{id}/edit")
    public String editUserForm(@PathVariable Long id, Model model) {
        UserInterv user = userIntervService.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        model.addAttribute("user", user);
        model.addAttribute("isNew", false);
        model.addAttribute("roles", UserInterv.Role.values());
        model.addAttribute("statuts", UserInterv.Statut.values());
        return "user-form";
    }

    // Guardar usuario
    @PostMapping("/save")
    public String saveUser(@Valid @ModelAttribute UserInterv user, 
                          BindingResult result,
                          RedirectAttributes redirectAttributes) {
        
        if (result.hasErrors()) {
            redirectAttributes.addFlashAttribute("error", "Veuillez corriger les erreurs");
            return "redirect:/users/" + (user.getUserId() != null ? user.getUserId() + "/edit" : "new");
        }

        // Verificar email único
        if (userIntervService.existsByEmail(user.getEmail()) && 
            !userIntervService.findByEmail(user.getEmail()).get().getUserId().equals(user.getUserId())) {
            redirectAttributes.addFlashAttribute("error", "Cet email est déjà utilisé");
            return "redirect:/users/" + (user.getUserId() != null ? user.getUserId() + "/edit" : "new");
        }

        userIntervService.save(user);
        redirectAttributes.addFlashAttribute("success", "Utilisateur sauvegardé avec succès");
        return "redirect:/users";
    }

    // Eliminar usuario
    @GetMapping("/{id}/delete")
    public String deleteUser(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        try {
            userIntervService.deleteById(id);
            redirectAttributes.addFlashAttribute("success", "Utilisateur supprimé avec succès");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "Erreur lors de la suppression");
        }
        return "redirect:/users";
    }

    // Cambiar statut
    @PostMapping("/{id}/toggle-status")
    public String toggleStatus(@PathVariable Long id, 
                              @RequestParam UserInterv.Statut newStatus,
                              RedirectAttributes redirectAttributes) {
        UserInterv user = userIntervService.findById(id).orElseThrow();
        user.setStatut(newStatus);
        userIntervService.save(user);
        redirectAttributes.addFlashAttribute("success", "Statut mis à jour");
        return "redirect:/users";
    }
}
