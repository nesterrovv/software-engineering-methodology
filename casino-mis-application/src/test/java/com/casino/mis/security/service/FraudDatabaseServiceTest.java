package com.casino.mis.security.service;

import com.casino.mis.security.domain.FraudDatabase;
import com.casino.mis.security.dto.FraudRecordRequest;
import com.casino.mis.security.repository.FraudDatabaseRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FraudDatabaseServiceTest {

    @Mock
    private FraudDatabaseRepository repository;

    @InjectMocks
    private FraudDatabaseService service;

    private FraudRecordRequest request;
    private FraudDatabase fraudRecord;
    private UUID recordId;
    private UUID addedBy;

    @BeforeEach
    void setUp() {
        recordId = UUID.randomUUID();
        addedBy = UUID.randomUUID();

        request = new FraudRecordRequest();
        request.setPersonId("PERSON_001");
        request.setFullName("Иван Иванов");
        request.setDescription("Известный мошенник");
        request.setFraudType(FraudDatabase.FraudType.CHEATING);
        request.setAddedBy(addedBy);

        fraudRecord = new FraudDatabase();
        fraudRecord.setId(recordId);
        fraudRecord.setPersonId("PERSON_001");
        fraudRecord.setFullName("Иван Иванов");
        fraudRecord.setDescription("Известный мошенник");
        fraudRecord.setFraudType(FraudDatabase.FraudType.CHEATING);
        fraudRecord.setStatus(FraudDatabase.FraudStatus.ACTIVE);
        fraudRecord.setAddedBy(addedBy);
    }

    @Test
    void testCreateRecord() {
        when(repository.save(any(FraudDatabase.class))).thenReturn(fraudRecord);

        FraudDatabase result = service.createRecord(request);

        assertNotNull(result);
        assertEquals(recordId, result.getId());
        assertEquals("PERSON_001", result.getPersonId());
        assertEquals(FraudDatabase.FraudStatus.ACTIVE, result.getStatus());
        verify(repository, times(1)).save(any(FraudDatabase.class));
    }

    @Test
    void testCreateRecordWithNullAddedBy() {
        request.setAddedBy(null);
        when(repository.save(any(FraudDatabase.class))).thenReturn(fraudRecord);

        FraudDatabase result = service.createRecord(request);

        assertNotNull(result);
        verify(repository, times(1)).save(any(FraudDatabase.class));
    }

    @Test
    void testFindById() {
        when(repository.findById(recordId)).thenReturn(Optional.of(fraudRecord));

        FraudDatabase result = service.findById(recordId);

        assertNotNull(result);
        assertEquals(recordId, result.getId());
        verify(repository, times(1)).findById(recordId);
    }

    @Test
    void testFindByIdNotFound() {
        when(repository.findById(recordId)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> service.findById(recordId));
        verify(repository, times(1)).findById(recordId);
    }

    @Test
    void testFindAll() {
        List<FraudDatabase> fraudRecords = Arrays.asList(fraudRecord);
        when(repository.findAll()).thenReturn(fraudRecords);

        List<FraudDatabase> result = service.findAll();

        assertNotNull(result);
        assertEquals(1, result.size());
        verify(repository, times(1)).findAll();
    }

    @Test
    void testFindByType() {
        List<FraudDatabase> fraudRecords = Arrays.asList(fraudRecord);
        when(repository.findByFraudType(FraudDatabase.FraudType.CHEATING)).thenReturn(fraudRecords);

        List<FraudDatabase> result = service.findByType(FraudDatabase.FraudType.CHEATING);

        assertNotNull(result);
        assertEquals(1, result.size());
        verify(repository, times(1)).findByFraudType(FraudDatabase.FraudType.CHEATING);
    }

    @Test
    void testSearch() {
        List<FraudDatabase> fraudRecords = Arrays.asList(fraudRecord);
        when(repository.search("Иван")).thenReturn(fraudRecords);

        List<FraudDatabase> result = service.search("Иван");

        assertNotNull(result);
        assertEquals(1, result.size());
        verify(repository, times(1)).search("Иван");
    }

    @Test
    void testUpdateStatus() {
        when(repository.findById(recordId)).thenReturn(Optional.of(fraudRecord));
        when(repository.save(any(FraudDatabase.class))).thenReturn(fraudRecord);

        FraudDatabase result = service.updateStatus(recordId, FraudDatabase.FraudStatus.ARCHIVED);

        assertNotNull(result);
        verify(repository, times(1)).findById(recordId);
        verify(repository, times(1)).save(any(FraudDatabase.class));
    }

    @Test
    void testDelete() {
        doNothing().when(repository).deleteById(recordId);

        service.delete(recordId);

        verify(repository, times(1)).deleteById(recordId);
    }
}

