package com.casino.mis.security.repository;

import com.casino.mis.security.domain.ContactEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public interface ContactEventRepository extends JpaRepository<ContactEvent, UUID> {
    List<ContactEvent> findByPersonId1OrPersonId2(String personId1, String personId2);
    List<ContactEvent> findBySuspicious(Boolean suspicious);
    List<ContactEvent> findByContactStartTimeBetween(OffsetDateTime start, OffsetDateTime end);
    
    @Query("SELECT ce FROM ContactEvent ce WHERE " +
           "(ce.personId1 = :personId1 AND ce.personId2 = :personId2) OR " +
           "(ce.personId1 = :personId2 AND ce.personId2 = :personId1) " +
           "ORDER BY ce.contactStartTime DESC")
    List<ContactEvent> findContactsBetweenPersons(@Param("personId1") String personId1, 
                                                   @Param("personId2") String personId2);
}


