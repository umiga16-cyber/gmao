package com.gmao.app.GlobalModelAttributes;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ModelAttribute;
import com.gmao.app.Repository.UserRepository;

@ControllerAdvice
public class ObtUserName {

    private final UserRepository userRepository;

    public ObtUserName(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @ModelAttribute("username")
    public String username() {

        Authentication auth =
                SecurityContextHolder.getContext().getAuthentication();

        String email = auth.getName();
        
        return userRepository.findRoleNameByEmail(email);
    }
}
