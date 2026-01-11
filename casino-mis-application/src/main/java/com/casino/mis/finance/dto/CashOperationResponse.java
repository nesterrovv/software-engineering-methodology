package com.casino.mis.finance.dto;

import com.casino.mis.finance.domain.OperationType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CashOperationResponse {

    private UUID id;
    private UUID cashDeskId;
    private BigDecimal amount;
    private OperationType type;
    private String currency;
    private OffsetDateTime operatedAt;
}


