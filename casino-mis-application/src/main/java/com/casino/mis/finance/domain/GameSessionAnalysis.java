package com.casino.mis.finance.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "game_session_analyses")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class GameSessionAnalysis {

    @Id
    @GeneratedValue
    private UUID id;

    private String gameTableId; // ID стола или автомата

    private OffsetDateTime periodStart;

    private OffsetDateTime periodEnd;

    private Long totalSessions; // Общее количество игровых сессий

    private BigDecimal totalBets; // Суммарные ставки

    private BigDecimal totalWins; // Суммарные выигрыши

    private BigDecimal rtp; // Return to Player (%)

    private BigDecimal expectedRtp; // Ожидаемый RTP

    private BigDecimal rtpDeviation; // Отклонение RTP

    private Integer largeWinsCount; // Количество крупных выигрышей

    private BigDecimal largestWinAmount; // Самый крупный выигрыш

    @Enumerated(EnumType.STRING)
    private AnalysisStatus status = AnalysisStatus.COMPLETED;

    private OffsetDateTime analyzedAt = OffsetDateTime.now();

    @Column(columnDefinition = "TEXT")
    private String notes;

    public enum AnalysisStatus {
        PENDING,
        PROCESSING,
        COMPLETED,
        ERROR
    }
}


