package com.casino.mis.security.dto;

import com.casino.mis.security.domain.FraudDatabase;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FraudRecordRequest {
    @NotNull
    private String personId;
    
    @NotNull
    private String fullName;
    
    private String description;
    private String photoUrl;
    
    @NotNull
    private FraudDatabase.FraudType fraudType;
    
    private UUID addedBy;
}


