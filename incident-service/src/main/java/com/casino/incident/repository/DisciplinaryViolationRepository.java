package com.casino.incident.repository;

import com.casino.incident.domain.DisciplinaryViolation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public interface DisciplinaryViolationRepository extends JpaRepository<DisciplinaryViolation, UUID> {
    
    List<DisciplinaryViolation> findByEmployeeId(UUID employeeId);
    
    List<DisciplinaryViolation> findByEmployeeIdAndOccurredAtBetween(UUID employeeId, OffsetDateTime start, OffsetDateTime end);
    
    @Query("SELECT dv.employeeId, COUNT(dv) as count FROM DisciplinaryViolation dv WHERE dv.occurredAt BETWEEN :start AND :end GROUP BY dv.employeeId HAVING COUNT(dv) >= :threshold")
    List<Object[]> findEmployeesWithRepeatedViolations(@Param("start") OffsetDateTime start, 
                                                         @Param("end") OffsetDateTime end, 
                                                         @Param("threshold") Long threshold);
}
