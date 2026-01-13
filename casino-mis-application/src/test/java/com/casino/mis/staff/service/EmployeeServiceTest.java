package com.casino.mis.staff.service;

import com.casino.mis.staff.domain.Employee;
import com.casino.mis.staff.repository.EmployeeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.OffsetDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmployeeServiceTest {

    @Mock
    private EmployeeRepository repository;

    @InjectMocks
    private EmployeeService service;

    private Employee employee;
    private UUID employeeId;

    @BeforeEach
    void setUp() {
        employeeId = UUID.randomUUID();

        employee = new Employee();
        employee.setId(employeeId);
        employee.setFirstName("Иван");
        employee.setLastName("Петров");
        employee.setMiddleName("Сергеевич");
        employee.setPosition("Официант");
        employee.setDepartment("Обслуживание");
        employee.setStatus(Employee.EmployeeStatus.ACTIVE);
        employee.setHireDate(OffsetDateTime.now());
        employee.setContactInfo("ivan.petrov@casino.local");
    }

    @Test
    void testCreate() {
        when(repository.save(any(Employee.class))).thenReturn(employee);

        Employee result = service.create(employee);

        assertNotNull(result);
        assertEquals(employeeId, result.getId());
        assertEquals("Иван", result.getFirstName());
        verify(repository, times(1)).save(any(Employee.class));
    }

    @Test
    void testFindById() {
        when(repository.findById(employeeId)).thenReturn(Optional.of(employee));

        Employee result = service.findById(employeeId);

        assertNotNull(result);
        assertEquals(employeeId, result.getId());
        verify(repository, times(1)).findById(employeeId);
    }

    @Test
    void testFindByIdNotFound() {
        when(repository.findById(employeeId)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> service.findById(employeeId));
        verify(repository, times(1)).findById(employeeId);
    }

    @Test
    void testFindAll() {
        List<Employee> employees = Arrays.asList(employee);
        when(repository.findAll()).thenReturn(employees);

        List<Employee> result = service.findAll();

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(employeeId, result.get(0).getId());
        verify(repository, times(1)).findAll();
    }

    @Test
    void testFindByDepartment() {
        List<Employee> employees = Arrays.asList(employee);
        when(repository.findByDepartment("Обслуживание")).thenReturn(employees);

        List<Employee> result = service.findByDepartment("Обслуживание");

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Обслуживание", result.get(0).getDepartment());
        verify(repository, times(1)).findByDepartment("Обслуживание");
    }

    @Test
    void testFindByStatus() {
        List<Employee> employees = Arrays.asList(employee);
        when(repository.findByStatus(Employee.EmployeeStatus.ACTIVE)).thenReturn(employees);

        List<Employee> result = service.findByStatus(Employee.EmployeeStatus.ACTIVE);

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(Employee.EmployeeStatus.ACTIVE, result.get(0).getStatus());
        verify(repository, times(1)).findByStatus(Employee.EmployeeStatus.ACTIVE);
    }

    @Test
    void testUpdateStatus() {
        when(repository.findById(employeeId)).thenReturn(Optional.of(employee));
        when(repository.save(any(Employee.class))).thenReturn(employee);

        Employee result = service.updateStatus(employeeId, Employee.EmployeeStatus.TERMINATED);

        assertNotNull(result);
        assertEquals(Employee.EmployeeStatus.TERMINATED, result.getStatus());
        verify(repository, times(1)).findById(employeeId);
        verify(repository, times(1)).save(any(Employee.class));
    }
}

