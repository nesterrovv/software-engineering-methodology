package com.casino.uitests.driver;

import org.openqa.selenium.WebDriver;

public final class DriverStore {
    private static final ThreadLocal<WebDriver> HOLDER = new ThreadLocal<>();

    private DriverStore() {
    }

    public static void set(WebDriver driver) {
        HOLDER.set(driver);
    }

    public static WebDriver get() {
        return HOLDER.get();
    }

    public static void clear() {
        HOLDER.remove();
    }
}
