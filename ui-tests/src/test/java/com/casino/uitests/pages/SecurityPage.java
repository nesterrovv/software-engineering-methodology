package com.casino.uitests.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

public class SecurityPage extends BasePage {
    public SecurityPage(WebDriver driver) {
        super(driver);
    }

    public void open() {
        super.open("/security");
    }

    public void startMonitoring() {
        WebElement employeeSelect = findFieldInSection("Начать мониторинг", "Сотрудник");
        waitForSelectOptions(employeeSelect);
        selectFirstNonEmpty(employeeSelect);
        clickButtonInSection("Начать мониторинг", "Начать сессию");
        waitForElements(By.cssSelector(".session-card"));
    }

    public void createNotification(String title, String message) {
        WebElement recipientSelect = findFieldInSection("Создать уведомление", "Получатель");
        waitForSelectOptions(recipientSelect);
        selectFirstNonEmpty(recipientSelect);
        WebElement titleField = findFieldInSection("Создать уведомление", "Заголовок");
        fillField(titleField, title);
        WebElement messageField = findFieldInSection("Создать уведомление", "Сообщение");
        fillField(messageField, message);
        clickButtonInSection("Создать уведомление", "Создать уведомление");
    }

    public void fetchNotifications() {
        WebElement recipientSelect = findFieldInSection("Получить уведомления", "Получатель");
        waitForSelectOptions(recipientSelect);
        selectFirstNonEmpty(recipientSelect);
        clickButtonInSection("Получить уведомления", "Получить уведомления");
        waitForElements(By.cssSelector(".notification-card"));
    }
}
