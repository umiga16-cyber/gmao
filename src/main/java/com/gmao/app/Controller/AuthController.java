package com.gmao.app.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import com.gmao.app.Model.User;
import com.gmao.app.Service.UserServiceNom;



@Controller
public class AuthController {

    @Autowired
    private UserServiceNom userService;

    @GetMapping("/login")
    public String login() {
        return "login";
    }

    @GetMapping("/dashboard")
    public String dashboard(Model model) {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String email = userDetails.getUsername();
        User user = userService.getUserDetails(email);
        model.addAttribute("userName", user.getNom());
        return "dashboard";
    }

}