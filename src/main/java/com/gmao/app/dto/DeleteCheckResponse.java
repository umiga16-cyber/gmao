package com.gmao.app.dto;

public class DeleteCheckResponse {

    private boolean canDelete;
    private String message;

    public DeleteCheckResponse(boolean canDelete, String message) {
        this.canDelete = canDelete;
        this.message = message;
    }

    public boolean isCanDelete() {
        return canDelete;
    }

    public String getMessage() {
        return message;
    }
}