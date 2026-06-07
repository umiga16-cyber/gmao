package com.gmao.app.dto;

import java.time.LocalDateTime;

public class DocumentoDTO {
    private Long id;
    private String nombreOriginal;
    private String tipoContenido;
    private Long tamaño;
    private LocalDateTime fechaSubida;

    // Constructor
    public DocumentoDTO(Long id, String nombreOriginal, String tipoContenido, Long tamaño, LocalDateTime fechaSubida) {
        this.id = id;
        this.nombreOriginal = nombreOriginal;
        this.tipoContenido = tipoContenido;
        this.tamaño = tamaño;
        this.fechaSubida = fechaSubida;
    }

    // Getters

    public Long getId() {
        return id;
    }

    public String getNombreOriginal() {
        return nombreOriginal;
    }

    public String getTipoContenido() {
        return tipoContenido;
    }

    public Long getTamaño() {
        return tamaño;
    }

    public LocalDateTime getFechaSubida() {
        return fechaSubida;
    }

    // Setters

    public void setId(Long id) {
        this.id = id;
    }

    public void setNombreOriginal(String nombreOriginal) {
        this.nombreOriginal = nombreOriginal;
    }

    public void setTipoContenido(String tipoContenido) {
        this.tipoContenido = tipoContenido;
    }

    public void setTamaño(Long tamaño) {
        this.tamaño = tamaño;
    }

    public void setFechaSubida(LocalDateTime fechaSubida) {
        this.fechaSubida = fechaSubida;
    }
}