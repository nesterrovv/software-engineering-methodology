package com.casino.mis.finance.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "cash_operations")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class CashOperation {

    @Id
    @GeneratedValue
    private UUID id;

    private UUID cashDeskId;
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    private OperationType type;

    private String currency = "USD";

    private OffsetDateTime operatedAt = OffsetDateTime.now();
}


