package com.gmao.app.Service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

import com.gmao.app.Model.DocumentoEquipo;
import com.gmao.app.Model.Equipement;
import com.gmao.app.dto.DocumentoDTO;
import com.gmao.app.Repository.DocumentoEquipoRepository;
import com.gmao.app.Repository.EquipementRepository;
import com.gmao.app.Service.DocumentoEquipoService;

@Service
public class DocumentoEquipoServiceImpl implements DocumentoEquipoService{

    @Autowired
    private DocumentoEquipoRepository documentoRepository;

    @Autowired
    private EquipementRepository equipementRepository;

    @Transactional
    public DocumentoEquipo guardarDocumento(Long equipementId, MultipartFile file) throws IOException {
        Equipement equipement = equipementRepository.findById(equipementId)
                .orElseThrow(() -> new RuntimeException("Equipement no encontrado"));
        DocumentoEquipo doc = new DocumentoEquipo(
                file.getOriginalFilename(),
                file.getContentType(),
                file.getSize(),
                file.getBytes(),
                equipement
        );
        return documentoRepository.save(doc);
    }

    public List<DocumentoDTO> listarDocumentosPorEquipo(Long equipementId) {
        return documentoRepository.findByEquipementIdOrderByFechaSubidaDesc(equipementId)
                .stream()
                .map(d -> new DocumentoDTO(d.getId(), d.getNombreOriginal(), d.getTipoContenido(), d.getTamaño(), d.getFechaSubida()))
                .collect(Collectors.toList());
    }

    public DocumentoEquipo obtenerDocumento(Long documentoId) {
        return documentoRepository.findById(documentoId)
                .orElseThrow(() -> new RuntimeException("Documento no encontrado"));
    }

    @Transactional
    public void eliminarDocumento(Long documentoId) {
        documentoRepository.deleteById(documentoId);
    }
}
