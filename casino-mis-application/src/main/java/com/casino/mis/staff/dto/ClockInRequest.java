package com.casino.mis.staff.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ClockInRequest {
    @NotNull
    private UUID employeeId;
    
    private String deviceId; // ID терминала доступа
}


