package com.gmao.app.Model;

import java.time.LocalDateTime;
import jakarta.persistence.*;

@Entity
@Table(name = "documentos_equipo")
public class DocumentoEquipo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombreOriginal;

    @Column(nullable = false)
    private String tipoContenido;   // ej. "application/pdf"

    @Column(nullable = false)
    private Long tamaño;             // en bytes

    @Lob
    @Column(nullable = false, columnDefinition = "LONGBLOB")
    private byte[] contenido;

    @Column(nullable = false)
    private LocalDateTime fechaSubida;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "equipement_id", nullable = false)
    private Equipement equipement;

    // Constructores, getters y setters
    public DocumentoEquipo() {}

    public DocumentoEquipo(String nombreOriginal, String tipoContenido, Long tamaño, byte[] contenido, Equipement equipement) {
        this.nombreOriginal = nombreOriginal;
        this.tipoContenido = tipoContenido;
        this.tamaño = tamaño;
        this.contenido = contenido;
        this.equipement = equipement;
        this.fechaSubida = LocalDateTime.now();
    }

    // Getters y setters (generados por tu IDE o Lombok)
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNombreOriginal() { return nombreOriginal; }
    public void setNombreOriginal(String nombreOriginal) { this.nombreOriginal = nombreOriginal; }
    public String getTipoContenido() { return tipoContenido; }
    public void setTipoContenido(String tipoContenido) { this.tipoContenido = tipoContenido; }
    public Long getTamaño() { return tamaño; }
    public void setTamaño(Long tamaño) { this.tamaño = tamaño; }
    public byte[] getContenido() { return contenido; }
    public void setContenido(byte[] contenido) { this.contenido = contenido; }
    public LocalDateTime getFechaSubida() { return fechaSubida; }
    public void setFechaSubida(LocalDateTime fechaSubida) { this.fechaSubida = fechaSubida; }
    public Equipement getEquipement() { return equipement; }
    public void setEquipement(Equipement equipement) { this.equipement = equipement; }
}