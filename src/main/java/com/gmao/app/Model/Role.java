package com.gmao.app.Model;

import jakarta.persistence.*;

@Entity
@Table(name = "roles")
public class Role {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "role_id")
    private Long roleId;
    
    @Column(name = "nom", nullable = false, unique = true)
    private String nom;
    
    public Role() {}
    
    public Role(String nom) {
        this.nom = nom;
    }
    
    public Long getRoleId() { return roleId; }
    public void setRoleId(Long roleId) { this.roleId = roleId; }
    
    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }
}