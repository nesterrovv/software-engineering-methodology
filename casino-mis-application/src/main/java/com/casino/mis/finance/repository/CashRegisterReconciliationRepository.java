package com.casino.mis.finance.repository;

import com.casino.mis.finance.domain.CashRegisterReconciliation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CashRegisterReconciliationRepository extends JpaRepository<CashRegisterReconciliation, UUID> {
    List<CashRegisterReconciliation> findByCashDeskId(UUID cashDeskId);
    List<CashRegisterReconciliation> findByStatus(CashRegisterReconciliation.ReconciliationStatus status);
}


