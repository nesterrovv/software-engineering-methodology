package com.casino.mis.finance.dto;

import com.casino.mis.finance.domain.OperationType;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CashOperationRequest {

    @NotNull
    private UUID cashDeskId;

    @NotNull
    private BigDecimal amount;

    @NotNull
    private OperationType type;

    private String currency;
}


