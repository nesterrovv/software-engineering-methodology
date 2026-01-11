package com.casino.mis.finance.repository;

import com.casino.mis.finance.domain.FinancialReport;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface FinancialReportRepository extends JpaRepository<FinancialReport, UUID> {
}


