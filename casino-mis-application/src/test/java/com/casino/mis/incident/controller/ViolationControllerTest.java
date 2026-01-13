package com.casino.mis.incident.controller;

import com.casino.mis.incident.domain.DisciplinaryViolation;
import com.casino.mis.incident.domain.ViolationStatus;
import com.casino.mis.incident.domain.ViolationType;
import com.casino.mis.incident.dto.CreateViolationRequest;
import com.casino.mis.incident.dto.ViolationResponse;
import com.casino.mis.incident.service.ViolationService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.OffsetDateTime;
import java.util.*;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ViolationController.class)
class ViolationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ViolationService service;

    @Autowired
    private ObjectMapper objectMapper;

    private CreateViolationRequest request;
    private DisciplinaryViolation violation;
    private UUID violationId;
    private UUID employeeId;

    @BeforeEach
    void setUp() {
        violationId = UUID.randomUUID();
        employeeId = UUID.randomUUID();

        request = new CreateViolationRequest();
        request.setEmployeeId(employeeId);
        request.setType(ViolationType.LATE);
        request.setDescription("Опоздание на работу");

        violation = new DisciplinaryViolation();
        violation.setId(violationId);
        violation.setEmployeeId(employeeId);
        violation.setType(ViolationType.LATE);
        violation.setDescription("Опоздание на работу");
        violation.setStatus(ViolationStatus.OPEN);
        violation.setOccurredAt(OffsetDateTime.now());
    }

    @Test
    @WithMockUser
    void testCreate() throws Exception {
        when(service.create(any(CreateViolationRequest.class))).thenReturn(violation);

        mockMvc.perform(post("/api/incident/violations")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(violationId.toString()))
                .andExpect(jsonPath("$.employeeId").value(employeeId.toString()))
                .andExpect(jsonPath("$.type").value("LATE"));
    }

    @Test
    @WithMockUser
    void testGetAll() throws Exception {
        when(service.all()).thenReturn(Arrays.asList(violation));

        mockMvc.perform(get("/api/incident/violations"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].id").value(violationId.toString()));
    }

    @Test
    @WithMockUser
    void testGetById() throws Exception {
        when(service.get(violationId)).thenReturn(violation);

        mockMvc.perform(get("/api/incident/violations/{id}", violationId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(violationId.toString()));
    }

    @Test
    @WithMockUser
    void testGetByEmployee() throws Exception {
        when(service.findByEmployeeId(employeeId)).thenReturn(Arrays.asList(violation));

        mockMvc.perform(get("/api/incident/violations/employee/{employeeId}", employeeId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].employeeId").value(employeeId.toString()));
    }
}

