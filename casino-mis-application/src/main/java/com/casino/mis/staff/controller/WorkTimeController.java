package com.casino.mis.staff.controller;

import com.casino.mis.staff.domain.WorkTimeRecord;
import com.casino.mis.staff.dto.ClockInRequest;
import com.casino.mis.staff.dto.ClockOutRequest;
import com.casino.mis.staff.dto.WorkTimeRecordResponse;
import com.casino.mis.staff.service.WorkTimeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/staff/work-time")
@Tag(name = "Work Time", description = "UC20: Учёт времени работы сотрудников")
public class WorkTimeController {

    private final WorkTimeService service;

    public WorkTimeController(WorkTimeService service) {
        this.service = service;
    }

    @PostMapping("/clock-in")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Отметка входа", description = "UC20: Сотрудник отмечается на вход. Система записывает время и устройство.")
    public WorkTimeRecordResponse clockIn(@RequestBody @Valid ClockInRequest request) {
        return toResponse(service.clockIn(request));
    }

    @PostMapping("/clock-out")
    @Operation(summary = "Отметка выхода", description = "UC20: Сотрудник отмечается на выход. Система рассчитывает отработанное время и проверяет на опоздания/переработки.")
    public WorkTimeRecordResponse clockOut(@RequestBody @Valid ClockOutRequest request) {
        return toResponse(service.clockOut(request));
    }

    @GetMapping("/employee/{employeeId}")
    @Operation(summary = "Получить записи сотрудника", description = "Получение всех записей учёта времени сотрудника")
    public List<WorkTimeRecordResponse> getEmployeeRecords(
            @PathVariable UUID employeeId,
            @RequestParam(required = false) OffsetDateTime startDate,
            @RequestParam(required = false) OffsetDateTime endDate) {
        return service.getEmployeeRecords(employeeId, startDate, endDate).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Получить запись по ID", description = "Получение конкретной записи учёта времени")
    public WorkTimeRecordResponse getById(@PathVariable UUID id) {
        return toResponse(service.getById(id));
    }

    @PostMapping("/check-missing-clock-outs")
    @Operation(summary = "Проверить отсутствующие отметки выхода", description = "UC20: Проверка открытых смен без отметки выхода. При обнаружении отправляется уведомление HR (UC7).")
    public void checkMissingClockOuts() {
        service.checkMissingClockOuts();
    }

    private WorkTimeRecordResponse toResponse(WorkTimeRecord record) {
        return new WorkTimeRecordResponse(
                record.getId(),
                record.getEmployeeId(),
                record.getClockInTime(),
                record.getClockOutTime(),
                record.getDeviceId(),
                record.getStatus(),
                record.getWorkedMinutes(),
                record.getIsLate(),
                record.getHasOvertime(),
                record.getNotes()
        );
    }
}


