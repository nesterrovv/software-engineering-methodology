package com.casino.finance.repository;

import com.casino.finance.domain.CashOperation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public interface CashOperationRepository extends JpaRepository<CashOperation, UUID> {

    List<CashOperation> findByOperatedAtBetween(OffsetDateTime from, OffsetDateTime to);

}
