package com.casino.mis.incident.service;

import com.casino.mis.incident.domain.DisciplinaryViolation;
import com.casino.mis.incident.domain.ViolationStatus;
import com.casino.mis.incident.domain.ViolationType;
import com.casino.mis.incident.dto.CreateViolationRequest;
import com.casino.mis.incident.repository.DisciplinaryViolationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.OffsetDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ViolationServiceTest {

    @Mock
    private DisciplinaryViolationRepository repository;

    @InjectMocks
    private ViolationService service;

    private CreateViolationRequest request;
    private DisciplinaryViolation violation;
    private UUID violationId;
    private UUID employeeId;

    @BeforeEach
    void setUp() {
        violationId = UUID.randomUUID();
        employeeId = UUID.randomUUID();

        request = new CreateViolationRequest();
        request.setEmployeeId(employeeId);
        request.setType(ViolationType.LATE);
        request.setDescription("Опоздание на работу");
        request.setAttachmentUrls(Arrays.asList("http://example.com/attachment1.jpg"));

        violation = new DisciplinaryViolation();
        violation.setId(violationId);
        violation.setEmployeeId(employeeId);
        violation.setType(ViolationType.LATE);
        violation.setDescription("Опоздание на работу");
        violation.setStatus(ViolationStatus.OPEN);
        violation.setOccurredAt(OffsetDateTime.now());
    }

    @Test
    void testCreate() {
        when(repository.save(any(DisciplinaryViolation.class))).thenReturn(violation);

        DisciplinaryViolation result = service.create(request);

        assertNotNull(result);
        assertEquals(violationId, result.getId());
        assertEquals(employeeId, result.getEmployeeId());
        assertEquals(ViolationType.LATE, result.getType());
        verify(repository, times(1)).save(any(DisciplinaryViolation.class));
    }

    @Test
    void testAll() {
        List<DisciplinaryViolation> violations = Arrays.asList(violation);
        when(repository.findAll()).thenReturn(violations);

        List<DisciplinaryViolation> result = service.all();

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(violationId, result.get(0).getId());
        verify(repository, times(1)).findAll();
    }

    @Test
    void testGet() {
        when(repository.findById(violationId)).thenReturn(Optional.of(violation));

        DisciplinaryViolation result = service.get(violationId);

        assertNotNull(result);
        assertEquals(violationId, result.getId());
        verify(repository, times(1)).findById(violationId);
    }

    @Test
    void testGetNotFound() {
        when(repository.findById(violationId)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> service.get(violationId));
        verify(repository, times(1)).findById(violationId);
    }

    @Test
    void testFindByEmployeeId() {
        List<DisciplinaryViolation> violations = Arrays.asList(violation);
        when(repository.findByEmployeeId(employeeId)).thenReturn(violations);

        List<DisciplinaryViolation> result = service.findByEmployeeId(employeeId);

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(employeeId, result.get(0).getEmployeeId());
        verify(repository, times(1)).findByEmployeeId(employeeId);
    }
}

