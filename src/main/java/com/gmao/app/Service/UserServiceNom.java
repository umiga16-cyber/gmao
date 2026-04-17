package com.gmao.app.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.gmao.app.Model.User;
import com.gmao.app.Repository.UserRepositoryNom;

@Service
public class UserServiceNom  {

    @Autowired
    private UserRepositoryNom userRepository;

    public User getUserDetails(String email) {
        // Suponiendo que el email es único para cada usuario
        return userRepository.findByEmail(email);
    }
}
    
