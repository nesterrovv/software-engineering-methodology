package com.casino.uitests.tests;

import com.casino.uitests.config.TestDataHelper;
import com.casino.uitests.pages.IncidentsPage;
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;

class IncidentsUiTest extends BaseUiTest {

    @Test
    void createsIncidentAndDisplaysList() {
        login();
        IncidentsPage page = new IncidentsPage(driver);
        page.open();
        page.createIncident("Тестовая зона", "UI тест: инцидент");
        page.fetchIncidents();

        int count = driver.findElements(By.cssSelector(".incident-card")).size();
        Assertions.assertThat(count).isGreaterThan(0);
    }

    @Test
    void createsComplaintAndDisplaysList() {
        login();
        IncidentsPage page = new IncidentsPage(driver);
        page.open();
        page.createComplaint("UI тест: жалоба");
        page.fetchComplaints();

        int count = driver.findElements(By.cssSelector(".complaint-card")).size();
        Assertions.assertThat(count).isGreaterThan(0);
    }

    @Test
    void createsViolationAndDisplaysList() {
        TestDataHelper.ensureEmployee();
        login();
        IncidentsPage page = new IncidentsPage(driver);
        page.open();
        page.refreshEmployees();
        page.createViolation("UI тест: нарушение");
        page.fetchViolations();

        int count = driver.findElements(By.cssSelector(".violation-card")).size();
        Assertions.assertThat(count).isGreaterThan(0);
    }
}
