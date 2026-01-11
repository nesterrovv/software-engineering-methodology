package com.casino.mis.staff.repository;

import com.casino.mis.staff.domain.WorkTimeRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface WorkTimeRecordRepository extends JpaRepository<WorkTimeRecord, UUID> {
    List<WorkTimeRecord> findByEmployeeId(UUID employeeId);
    List<WorkTimeRecord> findByEmployeeIdAndClockInTimeBetween(UUID employeeId, OffsetDateTime start, OffsetDateTime end);
    Optional<WorkTimeRecord> findByEmployeeIdAndStatus(UUID employeeId, WorkTimeRecord.RecordStatus status);
    List<WorkTimeRecord> findByStatus(WorkTimeRecord.RecordStatus status);
}


