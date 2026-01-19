package com.casino.mis.reference.dto;

/**
 * DTO для справочной информации об игровом столе
 */
public class GameTableInfo {
    private String id;
    private String name;
    private String gameType;
    private String location;
    private String status;

    public GameTableInfo() {
    }

    public GameTableInfo(String id, String name, String gameType, String location, String status) {
        this.id = id;
        this.name = name;
        this.gameType = gameType;
        this.location = location;
        this.status = status;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getGameType() {
        return gameType;
    }

    public void setGameType(String gameType) {
        this.gameType = gameType;
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
