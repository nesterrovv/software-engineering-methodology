package com.casino.mis.finance.dto;

import com.casino.mis.finance.domain.OperationType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CashOperationRequest {

    @NotNull(message = "Cash desk ID is required")
    private UUID cashDeskId;

    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be positive")
    @DecimalMin(value = "0.01", message = "Amount must be at least 0.01")
    private BigDecimal amount;

    @NotNull(message = "Operation type is required")
    private OperationType type;

    @NotBlank(message = "Currency is required")
    private String currency;
}


