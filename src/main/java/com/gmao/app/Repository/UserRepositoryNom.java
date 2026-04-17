package com.gmao.app.Repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.gmao.app.Model.User;

public interface UserRepositoryNom extends JpaRepository<User, Integer> {
    User findByEmail(String email); 
}    
