package com.casino.mis.finance.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "anomalous_transactions")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class AnomalousTransaction {

    @Id
    @GeneratedValue
    private UUID id;

    private UUID cashOperationId; // Ссылка на транзакцию

    @Enumerated(EnumType.STRING)
    private AnomalyType type;

    @Enumerated(EnumType.STRING)
    private RiskLevel riskLevel;

    @Column(columnDefinition = "TEXT")
    private String reason; // Причина аномалии

    private BigDecimal amount;

    private OffsetDateTime detectedAt = OffsetDateTime.now();

    @Enumerated(EnumType.STRING)
    private AnomalyStatus status = AnomalyStatus.DETECTED;

    private UUID reviewedBy; // Кто проверил

    private OffsetDateTime reviewedAt;

    @Column(columnDefinition = "TEXT")
    private String reviewerNotes;

    public enum AnomalyType {
        LARGE_AMOUNT,        // Слишком большая сумма
        HIGH_FREQUENCY,      // Слишком частая транзакция
        UNUSUAL_TIME,        // Необычное время
        SUSPICIOUS_PATTERN,  // Подозрительный паттерн
        OTHER
    }

    public enum RiskLevel {
        LOW,
        MEDIUM,
        HIGH,
        CRITICAL
    }

    public enum AnomalyStatus {
        DETECTED,
        CONFIRMED,
        REJECTED,
        RESOLVED
    }
}


