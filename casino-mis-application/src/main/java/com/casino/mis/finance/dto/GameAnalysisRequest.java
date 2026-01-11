package com.casino.mis.finance.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class GameAnalysisRequest {

    @NotNull
    private OffsetDateTime periodStart;
    
    @NotNull
    private OffsetDateTime periodEnd;
    
    private String gameTableId; // Если null - анализ по всем столам/автоматам
    
    private BigDecimal expectedRtp = new BigDecimal("95.0"); // Ожидаемый RTP в процентах
    
    private BigDecimal largeWinThreshold = new BigDecimal("1000"); // Порог для крупных выигрышей
}

