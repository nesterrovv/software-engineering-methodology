package com.casino.mis.staff.controller;

import com.casino.mis.staff.dto.ViolationHistoryRequest;
import com.casino.mis.staff.dto.ViolationHistoryResponse;
import com.casino.mis.staff.service.ViolationHistoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/staff/violation-history")
@Tag(name = "Violation History", description = "UC22: Просмотр истории нарушений")
public class ViolationHistoryController {

    private final ViolationHistoryService service;

    public ViolationHistoryController(ViolationHistoryService service) {
        this.service = service;
    }

    @PostMapping("/search")
    @Operation(summary = "Поиск нарушений", description = "UC22: Поиск и фильтрация истории нарушений по сотруднику, подразделению, датам, типу")
    public ViolationHistoryResponse search(@RequestBody ViolationHistoryRequest request) {
        return service.getViolationHistory(request);
    }

    @GetMapping("/employee/{employeeId}")
    @Operation(summary = "Получить историю нарушений сотрудника", description = "UC22: Получение полной истории нарушений конкретного сотрудника")
    public ViolationHistoryResponse getByEmployee(@PathVariable java.util.UUID employeeId) {
        ViolationHistoryRequest request = new ViolationHistoryRequest();
        request.setEmployeeId(employeeId);
        return service.getViolationHistory(request);
    }

    @GetMapping("/department/{department}")
    @Operation(summary = "Получить нарушения по подразделению", description = "UC22: Получение сводного отчёта по нарушениям всего подразделения")
    public ViolationHistoryResponse getByDepartment(@PathVariable String department) {
        ViolationHistoryRequest request = new ViolationHistoryRequest();
        request.setDepartment(department);
        return service.getViolationHistory(request);
    }
}


