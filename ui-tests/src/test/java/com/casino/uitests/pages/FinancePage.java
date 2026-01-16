package com.casino.uitests.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

public class FinancePage extends BasePage {
    public FinancePage(WebDriver driver) {
        super(driver);
    }

    public void open() {
        super.open("/finance");
    }

    public void createOperation(String cashDeskId, String amount) {
        WebElement cashDeskField = findFieldInPanel("Кассовые операции", "UUID кассы");
        fillField(cashDeskField, cashDeskId);
        WebElement amountField = findFieldInPanel("Кассовые операции", "Сумма");
        fillField(amountField, amount);
        clickButtonInPanel("Кассовые операции", "Создать операцию");
        waitForElements(By.cssSelector(".operation-card"));
    }

    public void runReconciliation(String cashDeskId, String start, String end, String balance) {
        WebElement cashDeskField = findFieldInPanel("Сверка кассы", "UUID кассы");
        fillField(cashDeskField, cashDeskId);
        WebElement startField = findFieldInPanel("Сверка кассы", "Начало смены");
        fillField(startField, start);
        WebElement endField = findFieldInPanel("Сверка кассы", "Конец смены");
        fillField(endField, end);
        WebElement balanceField = findFieldInPanel("Сверка кассы", "Фактический баланс");
        fillField(balanceField, balance);
        clickButtonInPanel("Сверка кассы", "Запустить сверку");
        waitForElements(By.cssSelector(".reconciliation-output"));
    }

    public void searchReconciliationByCashDesk(String cashDeskId) {
        WebElement cashDeskField = findFieldInSection("Поиск сверок", "UUID кассы");
        fillField(cashDeskField, cashDeskId);
        clickButtonInSection("Поиск сверок", "По кассе");
        waitForElements(By.cssSelector(".reconciliation-card"));
    }

    public void detectAnomalies(String start, String end, String amountThreshold, String frequency, String windowMinutes) {
        WebElement startField = findFieldInSection("Запустить детекцию", "Начало периода");
        fillField(startField, start);
        WebElement endField = findFieldInSection("Запустить детекцию", "Конец периода");
        fillField(endField, end);
        WebElement amountField = findFieldInSection("Запустить детекцию", "Порог крупной суммы");
        fillField(amountField, amountThreshold);
        WebElement frequencyField = findFieldInSection("Запустить детекцию", "Порог частоты");
        fillField(frequencyField, frequency);
        WebElement windowField = findFieldInSection("Запустить детекцию", "Окно времени (мин)");
        fillField(windowField, windowMinutes);
        clickButtonInSection("Запустить детекцию", "Запустить детекцию");
        waitForElements(By.cssSelector(".anomaly-card"));
    }

    public void createFinancialReport(String startDate, String endDate) {
        WebElement startField = findFieldInPanel("Финансовый отчет", "Начало периода");
        fillField(startField, startDate);
        WebElement endField = findFieldInPanel("Финансовый отчет", "Конец периода");
        fillField(endField, endDate);
        clickButtonInPanel("Финансовый отчет", "Сформировать отчет");
        waitForElements(By.cssSelector(".report-output"));
    }
}
