package com.casino.uitests.pages;

import com.casino.uitests.config.TestConfig;
import org.openqa.selenium.*;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Select;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;
import java.util.List;

public abstract class BasePage {
    protected final WebDriver driver;
    protected final WebDriverWait wait;

    protected BasePage(WebDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, TestConfig.TIMEOUT);
    }

    protected void open(String path) {
        driver.get(TestConfig.UI_BASE_URL + path);
    }

    protected WebElement findPanelByTitle(String title) {
        String xpath = "//div[contains(@class,'panel')][.//div[contains(@class,'panel__title') and contains(.,'" + title + "')]]";
        return wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath(xpath)));
    }

    protected WebElement findSectionByHeading(String heading) {
        String xpath = "//div[contains(@class,'panel__section')][.//h3[contains(.,'" + heading + "')]]";
        return wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath(xpath)));
    }

    protected WebElement findFieldInPanel(String panelTitle, String labelText) {
        WebElement panel = findPanelByTitle(panelTitle);
        return findFieldInContainer(panel, labelText);
    }

    protected WebElement findFieldInSection(String heading, String labelText) {
        WebElement section = findSectionByHeading(heading);
        return findFieldInContainer(section, labelText);
    }

    protected WebElement findFieldInContainer(WebElement container, String labelText) {
        String xpath = ".//label[contains(normalize-space(.),'" + labelText + "')]//input" +
            " | .//label[contains(normalize-space(.),'" + labelText + "')]//textarea" +
            " | .//label[contains(normalize-space(.),'" + labelText + "')]//select";
        return wait.until(driver -> {
            WebElement element = container.findElement(By.xpath(xpath));
            return element.isDisplayed() ? element : null;
        });
    }

    protected void fillField(WebElement field, String value) {
        field.click();
        field.clear();
        field.sendKeys(value);
    }

    protected void selectByVisibleText(WebElement selectElement, String text) {
        Select select = new Select(selectElement);
        select.selectByVisibleText(text);
    }

    protected void selectFirstNonEmpty(WebElement selectElement) {
        Select select = new Select(selectElement);
        List<WebElement> options = select.getOptions();
        for (WebElement option : options) {
            String value = option.getAttribute("value");
            if (value != null && !value.isBlank()) {
                select.selectByValue(value);
                return;
            }
        }
        throw new IllegalStateException("No selectable options found.");
    }

    protected void clickButtonInPanel(String panelTitle, String buttonText) {
        WebElement panel = findPanelByTitle(panelTitle);
        clickButtonInContainer(panel, buttonText);
    }

    protected void clickButtonInSection(String heading, String buttonText) {
        WebElement section = findSectionByHeading(heading);
        clickButtonInContainer(section, buttonText);
    }

    protected void clickButtonInContainer(WebElement container, String buttonText) {
        String xpath = ".//button[contains(normalize-space(.),'" + buttonText + "')]";
        WebElement button = wait.until(driver -> {
            WebElement element = container.findElement(By.xpath(xpath));
            return element.isEnabled() ? element : null;
        });
        scrollIntoView(button);
        button.click();
    }

    protected void waitForElements(By locator) {
        wait.until(driver -> driver.findElements(locator).size() > 0);
    }

    protected void waitForSelectOptions(WebElement selectElement) {
        wait.until(driver -> new Select(selectElement).getOptions().size() > 1);
    }

    protected void scrollIntoView(WebElement element) {
        ((JavascriptExecutor) driver).executeScript("arguments[0].scrollIntoView({block: 'center'});", element);
    }

    protected void waitForText(By locator, String expected) {
        wait.until(ExpectedConditions.textToBePresentInElementLocated(locator, expected));
    }
}
