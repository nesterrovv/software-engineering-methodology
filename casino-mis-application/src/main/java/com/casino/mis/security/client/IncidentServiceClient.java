package com.casino.mis.security.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.Map;
import java.util.UUID;

@FeignClient(name = "incident-service-security", url = "${feign.client.incident.url:http://localhost:8080}")
public interface IncidentServiceClient {

    @PostMapping("/api/incident/suspicious-activities")
    Map<String, Object> createSuspiciousActivity(@RequestBody Map<String, Object> request);

    @PostMapping("/api/incident/incidents")
    Map<String, Object> createIncident(@RequestBody Map<String, Object> request);
}

