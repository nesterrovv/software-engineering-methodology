package com.casino.uitests.tests;

import com.casino.uitests.config.TestDataHelper;
import com.casino.uitests.pages.FinancePage;
import com.casino.uitests.util.DateTimeUtils;
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;

class FinanceUiTest extends BaseUiTest {

    @Test
    void createsCashOperationAndDisplaysList() {
        login();
        FinancePage page = new FinancePage(driver);
        page.open();
        page.createOperation(TestDataHelper.randomUuid(), "2500");

        int count = driver.findElements(By.cssSelector(".operation-card")).size();
        Assertions.assertThat(count).isGreaterThan(0);
    }

    @Test
    void runsReconciliationAndDisplaysSearchResults() {
        login();
        FinancePage page = new FinancePage(driver);
        page.open();
        String cashDeskId = TestDataHelper.randomUuid();
        page.runReconciliation(
            cashDeskId,
            DateTimeUtils.dateTimeMinusHours(4),
            DateTimeUtils.dateTimeMinusHours(2),
            "1500"
        );
        page.searchReconciliationByCashDesk(cashDeskId);

        int count = driver.findElements(By.cssSelector(".reconciliation-card")).size();
        Assertions.assertThat(count).isGreaterThan(0);
    }

    @Test
    void detectsAnomaliesAndDisplaysList() {
        login();
        FinancePage page = new FinancePage(driver);
        page.open();
        page.createOperation(TestDataHelper.randomUuid(), "99999");
        page.detectAnomalies(
            DateTimeUtils.dateTimeMinusHours(6),
            DateTimeUtils.dateTimePlusHours(6),
            "1",
            "1",
            "60"
        );

        int count = driver.findElements(By.cssSelector(".anomaly-card")).size();
        Assertions.assertThat(count).isGreaterThan(0);
    }

    @Test
    void createsFinancialReportAndShowsDownload() {
        login();
        FinancePage page = new FinancePage(driver);
        page.open();
        page.createFinancialReport(DateTimeUtils.dateMinusDays(7), DateTimeUtils.datePlusDays(0));

        String reportText = driver.findElement(By.cssSelector(".report-output")).getText();
        Assertions.assertThat(reportText).contains("CSV ссылка");
    }
}
