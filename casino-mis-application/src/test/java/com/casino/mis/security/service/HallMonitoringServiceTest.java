package com.casino.mis.security.service;

import com.casino.mis.security.domain.HallMonitoring;
import com.casino.mis.security.dto.HallStatusResponse;
import com.casino.mis.security.repository.ContactEventRepository;
import com.casino.mis.security.repository.HallMonitoringRepository;
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
class HallMonitoringServiceTest {

    @Mock
    private HallMonitoringRepository repository;

    @Mock
    private ContactEventRepository contactEventRepository;

    @InjectMocks
    private HallMonitoringService service;

    private UUID monitoringId;
    private UUID securityOfficerId;
    private HallMonitoring monitoring;

    @BeforeEach
    void setUp() {
        monitoringId = UUID.randomUUID();
        securityOfficerId = UUID.randomUUID();

        monitoring = new HallMonitoring();
        monitoring.setId(monitoringId);
        monitoring.setSecurityOfficerId(securityOfficerId);
        monitoring.setStatus(HallMonitoring.MonitoringStatus.ACTIVE);
    }

    @Test
    void testStartMonitoring() {
        when(repository.save(any(HallMonitoring.class))).thenReturn(monitoring);

        HallMonitoring result = service.startMonitoring(securityOfficerId);

        assertNotNull(result);
        assertEquals(HallMonitoring.MonitoringStatus.ACTIVE, result.getStatus());
        verify(repository, times(1)).save(any(HallMonitoring.class));
    }

    @Test
    void testEndMonitoring() {
        when(repository.findById(monitoringId)).thenReturn(Optional.of(monitoring));
        when(repository.save(any(HallMonitoring.class))).thenReturn(monitoring);

        HallMonitoring result = service.endMonitoring(monitoringId);

        assertNotNull(result);
        assertEquals(HallMonitoring.MonitoringStatus.ENDED, result.getStatus());
        verify(repository, times(1)).findById(monitoringId);
        verify(repository, times(1)).save(any(HallMonitoring.class));
    }

    @Test
    void testEndMonitoringNotFound() {
        when(repository.findById(monitoringId)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> service.endMonitoring(monitoringId));
        verify(repository, times(1)).findById(monitoringId);
    }

    @Test
    void testGetCurrentHallStatus() {
        when(contactEventRepository.findBySuspicious(true)).thenReturn(Collections.emptyList());

        HallStatusResponse result = service.getCurrentHallStatus();

        assertNotNull(result);
        assertNotNull(result.getTotalVisitors());
        assertNotNull(result.getTotalStaff());
        assertNotNull(result.getZones());
        assertNotNull(result.getRecentActivities());
        verify(contactEventRepository, atLeastOnce()).findBySuspicious(true);
    }
}

