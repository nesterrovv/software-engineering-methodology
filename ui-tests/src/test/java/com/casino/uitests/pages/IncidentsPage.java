package com.casino.uitests.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

public class IncidentsPage extends BasePage {
    public IncidentsPage(WebDriver driver) {
        super(driver);
    }

    public void open() {
        super.open("/incidents");
    }

    public void createIncident(String location, String description) {
        WebElement locationField = findFieldInPanel("Инциденты", "Локация");
        fillField(locationField, location);
        WebElement descField = findFieldInPanel("Инциденты", "Описание");
        fillField(descField, description);
        clickButtonInPanel("Инциденты", "Создать инцидент");
    }

    public void fetchIncidents() {
        clickButtonInPanel("Инциденты", "Получить инциденты");
        waitForElements(By.cssSelector(".incident-card"));
    }

    public void createComplaint(String description) {
        WebElement descField = findFieldInPanel("Жалобы", "Описание");
        fillField(descField, description);
        clickButtonInPanel("Жалобы", "Создать жалобу");
    }

    public void fetchComplaints() {
        clickButtonInPanel("Жалобы", "Получить жалобы");
        waitForElements(By.cssSelector(".complaint-card"));
    }

    public void refreshEmployees() {
        clickButtonInPanel("Нарушения", "Обновить список сотрудников");
    }

    public void createViolation(String description) {
        WebElement employeeSelect = findFieldInPanel("Нарушения", "Сотрудник");
        waitForSelectOptions(employeeSelect);
        selectFirstNonEmpty(employeeSelect);
        WebElement descField = findFieldInPanel("Нарушения", "Описание");
        fillField(descField, description);
        clickButtonInPanel("Нарушения", "Создать нарушение");
    }

    public void fetchViolations() {
        clickButtonInPanel("Нарушения", "Получить нарушения");
        waitForElements(By.cssSelector(".violation-card"));
    }
}
