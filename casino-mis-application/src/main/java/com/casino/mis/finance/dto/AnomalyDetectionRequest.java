package com.casino.mis.finance.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AnomalyDetectionRequest {

    private OffsetDateTime periodStart;
    
    private OffsetDateTime periodEnd;
    
    private BigDecimal largeAmountThreshold = new BigDecimal("10000"); // Порог для крупных сумм
    
    private Integer frequencyThreshold = 10; // Порог частоты транзакций за период
    
    private Long timeWindowMinutes = 60L; // Окно времени для проверки частоты
}


