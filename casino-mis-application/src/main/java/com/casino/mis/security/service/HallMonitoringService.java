package com.casino.mis.security.service;

import com.casino.mis.security.domain.HallMonitoring;
import com.casino.mis.security.dto.HallStatusResponse;
import com.casino.mis.security.repository.ContactEventRepository;
import com.casino.mis.security.repository.HallMonitoringRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.*;

@Service
public class HallMonitoringService {

    private static final String ZONE_STATUS_NORMAL = "NORMAL";
    
    private final HallMonitoringRepository repository;
    private final ContactEventRepository contactEventRepository;
    // Using SecureRandom for better security in mock data generation
    private final java.security.SecureRandom random = new java.security.SecureRandom();

    public HallMonitoringService(HallMonitoringRepository repository,
                                ContactEventRepository contactEventRepository) {
        this.repository = repository;
        this.contactEventRepository = contactEventRepository;
    }

    // UC1: Мониторинг зала
    @Transactional
    public HallMonitoring startMonitoring(UUID securityOfficerId) {
        HallMonitoring monitoring = new HallMonitoring();
        monitoring.setSecurityOfficerId(securityOfficerId);
        monitoring.setStatus(HallMonitoring.MonitoringStatus.ACTIVE);
        monitoring.setActiveVisitors(0);
        monitoring.setActiveStaff(0);
        monitoring.setAnomaliesDetected(0);
        return repository.save(monitoring);
    }

    @Transactional
    public HallMonitoring endMonitoring(UUID monitoringId) {
        HallMonitoring monitoring = repository.findById(monitoringId)
                .orElseThrow(() -> new RuntimeException("Monitoring session not found: " + monitoringId));
        monitoring.setStatus(HallMonitoring.MonitoringStatus.ENDED);
        monitoring.setEndedAt(OffsetDateTime.now());
        return repository.save(monitoring);
    }

    public HallMonitoring findById(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Monitoring session not found: " + id));
    }

    // UC1: Получение текущего состояния зала (моки данных)
    public HallStatusResponse getCurrentHallStatus() {
        HallStatusResponse status = new HallStatusResponse();
        
        // Моки данных для демонстрации
        status.setTotalVisitors(50 + random.nextInt(50)); // 50-100 посетителей
        status.setTotalStaff(10 + random.nextInt(10)); // 10-20 персонала
        status.setActiveTables(15 + random.nextInt(10)); // 15-25 столов
        
        // Получаем количество аномалий из активных контактов
        long suspiciousContacts = 0;
        try {
            suspiciousContacts = contactEventRepository.findBySuspicious(true).size();
            status.setAnomaliesCount((int) suspiciousContacts);
        } catch (Exception e) {
            status.setAnomaliesCount(0);
        }

        // Моки зон активности
        List<HallStatusResponse.ZoneActivity> zones = Arrays.asList(
            new HallStatusResponse.ZoneActivity("Игровой зал, столы 1-5", 15, 2, ZONE_STATUS_NORMAL),
            new HallStatusResponse.ZoneActivity("Игровой зал, столы 6-10", 20, 3, "HIGH_ACTIVITY"),
            new HallStatusResponse.ZoneActivity("Игровой зал, столы 11-15", 12, 2, ZONE_STATUS_NORMAL),
            new HallStatusResponse.ZoneActivity("Барная зона", 8, 1, ZONE_STATUS_NORMAL),
            new HallStatusResponse.ZoneActivity("Входная зона", 10, 2, suspiciousContacts > 0 ? "ANOMALY" : ZONE_STATUS_NORMAL)
        );
        status.setZones(zones);

        // Последние активности (моки)
        List<HallStatusResponse.RecentActivity> activities = new ArrayList<>(Arrays.asList(
            new HallStatusResponse.RecentActivity("VISITOR_ENTRY", "Посетитель вошёл в зал", "Входная зона", OffsetDateTime.now().minusMinutes(2).toString()),
            new HallStatusResponse.RecentActivity("TABLE_ACTIVITY", "Активность за столом 7", "Игровой зал, стол 7", OffsetDateTime.now().minusMinutes(5).toString()),
            new HallStatusResponse.RecentActivity("STAFF_MOVEMENT", "Персонал переместился", "Игровой зал", OffsetDateTime.now().minusMinutes(10).toString())
        ));
        
        // Добавляем реальные подозрительные контакты, если есть
        int suspiciousCount = status.getAnomaliesCount();
        if (suspiciousCount > 0) {
            activities.add(0, new HallStatusResponse.RecentActivity(
                "SUSPICIOUS_CONTACT",
                "Обнаружено " + suspiciousCount + " подозрительных контактов",
                "Игровой зал",
                OffsetDateTime.now().toString()
            ));
        }
        
        status.setRecentActivities(activities);
        return status;
    }
}

