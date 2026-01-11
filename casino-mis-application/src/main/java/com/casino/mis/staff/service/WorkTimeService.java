package com.casino.mis.staff.service;

import com.casino.mis.staff.client.SecurityServiceClient;
import com.casino.mis.staff.domain.WorkTimeRecord;
import com.casino.mis.staff.dto.ClockInRequest;
import com.casino.mis.staff.dto.ClockOutRequest;
import com.casino.mis.staff.repository.WorkTimeRecordRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.*;

@Service
public class WorkTimeService {

    private final WorkTimeRecordRepository repository;
    private final SecurityServiceClient securityServiceClient;

    // Стандартные параметры
    private static final int STANDARD_WORK_HOURS = 8; // 8 часов в смену
    private static final int LATE_THRESHOLD_MINUTES = 10; // Порог опоздания
    private static final int OVERTIME_THRESHOLD_HOURS = 8; // Порог переработки

    public WorkTimeService(WorkTimeRecordRepository repository,
                          SecurityServiceClient securityServiceClient) {
        this.repository = repository;
        this.securityServiceClient = securityServiceClient;
    }

    // UC20: Учёт времени работы сотрудников - отметка входа
    @Transactional
    public WorkTimeRecord clockIn(ClockInRequest request) {
        // Проверяем, нет ли открытой смены
        Optional<WorkTimeRecord> openShift = repository.findByEmployeeIdAndStatus(
                request.getEmployeeId(), 
                WorkTimeRecord.RecordStatus.OPEN
        );

        if (openShift.isPresent()) {
            throw new RuntimeException("Employee already has an open shift. Please clock out first.");
        }

        WorkTimeRecord record = new WorkTimeRecord();
        record.setEmployeeId(request.getEmployeeId());
        record.setClockInTime(OffsetDateTime.now());
        record.setDeviceId(request.getDeviceId());
        record.setStatus(WorkTimeRecord.RecordStatus.OPEN);

        return repository.save(record);
    }

    // UC20: Отметка выхода
    @Transactional
    public WorkTimeRecord clockOut(ClockOutRequest request) {
        WorkTimeRecord record = repository.findByEmployeeIdAndStatus(
                request.getEmployeeId(), 
                WorkTimeRecord.RecordStatus.OPEN
        ).orElseThrow(() -> new RuntimeException("No open shift found for employee"));

        record.setClockOutTime(OffsetDateTime.now());
        
        // Рассчитываем отработанное время
        Duration duration = Duration.between(record.getClockInTime(), record.getClockOutTime());
        long workedMinutes = duration.toMinutes();
        record.setWorkedMinutes(workedMinutes);

        // Проверяем на опоздание (если есть запланированная смена - можно сравнить)
        // Для простоты - считаем опозданием, если вход после 9:00
        OffsetDateTime clockIn = record.getClockInTime();
        if (clockIn.getHour() >= 9 && clockIn.getMinute() > LATE_THRESHOLD_MINUTES) {
            record.setIsLate(true);
        }

        // Проверяем на переработку (более 8 часов)
        if (workedMinutes > (OVERTIME_THRESHOLD_HOURS * 60)) {
            record.setHasOvertime(true);
        }

        record.setStatus(WorkTimeRecord.RecordStatus.CLOSED);
        
        WorkTimeRecord saved = repository.save(record);
        
        // Данные передаются в зарплатный модуль (мок - в реальности через интеграцию)
        // Это может быть вызов другого сервиса через Feign
        
        return saved;
    }

    // UC20: Проверка открытых смен без отметки выхода (для уведомления HR)
    @Transactional
    public void checkMissingClockOuts() {
        List<WorkTimeRecord> openShifts = repository.findByStatus(WorkTimeRecord.RecordStatus.OPEN);
        
        // Проверяем смены старше 12 часов без отметки выхода
        OffsetDateTime threshold = OffsetDateTime.now().minusHours(12);
        
        for (WorkTimeRecord record : openShifts) {
            if (record.getClockInTime().isBefore(threshold)) {
                record.setStatus(WorkTimeRecord.RecordStatus.MISSING_CLOCK_OUT);
                repository.save(record);
                
                // UC7: Уведомление HR через Security Service
                try {
                    Map<String, Object> notification = new HashMap<>();
                    notification.put("recipientId", UUID.randomUUID()); // HR department ID
                    notification.put("type", "SYSTEM_ALERT");
                    notification.put("title", "Отсутствует отметка выхода");
                    notification.put("message", "Сотрудник " + record.getEmployeeId() + 
                            " не отметился на выходе. Смена открыта с " + record.getClockInTime());
                    notification.put("priority", "HIGH");
                    notification.put("relatedEntityType", "WORK_TIME_RECORD");
                    notification.put("relatedEntityId", record.getId());
                    
                    securityServiceClient.createNotification(notification);
                } catch (Exception e) {
                    // Логируем ошибку, но не прерываем процесс
                    System.err.println("Failed to send notification: " + e.getMessage());
                }
            }
        }
    }

    public List<WorkTimeRecord> getEmployeeRecords(UUID employeeId, OffsetDateTime start, OffsetDateTime end) {
        if (start != null && end != null) {
            return repository.findByEmployeeIdAndClockInTimeBetween(employeeId, start, end);
        }
        return repository.findByEmployeeId(employeeId);
    }

    public WorkTimeRecord getById(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Work time record not found: " + id));
    }
}


