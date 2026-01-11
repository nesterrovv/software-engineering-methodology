package com.casino.mis.finance.repository;

import com.casino.mis.finance.domain.GameSessionAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface GameSessionAnalysisRepository extends JpaRepository<GameSessionAnalysis, UUID> {
    List<GameSessionAnalysis> findByGameTableId(String gameTableId);
    List<GameSessionAnalysis> findByPeriodStartBetween(java.time.OffsetDateTime start, java.time.OffsetDateTime end);
}


