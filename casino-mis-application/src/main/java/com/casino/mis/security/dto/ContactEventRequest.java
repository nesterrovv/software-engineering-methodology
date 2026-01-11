package com.casino.mis.security.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ContactEventRequest {
    @NotNull
    private String personId1;
    
    @NotNull
    private String personId2;
    
    @NotNull
    private OffsetDateTime contactStartTime;
    
    private OffsetDateTime contactEndTime;
    
    private String location;
}


