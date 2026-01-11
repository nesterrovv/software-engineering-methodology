package com.casino.mis.staff.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.Map;
import java.util.UUID;

@FeignClient(name = "security-service", url = "${feign.client.security.url:http://localhost:8080}")
public interface SecurityServiceClient {

    @PostMapping("/api/security/notifications")
    Map<String, Object> createNotification(@RequestBody Map<String, Object> request);
}


