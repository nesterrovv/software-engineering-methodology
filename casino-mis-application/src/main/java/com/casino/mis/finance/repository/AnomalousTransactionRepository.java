package com.casino.mis.finance.repository;

import com.casino.mis.finance.domain.AnomalousTransaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public interface AnomalousTransactionRepository extends JpaRepository<AnomalousTransaction, UUID> {
    List<AnomalousTransaction> findByCashOperationId(UUID cashOperationId);
    List<AnomalousTransaction> findByStatus(AnomalousTransaction.AnomalyStatus status);
    List<AnomalousTransaction> findByDetectedAtBetween(OffsetDateTime start, OffsetDateTime end);
    List<AnomalousTransaction> findByRiskLevel(AnomalousTransaction.RiskLevel riskLevel);
}


