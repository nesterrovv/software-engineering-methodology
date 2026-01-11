package com.casino.incident.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RepeatedViolationsRequest {

    private OffsetDateTime periodStart;
    
    private OffsetDateTime periodEnd;
    
    private Long threshold = 3L; // Пороговое значение нарушений
}


