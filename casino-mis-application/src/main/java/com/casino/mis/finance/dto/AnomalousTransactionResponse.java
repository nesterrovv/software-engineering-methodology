package com.casino.mis.finance.dto;

import com.casino.mis.finance.domain.AnomalousTransaction;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AnomalousTransactionResponse {

    private UUID id;
    private UUID cashOperationId;
    private AnomalousTransaction.AnomalyType type;
    private AnomalousTransaction.RiskLevel riskLevel;
    private String reason;
    private BigDecimal amount;
    private OffsetDateTime detectedAt;
    private AnomalousTransaction.AnomalyStatus status;
    private UUID reviewedBy;
    private OffsetDateTime reviewedAt;
    private String reviewerNotes;
}


