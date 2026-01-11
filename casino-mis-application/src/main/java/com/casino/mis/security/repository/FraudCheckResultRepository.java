package com.casino.mis.security.repository;

import com.casino.mis.security.domain.FraudCheckResult;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface FraudCheckResultRepository extends JpaRepository<FraudCheckResult, UUID> {
    List<FraudCheckResult> findByCheckedPersonId(String checkedPersonId);
    List<FraudCheckResult> findByTriggeredByActivityId(UUID activityId);
    List<FraudCheckResult> findByStatus(FraudCheckResult.CheckStatus status);
}


