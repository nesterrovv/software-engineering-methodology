package com.casino.mis.staff.service;

import com.casino.mis.staff.client.IncidentServiceClient;
import com.casino.mis.staff.domain.Employee;
import com.casino.mis.staff.domain.ShiftSchedule;
import com.casino.mis.staff.dto.ShiftScheduleRequest;
import com.casino.mis.staff.repository.EmployeeRepository;
import com.casino.mis.staff.repository.ShiftScheduleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ShiftScheduleService {

    private final ShiftScheduleRepository repository;
    private final EmployeeRepository employeeRepository;
    private final IncidentServiceClient incidentServiceClient;

    public ShiftScheduleService(ShiftScheduleRepository repository,
                               EmployeeRepository employeeRepository,
                               IncidentServiceClient incidentServiceClient) {
        this.repository = repository;
        this.employeeRepository = employeeRepository;
        this.incidentServiceClient = incidentServiceClient;
    }

    // UC23: Управление сменами и загрузкой
    @Transactional
    public ShiftSchedule createSchedule(ShiftScheduleRequest request) {
        // Проверяем, что сотрудник существует
        Employee employee = employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new RuntimeException("Employee not found: " + request.getEmployeeId()));

        // UC21: Учитываем прошлые нарушения дисциплины при распределении смен
        checkEmployeeViolations(request.getEmployeeId());

        ShiftSchedule schedule = new ShiftSchedule();
        schedule.setEmployeeId(request.getEmployeeId());
        schedule.setShiftDate(request.getShiftDate());
        schedule.setPlannedStartTime(request.getPlannedStartTime());
        schedule.setPlannedEndTime(request.getPlannedEndTime());
        schedule.setShiftType(request.getShiftType());
        schedule.setLocation(request.getLocation());
        schedule.setCreatedBy(request.getCreatedBy() != null ? request.getCreatedBy() : UUID.randomUUID());
        schedule.setStatus(ShiftSchedule.ShiftStatus.DRAFT);
        schedule.setNotes(request.getNotes());

        return repository.save(schedule);
    }

    // UC23: Публикация графика смен
    @Transactional
    public ShiftSchedule publishSchedule(UUID scheduleId) {
        ShiftSchedule schedule = repository.findById(scheduleId)
                .orElseThrow(() -> new RuntimeException("Shift schedule not found: " + scheduleId));

        schedule.setStatus(ShiftSchedule.ShiftStatus.PUBLISHED);
        schedule.setPublishedAt(java.time.OffsetDateTime.now());

        ShiftSchedule saved = repository.save(schedule);

        // UC20: После публикации смен данные автоматически переходят в систему учёта времени
        // Это означает, что создаются записи в WorkTimeRecord (можно делать при первом clockIn)

        return saved;
    }

    // UC23: Подтверждение смены
    @Transactional
    public ShiftSchedule confirmShift(UUID scheduleId, UUID confirmedBy) {
        ShiftSchedule schedule = repository.findById(scheduleId)
                .orElseThrow(() -> new RuntimeException("Shift schedule not found: " + scheduleId));

        schedule.setStatus(ShiftSchedule.ShiftStatus.CONFIRMED);
        schedule.setConfirmedBy(confirmedBy);
        schedule.setConfirmedAt(java.time.OffsetDateTime.now());

        return repository.save(schedule);
    }

    // UC23: Получение доступности сотрудников с учётом загрузки
    public Map<String, Object> getEmployeeAvailability(LocalDate startDate, LocalDate endDate) {
        Map<String, Object> availability = new HashMap<>();
        
        List<Employee> allEmployees = employeeRepository.findAll();
        List<ShiftSchedule> scheduledShifts = repository.findByShiftDateBetween(startDate, endDate);

        // Подсчитываем количество смен для каждого сотрудника
        Map<UUID, Long> shiftCounts = scheduledShifts.stream()
                .collect(Collectors.groupingBy(
                        ShiftSchedule::getEmployeeId,
                        Collectors.counting()
                ));

        List<Map<String, Object>> employeeAvailability = new ArrayList<>();
        for (Employee employee : allEmployees) {
            if (employee.getStatus() == Employee.EmployeeStatus.ACTIVE) {
                Map<String, Object> empInfo = new HashMap<>();
                empInfo.put("employeeId", employee.getId());
                empInfo.put("name", employee.getFirstName() + " " + employee.getLastName());
                empInfo.put("department", employee.getDepartment());
                empInfo.put("scheduledShifts", shiftCounts.getOrDefault(employee.getId(), 0L));
                
                // UC21: Учитываем нарушения при распределении
                List<Map<String, Object>> violations = incidentServiceClient.getViolationsByEmployee(employee.getId());
                empInfo.put("violationsCount", violations.size());
                
                // Рекомендация: если много нарушений - не назначать на критичные смены
                boolean hasRecentViolations = violations.stream()
                        .anyMatch(v -> {
                            Object occurredAt = v.get("occurredAt");
                            if (occurredAt == null) return false;
                            // Проверка на нарушения за последний месяц
                            return true; // Упрощённая логика
                        });
                empInfo.put("hasRecentViolations", hasRecentViolations);
                
                employeeAvailability.add(empInfo);
            }
        }

        availability.put("employees", employeeAvailability);
        availability.put("totalEmployees", allEmployees.size());
        availability.put("period", Map.of("start", startDate.toString(), "end", endDate.toString()));

        return availability;
    }

    // UC23: Экстренное перераспределение смен
    @Transactional
    public ShiftSchedule reassignShift(UUID scheduleId, UUID newEmployeeId) {
        ShiftSchedule schedule = repository.findById(scheduleId)
                .orElseThrow(() -> new RuntimeException("Shift schedule not found: " + scheduleId));

        // Проверяем доступность нового сотрудника
        checkEmployeeAvailability(newEmployeeId, schedule.getShiftDate());

        schedule.setEmployeeId(newEmployeeId);
        schedule.setStatus(ShiftSchedule.ShiftStatus.DRAFT); // Сбрасываем статус, требуется подтверждение

        return repository.save(schedule);
    }

    private void checkEmployeeViolations(UUID employeeId) {
        List<Map<String, Object>> violations = incidentServiceClient.getViolationsByEmployee(employeeId);
        
        // UC16: Если сотрудник систематически нарушает график, можно предупредить
        if (violations.size() >= 3) {
            System.out.println("Warning: Employee " + employeeId + " has " + violations.size() + 
                    " violations. Consider excluding from schedule or notify HR.");
        }
    }

    private void checkEmployeeAvailability(UUID employeeId, LocalDate shiftDate) {
        List<ShiftSchedule> existingShifts = repository.findByEmployeeIdAndShiftDateBetween(
                employeeId, 
                shiftDate.minusDays(1), 
                shiftDate.plusDays(1)
        );

        if (!existingShifts.isEmpty()) {
            throw new RuntimeException("Employee already has a shift scheduled for this date");
        }

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));
        
        if (employee.getStatus() != Employee.EmployeeStatus.ACTIVE) {
            throw new RuntimeException("Employee is not active: " + employee.getStatus());
        }
    }

    public ShiftSchedule findById(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Shift schedule not found: " + id));
    }

    public List<ShiftSchedule> findByDateRange(LocalDate start, LocalDate end) {
        return repository.findByShiftDateBetween(start, end);
    }

    public List<ShiftSchedule> findByEmployee(UUID employeeId) {
        return repository.findByEmployeeId(employeeId);
    }
}


