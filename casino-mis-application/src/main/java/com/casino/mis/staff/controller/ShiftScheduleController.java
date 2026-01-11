package com.casino.mis.staff.controller;

import com.casino.mis.staff.domain.ShiftSchedule;
import com.casino.mis.staff.dto.ShiftScheduleRequest;
import com.casino.mis.staff.dto.ShiftScheduleResponse;
import com.casino.mis.staff.service.ShiftScheduleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/staff/shifts")
@Tag(name = "Shift Management", description = "UC23: Управление сменами и загрузкой")
public class ShiftScheduleController {

    private final ShiftScheduleService service;

    public ShiftScheduleController(ShiftScheduleService service) {
        this.service = service;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Создать расписание смены", description = "UC23: Создание расписания смены с учётом загрузки, отпусков и нарушений дисциплины")
    public ShiftScheduleResponse create(@RequestBody @Valid ShiftScheduleRequest request) {
        return toResponse(service.createSchedule(request));
    }

    @PostMapping("/{id}/publish")
    @Operation(summary = "Опубликовать график смены", description = "UC23: Публикация графика смены. После публикации данные переходят в систему учёта времени (UC20).")
    public ShiftScheduleResponse publish(@PathVariable UUID id) {
        return toResponse(service.publishSchedule(id));
    }

    @PostMapping("/{id}/confirm")
    @Operation(summary = "Подтвердить смену", description = "Подтверждение смены менеджером или сотрудником")
    public ShiftScheduleResponse confirm(@PathVariable UUID id, @RequestParam UUID confirmedBy) {
        return toResponse(service.confirmShift(id, confirmedBy));
    }

    @PostMapping("/{id}/reassign")
    @Operation(summary = "Перераспределить смену", description = "UC23: Экстренное перераспределение смены другому сотруднику")
    public ShiftScheduleResponse reassign(@PathVariable UUID id, @RequestParam UUID newEmployeeId) {
        return toResponse(service.reassignShift(id, newEmployeeId));
    }

    @GetMapping("/availability")
    @Operation(summary = "Получить доступность сотрудников", description = "UC23: Получение информации о доступности и загрузке сотрудников с учётом нарушений")
    public Map<String, Object> getAvailability(
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate) {
        return service.getEmployeeAvailability(startDate, endDate);
    }

    @GetMapping("/employee/{employeeId}")
    @Operation(summary = "Получить смены сотрудника", description = "Получение всех смен конкретного сотрудника")
    public List<ShiftScheduleResponse> getByEmployee(@PathVariable UUID employeeId) {
        return service.findByEmployee(employeeId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @GetMapping
    @Operation(summary = "Получить смены по периоду", description = "Получение смен за указанный период")
    public List<ShiftScheduleResponse> getByDateRange(
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate) {
        return service.findByDateRange(startDate, endDate).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Получить смену по ID", description = "Получение информации о конкретной смене")
    public ShiftScheduleResponse getById(@PathVariable UUID id) {
        return toResponse(service.findById(id));
    }

    private ShiftScheduleResponse toResponse(ShiftSchedule schedule) {
        return new ShiftScheduleResponse(
                schedule.getId(),
                schedule.getEmployeeId(),
                schedule.getShiftDate(),
                schedule.getPlannedStartTime(),
                schedule.getPlannedEndTime(),
                schedule.getStatus(),
                schedule.getShiftType(),
                schedule.getLocation(),
                schedule.getCreatedBy(),
                schedule.getCreatedAt(),
                schedule.getPublishedAt(),
                schedule.getConfirmedBy(),
                schedule.getConfirmedAt(),
                schedule.getNotes()
        );
    }
}


