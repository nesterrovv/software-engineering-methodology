package com.casino.incident.repository;

import com.casino.incident.domain.Complaint;
import com.casino.incident.domain.ComplaintCategory;
import com.casino.incident.domain.ComplaintSource;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public interface ComplaintRepository extends JpaRepository<Complaint, UUID> {
    
    List<Complaint> findByReportedAtBetween(OffsetDateTime start, OffsetDateTime end);
    
    List<Complaint> findByCategory(ComplaintCategory category);
    
    List<Complaint> findBySource(ComplaintSource source);
    
    List<Complaint> findByReportedAtBetweenAndCategory(OffsetDateTime start, OffsetDateTime end, ComplaintCategory category);
}


