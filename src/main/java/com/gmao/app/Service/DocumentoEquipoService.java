package com.gmao.app.Service;

import java.io.IOException;

import org.springframework.web.multipart.MultipartFile;

import com.gmao.app.Model.DocumentoEquipo;

public interface DocumentoEquipoService {
    DocumentoEquipo guardarDocumento(Long equipementId, MultipartFile file) throws IOException;
    
}
