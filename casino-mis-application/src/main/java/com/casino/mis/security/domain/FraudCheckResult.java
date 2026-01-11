package com.casino.mis.security.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "fraud_check_results")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class FraudCheckResult {

    @Id
    @GeneratedValue
    private UUID id;

    private UUID fraudRecordId; // ID записи из базы мошенников

    private String checkedPersonId; // ID проверяемого лица

    private OffsetDateTime checkedAt = OffsetDateTime.now();

    @Enumerated(EnumType.STRING)
    private MatchConfidence confidence; // Уровень уверенности в совпадении

    private Double similarityScore; // Оценка схожести (0-100)

    @Column(columnDefinition = "TEXT")
    private String matchDetails; // Детали совпадения

    private UUID triggeredByActivityId; // ID активности, которая инициировала проверку (UC3)

    @Enumerated(EnumType.STRING)
    private CheckStatus status = CheckStatus.MATCH_FOUND;

    public enum MatchConfidence {
        LOW,        // Низкая уверенность
        MEDIUM,     // Средняя уверенность
        HIGH,       // Высокая уверенность
        VERY_HIGH   // Очень высокая уверенность
    }

    public enum CheckStatus {
        MATCH_FOUND,        // Совпадение найдено
        NO_MATCH,           // Совпадений нет
        MANUAL_REVIEW_NEEDED // Требуется ручная проверка
    }
}


