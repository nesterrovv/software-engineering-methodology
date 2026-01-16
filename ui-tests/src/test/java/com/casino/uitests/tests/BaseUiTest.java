package com.casino.uitests.tests;

import com.casino.uitests.config.TestConfig;
import com.casino.uitests.driver.DriverFactory;
import com.casino.uitests.driver.DriverStore;
import com.casino.uitests.driver.ScreenshotExtension;
import com.casino.uitests.pages.LoginPage;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.extension.ExtendWith;
import org.openqa.selenium.WebDriver;

@ExtendWith(ScreenshotExtension.class)
public abstract class BaseUiTest {
    protected WebDriver driver;

    @BeforeEach
    void setUp() {
        driver = DriverFactory.create();
        DriverStore.set(driver);
    }

    @AfterEach
    void tearDown() {
        if (driver != null) {
            driver.quit();
        }
        DriverStore.clear();
    }

    protected void login() {
        LoginPage loginPage = new LoginPage(driver);
        loginPage.open();
        loginPage.login(TestConfig.USERNAME, TestConfig.PASSWORD, TestConfig.UI_API_BASE_URL);
    }
}
