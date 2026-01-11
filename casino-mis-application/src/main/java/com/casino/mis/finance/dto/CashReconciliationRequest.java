package com.casino.mis.finance.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CashReconciliationRequest {

    @NotNull
    private UUID cashDeskId;

    @NotNull
    private OffsetDateTime shiftStart;

    @NotNull
    private OffsetDateTime shiftEnd;

    @NotNull
    private BigDecimal actualBalance;

    private String notes;
}


