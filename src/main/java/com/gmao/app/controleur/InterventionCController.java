package com.gmao.app.controleur;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;

import com.gmao.app.Model.InterventionClient;
import com.gmao.app.Service.InterventionCService;



@Controller
//@RequestMapping("/interventions")
public class InterventionCController {

//    @Autowired
//    private InterventionCService interventionCService;
//    @Autowired
////    private UserServiceNom userServiceNom;
//
//    @GetMapping
//
//    public String listInterventions(Model model) {
//        List<InterventionClient> interventions = interventionCService.getAllInterventions();
//        model.addAttribute("interventions", interventions);
//        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
//        String email = userDetails.getUsername();
////        userServiceNom.getUserDetails(email);
////        model.addAttribute("userName", userServiceNom.getUserDetails(email).getNom());
//        return "interventions-list"; // El nombre de la vista Thymeleaf
//    }
//
//    @GetMapping("/new")
//    public String showCreateForm(Model model) {
//        model.addAttribute("intervention", new InterventionClient());
//        return "intervention-form"; // La vista para crear una nueva intervención
//    }
//
//    @PostMapping("/new")
//    public String createIntervention(@ModelAttribute("intervention") InterventionClient intervention) {
//        interventionCService.createIntervention(intervention);
//        return "redirect:/interventions";
//    }
//
//    @GetMapping("/{id}/edit")
//    public String showEditForm(@PathVariable("id") Long id, Model model) {
//        InterventionClient intervention = interventionCService.getInterventionById(id)
//                .orElseThrow(() -> new RuntimeException("Intervention not found"));
//        model.addAttribute("intervention", intervention);
//        return "intervention-form";
//    }
//
//    @PostMapping("/{id}/edit")
//    public String updateIntervention(@PathVariable("id") Long id, @ModelAttribute("intervention") InterventionClient intervention) {
//        interventionCService.updateIntervention(id, intervention);
//        return "redirect:/interventions";
//    }
//
//    @GetMapping("/{id}/delete")
//    public String deleteIntervention(@PathVariable("id") Long id) {
//        interventionCService.deleteIntervention(id);
//        return "redirect:/interventions";
//    }
}