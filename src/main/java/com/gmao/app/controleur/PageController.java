package com.gmao.app.controleur;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class PageController {

    @GetMapping("/login")
    public String loginPage() {
        return "login";
    }

    @GetMapping("/dashboard")
    public String dashboardPage() {
        return "dashboard";
    }

    @GetMapping("/users")
    public String usersPage() {
        return "users-list";
    }

    @GetMapping("/roles")
    public String rolesPage() {
        return "roles-list";
    }

    @GetMapping("/equipements-list")
    public String equipementsPage() {
        return "equipements-list";
    }

    @GetMapping("/interventions")
    public String interventionsPage() {
        return "interventions-list";
    }

    @GetMapping("/company-list")
    public String companiesPage() {
        return "company-list";
    }
}