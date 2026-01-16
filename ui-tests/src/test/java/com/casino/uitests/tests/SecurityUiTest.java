package com.casino.uitests.tests;

import com.casino.uitests.config.TestDataHelper;
import com.casino.uitests.pages.SecurityPage;
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;

class SecurityUiTest extends BaseUiTest {

    @Test
    void startsMonitoringSession() {
        TestDataHelper.ensureEmployee();
        login();
        SecurityPage page = new SecurityPage(driver);
        page.open();
        page.startMonitoring();

        int count = driver.findElements(By.cssSelector(".session-card")).size();
        Assertions.assertThat(count).isGreaterThan(0);
    }

    @Test
    void createsAndFetchesNotifications() {
        TestDataHelper.ensureEmployee();
        login();
        SecurityPage page = new SecurityPage(driver);
        page.open();
        page.createNotification("UI тест уведомление", "Сообщение для UI теста");
        page.fetchNotifications();

        int count = driver.findElements(By.cssSelector(".notification-card")).size();
        Assertions.assertThat(count).isGreaterThan(0);
    }
}
