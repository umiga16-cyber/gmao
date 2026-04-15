package com.gmao.app.dto;

import java.util.List;

public class EquipementTreeResponse {
    private Long id;
    private String code;
    private String description;
    private String type;
    private String statut;
    private List<EquipementTreeResponse> children;
	public Long getId() {
		return id;
	}
	public void setId(Long id) {
		this.id = id;
	}
	public String getCode() {
		return code;
	}
	public void setCode(String code) {
		this.code = code;
	}
	public String getDescription() {
		return description;
	}
	public void setDescription(String description) {
		this.description = description;
	}
	public String getType() {
		return type;
	}
	public void setType(String type) {
		this.type = type;
	}
	public String getStatut() {
		return statut;
	}
	public void setStatut(String statut) {
		this.statut = statut;
	}
	public List<EquipementTreeResponse> getChildren() {
		return children;
	}
	public void setChildren(List<EquipementTreeResponse> children) {
		this.children = children;
	}
    
    
}