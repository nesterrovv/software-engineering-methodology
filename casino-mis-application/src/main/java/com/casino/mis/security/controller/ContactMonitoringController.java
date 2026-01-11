package com.casino.mis.security.controller;

import com.casino.mis.security.domain.ContactEvent;
import com.casino.mis.security.dto.ContactEventRequest;
import com.casino.mis.security.dto.ContactEventResponse;
import com.casino.mis.security.service.ContactMonitoringService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/security/contacts")
@Tag(name = "Contact Monitoring", description = "UC4, UC5: Контроль длительности и частоты контактов")
public class ContactMonitoringController {

    private final ContactMonitoringService service;

    public ContactMonitoringController(ContactMonitoringService service) {
        this.service = service;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Зарегистрировать контакт", description = "UC4: Регистрация события контакта между двумя лицами. Автоматически проверяется длительность.")
    public ContactEventResponse registerContact(@RequestBody @Valid ContactEventRequest request) {
        return toResponse(service.registerContact(request));
    }

    @PostMapping("/check-frequency")
    @Operation(summary = "Проверить частоту взаимодействий", description = "UC5: Проверка частоты контактов между двумя лицами. При превышении лимита создаётся подозрительная активность.")
    public void checkFrequency(@RequestParam String personId1, @RequestParam String personId2) {
        service.checkInteractionFrequency(personId1, personId2);
    }

    @PostMapping("/generate-mocks")
    @Operation(summary = "Сгенерировать моковые контакты", description = "Генерация тестовых данных контактов для демонстрации функционала")
    public List<ContactEventResponse> generateMockContacts(@RequestParam(defaultValue = "10") int count) {
        return service.generateMockContacts(count).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @GetMapping("/suspicious")
    @Operation(summary = "Получить подозрительные контакты", description = "Список всех контактов, помеченных как подозрительные")
    public List<ContactEventResponse> getSuspiciousContacts() {
        return service.findSuspiciousContacts().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private ContactEventResponse toResponse(ContactEvent event) {
        return new ContactEventResponse(
                event.getId(),
                event.getPersonId1(),
                event.getPersonId2(),
                event.getContactStartTime(),
                event.getContactEndTime(),
                event.getDurationSeconds(),
                event.getLocation(),
                event.getStatus(),
                event.getSuspicious(),
                event.getSuspiciousActivityId()
        );
    }
}


