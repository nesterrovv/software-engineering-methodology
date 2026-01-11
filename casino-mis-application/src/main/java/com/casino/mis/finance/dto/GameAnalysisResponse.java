package com.casino.mis.finance.dto;

import com.casino.mis.finance.domain.GameSessionAnalysis;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class GameAnalysisResponse {

    private UUID id;
    private String gameTableId;
    private OffsetDateTime periodStart;
    private OffsetDateTime periodEnd;
    private Long totalSessions;
    private BigDecimal totalBets;
    private BigDecimal totalWins;
    private BigDecimal rtp;
    private BigDecimal expectedRtp;
    private BigDecimal rtpDeviation;
    private Integer largeWinsCount;
    private BigDecimal largestWinAmount;
    private GameSessionAnalysis.AnalysisStatus status;
    private OffsetDateTime analyzedAt;
    private String notes;
}


