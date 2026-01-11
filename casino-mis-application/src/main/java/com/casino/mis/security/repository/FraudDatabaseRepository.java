package com.casino.mis.security.repository;

import com.casino.mis.security.domain.FraudDatabase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FraudDatabaseRepository extends JpaRepository<FraudDatabase, UUID> {
    Optional<FraudDatabase> findByPersonId(String personId);
    List<FraudDatabase> findByFraudType(FraudDatabase.FraudType fraudType);
    List<FraudDatabase> findByStatus(FraudDatabase.FraudStatus status);
    
    @Query("SELECT f FROM FraudDatabase f WHERE " +
           "f.status = 'ACTIVE' AND (" +
           "LOWER(f.fullName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "f.personId LIKE CONCAT('%', :searchTerm, '%'))")
    List<FraudDatabase> search(@Param("searchTerm") String searchTerm);
}


