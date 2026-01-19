package com.casino.mis.reference.dto;

import java.util.UUID;

/**
 * DTO для справочной информации о кассе
 */
public class CashDeskInfo {
    private UUID id;
    private String name;
    private String location;
    private String status;

    public CashDeskInfo() {
    }

    public CashDeskInfo(UUID id, String name, String location, String status) {
        this.id = id;
        this.name = name;
        this.location = location;
        this.status = status;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
