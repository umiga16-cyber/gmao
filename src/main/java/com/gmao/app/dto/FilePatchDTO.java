package com.gmao.app.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

@Schema(description = "DTO for patching an existing file")
public class FilePatchDTO {
    @Schema(description = "Name")
    @NotNull
    private String name;
}
