package com.casino.mis.security.controller;

import com.casino.mis.security.domain.FraudDatabase;
import com.casino.mis.security.dto.FraudRecordRequest;
import com.casino.mis.security.dto.FraudRecordResponse;
import com.casino.mis.security.service.FraudDatabaseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/security/fraud-database")
@Tag(name = "Fraud Database", description = "UC6: База мошенников - управление записями")
public class FraudDatabaseController {

    private final FraudDatabaseService service;

    public FraudDatabaseController(FraudDatabaseService service) {
        this.service = service;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Добавить запись в базу мошенников", description = "UC6: Добавление новой записи о мошеннике в базу данных")
    public FraudRecordResponse create(@RequestBody @Valid FraudRecordRequest request) {
        return toResponse(service.createRecord(request));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Получить запись", description = "Получение записи из базы мошенников по ID")
    public FraudRecordResponse getById(@PathVariable UUID id) {
        return toResponse(service.findById(id));
    }

    @GetMapping
    @Operation(summary = "Получить все записи", description = "Список всех записей в базе мошенников")
    public List<FraudRecordResponse> getAll() {
        return service.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @GetMapping("/search")
    @Operation(summary = "Поиск в базе", description = "Поиск записей по имени или ID")
    public List<FraudRecordResponse> search(@RequestParam String q) {
        return service.search(q).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @GetMapping("/type/{type}")
    @Operation(summary = "Получить по типу мошенничества", description = "Список записей определённого типа")
    public List<FraudRecordResponse> getByType(@PathVariable FraudDatabase.FraudType type) {
        return service.findByType(type).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Изменить статус записи", description = "Активация/архивирование записи")
    public FraudRecordResponse updateStatus(@PathVariable UUID id, @RequestParam FraudDatabase.FraudStatus status) {
        return toResponse(service.updateStatus(id, status));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Удалить запись", description = "Удаление записи из базы")
    public void delete(@PathVariable UUID id) {
        service.delete(id);
    }

    private FraudRecordResponse toResponse(FraudDatabase record) {
        return new FraudRecordResponse(
                record.getId(),
                record.getPersonId(),
                record.getFullName(),
                record.getDescription(),
                record.getPhotoUrl(),
                record.getFraudType(),
                record.getAddedAt(),
                record.getAddedBy(),
                record.getLastCheckedAt(),
                record.getMatchCount(),
                record.getStatus()
        );
    }
}


