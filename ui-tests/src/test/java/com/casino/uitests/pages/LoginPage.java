package com.casino.uitests.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;

public class LoginPage extends BasePage {
    public LoginPage(WebDriver driver) {
        super(driver);
    }

    public void open() {
        super.open("/login");
    }

    public void login(String username, String password, String apiBaseUrl) {
        WebElement loginField = findFieldInContainer(driver.findElement(By.cssSelector(".login-card")), "Логин");
        fillField(loginField, username);

        WebElement passwordField = findFieldInContainer(driver.findElement(By.cssSelector(".login-card")), "Пароль");
        fillField(passwordField, password);

        WebElement baseUrlField = findFieldInContainer(driver.findElement(By.cssSelector(".login-card")), "Базовый URL");
        fillField(baseUrlField, apiBaseUrl == null ? "" : apiBaseUrl);

        WebElement submit = driver.findElement(By.xpath("//button[contains(.,'Войти')]"));
        submit.click();
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector(".header__nav")));
    }
}
