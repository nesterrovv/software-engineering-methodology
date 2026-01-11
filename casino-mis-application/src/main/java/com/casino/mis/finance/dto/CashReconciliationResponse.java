package com.casino.mis.finance.dto;

import com.casino.mis.finance.domain.CashRegisterReconciliation;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CashReconciliationResponse {

    private UUID id;
    private UUID cashDeskId;
    private OffsetDateTime shiftStart;
    private OffsetDateTime shiftEnd;
    private BigDecimal expectedBalance;
    private BigDecimal actualBalance;
    private BigDecimal discrepancy;
    private CashRegisterReconciliation.ReconciliationStatus status;
    private OffsetDateTime createdAt;
    private String notes;
}


