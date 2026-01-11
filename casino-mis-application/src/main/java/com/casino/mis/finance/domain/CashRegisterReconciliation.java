package com.casino.mis.finance.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "cash_register_reconciliations")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class CashRegisterReconciliation {

    @Id
    @GeneratedValue
    private UUID id;

    private UUID cashDeskId;

    private OffsetDateTime shiftStart;

    private OffsetDateTime shiftEnd;

    private BigDecimal expectedBalance; // Рассчитанный баланс

    private BigDecimal actualBalance; // Фактический баланс

    private BigDecimal discrepancy; // Расхождение

    @Enumerated(EnumType.STRING)
    private ReconciliationStatus status = ReconciliationStatus.PENDING;

    private OffsetDateTime createdAt = OffsetDateTime.now();

    @Column(columnDefinition = "TEXT")
    private String notes;

    public enum ReconciliationStatus {
        PENDING,
        CONFIRMED,
        DISCREPANCY_FOUND,
        RESOLVED
    }
}


