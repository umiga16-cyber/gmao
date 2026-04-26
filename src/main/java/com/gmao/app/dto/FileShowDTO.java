package com.gmao.app.dto;

import com.gmao.app.Model.enums.FileType;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "DTO for displaying file details in API responses")
public class FileShowDTO {
    @Schema(description = "Name")
    private String name;

    @Schema(description = "File URL")
    private String url;

    @Schema(description = "File type")
    private FileType type = FileType.OTHER;

    @Schema(description = "Indicates whether the file is hidden")
    private boolean hidden = false;

}