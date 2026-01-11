package com.casino.mis.staff.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@FeignClient(name = "incident-service-staff", url = "${feign.client.incident.url:http://localhost:8080}")
public interface IncidentServiceClient {

    @GetMapping("/api/incident/violations")
    List<Map<String, Object>> getViolations();

    @GetMapping("/api/incident/violations/employee/{employeeId}")
    List<Map<String, Object>> getViolationsByEmployee(@PathVariable("employeeId") UUID employeeId);
}

