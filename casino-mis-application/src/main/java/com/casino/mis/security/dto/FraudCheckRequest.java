package com.casino.mis.security.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FraudCheckRequest {
    @NotNull
    private String personId;
    
    private String photoUrl; // Опционально для сравнения по фото
    
    private UUID triggeredByActivityId; // ID активности из UC3
}


