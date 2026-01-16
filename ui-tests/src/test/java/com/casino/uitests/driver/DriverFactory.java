package com.casino.uitests.driver;

import com.casino.uitests.config.TestConfig;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.edge.EdgeDriver;
import org.openqa.selenium.edge.EdgeOptions;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.firefox.FirefoxOptions;

import java.time.Duration;

public final class DriverFactory {
    private DriverFactory() {
    }

    public static WebDriver create() {
        String browser = TestConfig.BROWSER.toLowerCase();
        WebDriver driver;
        switch (browser) {
            case "firefox" -> driver = createFirefox();
            case "edge" -> driver = createEdge();
            default -> driver = createChrome();
        }
        driver.manage().timeouts().implicitlyWait(Duration.ZERO);
        driver.manage().window().setSize(new org.openqa.selenium.Dimension(1440, 900));
        return driver;
    }

    private static WebDriver createChrome() {
        String driverPath = System.getenv("CHROME_DRIVER_PATH");
        if (driverPath != null && !driverPath.isBlank()) {
            System.setProperty("webdriver.chrome.driver", driverPath);
        }
        ChromeOptions options = new ChromeOptions();
        if (TestConfig.HEADLESS) {
            options.addArguments("--headless=new");
        }
        options.addArguments("--window-size=1440,900");
        return new ChromeDriver(options);
    }

    private static WebDriver createFirefox() {
        String driverPath = System.getenv("GECKO_DRIVER_PATH");
        if (driverPath != null && !driverPath.isBlank()) {
            System.setProperty("webdriver.gecko.driver", driverPath);
        }
        FirefoxOptions options = new FirefoxOptions();
        if (TestConfig.HEADLESS) {
            options.addArguments("-headless");
        }
        return new FirefoxDriver(options);
    }

    private static WebDriver createEdge() {
        String driverPath = System.getenv("EDGE_DRIVER_PATH");
        if (driverPath != null && !driverPath.isBlank()) {
            System.setProperty("webdriver.edge.driver", driverPath);
        }
        EdgeOptions options = new EdgeOptions();
        if (TestConfig.HEADLESS) {
            options.addArguments("--headless=new");
        }
        options.addArguments("--window-size=1440,900");
        return new EdgeDriver(options);
    }
}
