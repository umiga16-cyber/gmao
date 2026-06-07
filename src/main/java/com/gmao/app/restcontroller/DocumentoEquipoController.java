package com.gmao.app.restcontroller;

import com.gmao.app.dto.DocumentoDTO;
import com.gmao.app.Model.DocumentoEquipo;
import com.gmao.app.Service.impl.DocumentoEquipoServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api")
public class DocumentoEquipoController {

    @Autowired
    private DocumentoEquipoServiceImpl documentoService;

    // Subir un documento para un equipo
    @PostMapping("/equipements/{equipementId}/documents")
    public ResponseEntity<DocumentoDTO> subirDocumento(
            @PathVariable Long equipementId,
            @RequestParam("file") MultipartFile file) throws IOException {
        DocumentoEquipo doc = documentoService.guardarDocumento(equipementId, file);
        DocumentoDTO dto = new DocumentoDTO(doc.getId(), doc.getNombreOriginal(), doc.getTipoContenido(), doc.getTamaño(), doc.getFechaSubida());
        return ResponseEntity.ok(dto);
    }

    // Listar documentos de un equipo
    @GetMapping("/equipements/{equipementId}/documents")
    public ResponseEntity<List<DocumentoDTO>> listarDocumentos(@PathVariable Long equipementId) {
        return ResponseEntity.ok(documentoService.listarDocumentosPorEquipo(equipementId));
    }

    // Descargar/ver un documento por su ID
    @GetMapping("/documents/{documentoId}")
    public ResponseEntity<byte[]> descargarDocumento(@PathVariable Long documentoId) {
        DocumentoEquipo doc = documentoService.obtenerDocumento(documentoId);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(doc.getTipoContenido()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + doc.getNombreOriginal() + "\"")
                .body(doc.getContenido());
    }

    // Eliminar documento (solo para edición)
    @DeleteMapping("/documents/{documentoId}")
    public ResponseEntity<Void> eliminarDocumento(@PathVariable Long documentoId) {
        documentoService.eliminarDocumento(documentoId);
        return ResponseEntity.noContent().build();
    }
}