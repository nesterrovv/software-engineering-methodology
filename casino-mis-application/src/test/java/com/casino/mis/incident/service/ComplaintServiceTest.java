package com.casino.mis.incident.service;

import com.casino.mis.incident.domain.Complaint;
import com.casino.mis.incident.domain.ComplaintCategory;
import com.casino.mis.incident.domain.ComplaintSource;
import com.casino.mis.incident.domain.ComplaintStatus;
import com.casino.mis.incident.dto.CreateComplaintRequest;
import com.casino.mis.incident.repository.ComplaintRepository;
import com.casino.mis.security.HtmlSanitizer;
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
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ComplaintServiceTest {

    @Mock
    private ComplaintRepository repository;

    @Mock
    private HtmlSanitizer htmlSanitizer;

    @InjectMocks
    private ComplaintService service;

    private CreateComplaintRequest request;
    private Complaint complaint;
    private UUID complaintId;

    @BeforeEach
    void setUp() {
        complaintId = UUID.randomUUID();

        request = new CreateComplaintRequest();
        request.setDescription("Жалоба на обслуживание");
        request.setCategory(ComplaintCategory.SERVICE_QUALITY);
        request.setSource(ComplaintSource.VISITOR);

        complaint = new Complaint();
        complaint.setId(complaintId);
        complaint.setDescription("Жалоба на обслуживание");
        complaint.setCategory(ComplaintCategory.SERVICE_QUALITY);
        complaint.setSource(ComplaintSource.VISITOR);
        complaint.setStatus(ComplaintStatus.OPEN);
        complaint.setReportedAt(OffsetDateTime.now());
        
        // Mock HtmlSanitizer to return the same string (pass-through)
        // Using lenient() to avoid UnnecessaryStubbingException for tests that don't call create()
        lenient().when(htmlSanitizer.sanitizeToPlainText(anyString())).thenAnswer(invocation -> invocation.getArgument(0));
    }

    @Test
    void testCreate() {
        when(repository.save(any(Complaint.class))).thenReturn(complaint);

        Complaint result = service.create(request);

        assertNotNull(result);
        assertEquals(complaintId, result.getId());
        assertEquals(ComplaintCategory.SERVICE_QUALITY, result.getCategory());
        verify(repository, times(1)).save(any(Complaint.class));
    }

    @Test
    void testFindAll() {
        List<Complaint> complaints = Arrays.asList(complaint);
        when(repository.findAll()).thenReturn(complaints);

        List<Complaint> result = service.findAll();

        assertNotNull(result);
        assertEquals(1, result.size());
        verify(repository, times(1)).findAll();
    }

    @Test
    void testFindById() {
        when(repository.findById(complaintId)).thenReturn(Optional.of(complaint));

        Complaint result = service.findById(complaintId);

        assertNotNull(result);
        assertEquals(complaintId, result.getId());
        verify(repository, times(1)).findById(complaintId);
    }

    @Test
    void testFindByIdNotFound() {
        when(repository.findById(complaintId)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> service.findById(complaintId));
        verify(repository, times(1)).findById(complaintId);
    }

    @Test
    void testFindByCategory() {
        List<Complaint> complaints = Arrays.asList(complaint);
        when(repository.findByCategory(ComplaintCategory.SERVICE_QUALITY)).thenReturn(complaints);

        List<Complaint> result = service.findByCategory(ComplaintCategory.SERVICE_QUALITY);

        assertNotNull(result);
        assertEquals(1, result.size());
        verify(repository, times(1)).findByCategory(ComplaintCategory.SERVICE_QUALITY);
    }

    @Test
    void testUpdateStatus() {
        when(repository.findById(complaintId)).thenReturn(Optional.of(complaint));
        when(repository.save(any(Complaint.class))).thenReturn(complaint);

        Complaint result = service.updateStatus(complaintId, ComplaintStatus.RESOLVED);

        assertNotNull(result);
        verify(repository, times(1)).findById(complaintId);
        verify(repository, times(1)).save(any(Complaint.class));
    }
}

