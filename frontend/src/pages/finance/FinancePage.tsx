import {useState} from "react";
import type {FormEvent} from "react";
import PageShell from "../../components/PageShell";
import {apiRequest} from "../../api/client";
import {useAuth} from "../../auth/AuthContext";
import type {Anomaly, CashOperation, CashReconciliation, FinancialReport} from "../../types";
const toIsoDateTime = (value: string) => (value ? new Date(value).toISOString() : undefined);

const FinancePage = () => {
    const {token, baseUrl} = useAuth();
    const [operations, setOperations] = useState<CashOperation[]>([]);
    const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
    const [reconciliations, setReconciliations] = useState<CashReconciliation[]>([]);
    const [reconciliationOutput, setReconciliationOutput] = useState<CashReconciliation | null>(null);
    const [reportOutput, setReportOutput] = useState<FinancialReport | null>(null);

    const [operationCashDeskId, setOperationCashDeskId] = useState("");
    const [operationAmount, setOperationAmount] = useState("");
    const [operationType, setOperationType] = useState("DEPOSIT");

    const [reconciliationCashDeskId, setReconciliationCashDeskId] = useState("");
    const [reconciliationStart, setReconciliationStart] = useState("");
    const [reconciliationEnd, setReconciliationEnd] = useState("");
    const [reconciliationBalance, setReconciliationBalance] = useState("");

    const [searchCashDeskId, setSearchCashDeskId] = useState("");

    const [anomalyStart, setAnomalyStart] = useState("");
    const [anomalyEnd, setAnomalyEnd] = useState("");
    const [anomalyAmount, setAnomalyAmount] = useState("10000");
    const [anomalyFrequency, setAnomalyFrequency] = useState("10");
    const [anomalyWindow, setAnomalyWindow] = useState("60");

    const [reportStart, setReportStart] = useState("");
    const [reportEnd, setReportEnd] = useState("");

    const [error, setError] = useState("");
    const [statusMessage, setStatusMessage] = useState("");

    const handleCreateOperation = async (event: FormEvent) => {
        event.preventDefault();
        setError("");
        setStatusMessage("");
        if (!operationCashDeskId || !operationAmount) {
            setError("Заполните UUID кассы и сумму.");
            return;
        }
        try {
            const created = await apiRequest<CashOperation>(baseUrl, token, "/api/finance/operations", {
                method: "POST",
                body: JSON.stringify({
                    cashDeskId: operationCashDeskId,
                    amount: operationAmount,
                    type: operationType,
                    currency: "RUB",
                }),
            });
            setOperations((prev) => [created, ...prev]);
            setOperationAmount("");
            setStatusMessage("Операция создана.");
        } catch {
            setError("Не удалось создать операцию.");
        }
    };

    const handleReconcile = async (event: FormEvent) => {
        event.preventDefault();
        setError("");
        setStatusMessage("");
        if (!reconciliationCashDeskId || !reconciliationStart || !reconciliationEnd || !reconciliationBalance) {
            setError("Заполните все поля сверки.");
            return;
        }
        try {
            const response = await apiRequest<CashReconciliation>(baseUrl, token, "/api/finance/reconciliation", {
                method: "POST",
                body: JSON.stringify({
                    cashDeskId: reconciliationCashDeskId,
                    shiftStart: toIsoDateTime(reconciliationStart),
                    shiftEnd: toIsoDateTime(reconciliationEnd),
                    actualBalance: reconciliationBalance,
                }),
            });
            setReconciliationOutput(response);
            setStatusMessage("Сверка выполнена.");
        } catch {
            setError("Не удалось выполнить сверку кассы.");
        }
    };

    const handleSearchReconciliation = async (event: FormEvent) => {
        event.preventDefault();
        setError("");
        setStatusMessage("");
        if (!searchCashDeskId) {
            setError("Укажите UUID кассы для поиска.");
            return;
        }
        try {
            const data = await apiRequest<CashReconciliation[]>(
                baseUrl,
                token,
                `/api/finance/reconciliation/cashdesk/${searchCashDeskId}`
            );
            setReconciliations(data || []);
        } catch {
            setError("Не удалось получить сверки.");
        }
    };

    const handleDetectAnomalies = async (event: FormEvent) => {
        event.preventDefault();
        setError("");
        setStatusMessage("");
        try {
            const data = await apiRequest<Anomaly[]>(baseUrl, token, "/api/finance/anomalies/detect", {
                method: "POST",
                body: JSON.stringify({
                    periodStart: toIsoDateTime(anomalyStart),
                    periodEnd: toIsoDateTime(anomalyEnd),
                    largeAmountThreshold: anomalyAmount,
                    frequencyThreshold: Number(anomalyFrequency),
                    timeWindowMinutes: Number(anomalyWindow),
                }),
            });
            setAnomalies(data || []);
        } catch {
            setError("Не удалось запустить детекцию аномалий.");
        }
    };

    const handleCreateReport = async (event: FormEvent) => {
        event.preventDefault();
        setError("");
        setStatusMessage("");
        if (!reportStart || !reportEnd) {
            setError("Укажите период отчёта.");
            return;
        }
        try {
            const data = await apiRequest<FinancialReport>(baseUrl, token, "/api/finance/reports", {
                method: "POST",
                body: JSON.stringify({
                    periodStart: reportStart,
                    periodEnd: reportEnd,
                }),
            });
            setReportOutput(data);
        } catch {
            setError("Не удалось сформировать отчёт.");
        }
    };

    return (
        <PageShell
            title="Финансовый контроль"
            subtitle="Операции, сверки и аналитика финансовых показателей."
            className="theme-green"
        >
            <section className="panel">
                <div className="panel__title">Кассовые операции</div>
                <div className="panel__section">
                    <h3>Создать операцию</h3>
                    <form onSubmit={handleCreateOperation} className="panel__form">
                        <label>
                            UUID кассы
                            <input
                                value={operationCashDeskId}
                                onChange={(event) => setOperationCashDeskId(event.target.value)}
                                placeholder="e.g. 3fa85f64-5717-4562-b3fc-2c963f66afa6"
                            />
                        </label>
                        <label>
                            Сумма
                            <input
                                type="number"
                                value={operationAmount}
                                onChange={(event) => setOperationAmount(event.target.value)}
                            />
                        </label>
                        <label>
                            Тип операции
                            <select value={operationType} onChange={(event) => setOperationType(event.target.value)}>
                                <option value="DEPOSIT">Внесение</option>
                                <option value="WITHDRAWAL">Снятие</option>
                            </select>
                        </label>
                        <button type="submit" className="primary-button">Создать операцию</button>
                    </form>
                    {operations.length ? (
                        <div className="card-list">
                            {operations.map((operation) => (
                                <div key={operation.id} className="operation-card">
                                    <h4>{operation.type}</h4>
                                    <p>Сумма: {operation.amount}</p>
                                    <p className="muted">Касса: {operation.cashDeskId}</p>
                                </div>
                            ))}
                        </div>
                    ) : null}
                </div>
            </section>

            <section className="panel">
                <div className="panel__title">Сверка кассы</div>
                <div className="panel__section">
                    <h3>Запустить сверку</h3>
                    <form onSubmit={handleReconcile} className="panel__form">
                        <label>
                            UUID кассы
                            <input
                                value={reconciliationCashDeskId}
                                onChange={(event) => setReconciliationCashDeskId(event.target.value)}
                            />
                        </label>
                        <label>
                            Начало смены
                            <input
                                type="datetime-local"
                                value={reconciliationStart}
                                onChange={(event) => setReconciliationStart(event.target.value)}
                            />
                        </label>
                        <label>
                            Конец смены
                            <input
                                type="datetime-local"
                                value={reconciliationEnd}
                                onChange={(event) => setReconciliationEnd(event.target.value)}
                            />
                        </label>
                        <label>
                            Фактический баланс
                            <input
                                type="number"
                                value={reconciliationBalance}
                                onChange={(event) => setReconciliationBalance(event.target.value)}
                            />
                        </label>
                        <button type="submit" className="primary-button">Запустить сверку</button>
                    </form>
                    {reconciliationOutput ? (
                        <div className="reconciliation-output">
                            <p><strong>Статус:</strong> {reconciliationOutput.status ?? "OK"}</p>
                            <p><strong>Ожидаемый баланс:</strong> {reconciliationOutput.expectedBalance ?? "—"}</p>
                            <p><strong>Фактический баланс:</strong> {reconciliationOutput.actualBalance ?? "—"}</p>
                            <p><strong>Расхождение:</strong> {reconciliationOutput.discrepancy ?? "0"}</p>
                        </div>
                    ) : null}
                </div>
            </section>

            <section className="panel">
                <div className="panel__title">Поиск сверок</div>
                <div className="panel__section">
                    <h3>Поиск сверок по кассе</h3>
                    <form onSubmit={handleSearchReconciliation} className="panel__form">
                        <label>
                            UUID кассы
                            <input
                                value={searchCashDeskId}
                                onChange={(event) => setSearchCashDeskId(event.target.value)}
                            />
                        </label>
                        <button type="submit" className="secondary-button">По кассе</button>
                    </form>
                    {reconciliations.length ? (
                        <div className="card-list">
                            {reconciliations.map((rec) => (
                                <div key={rec.id} className="reconciliation-card">
                                    <p><strong>Статус:</strong> {rec.status}</p>
                                    <p>Расхождение: {rec.discrepancy ?? "0"}</p>
                                </div>
                            ))}
                        </div>
                    ) : null}
                </div>
            </section>

            <section className="panel">
                <div className="panel__title">Запустить детекцию</div>
                <div className="panel__section">
                    <h3>Параметры детекции</h3>
                    <form onSubmit={handleDetectAnomalies} className="panel__form">
                        <label>
                            Начало периода
                            <input
                                type="datetime-local"
                                value={anomalyStart}
                                onChange={(event) => setAnomalyStart(event.target.value)}
                            />
                        </label>
                        <label>
                            Конец периода
                            <input
                                type="datetime-local"
                                value={anomalyEnd}
                                onChange={(event) => setAnomalyEnd(event.target.value)}
                            />
                        </label>
                        <label>
                            Порог крупной суммы
                            <input
                                type="number"
                                value={anomalyAmount}
                                onChange={(event) => setAnomalyAmount(event.target.value)}
                            />
                        </label>
                        <label>
                            Порог частоты
                            <input
                                type="number"
                                value={anomalyFrequency}
                                onChange={(event) => setAnomalyFrequency(event.target.value)}
                            />
                        </label>
                        <label>
                            Окно времени (мин)
                            <input
                                type="number"
                                value={anomalyWindow}
                                onChange={(event) => setAnomalyWindow(event.target.value)}
                            />
                        </label>
                        <button type="submit" className="primary-button">Запустить детекцию</button>
                    </form>
                    {anomalies.length ? (
                        <div className="card-list">
                            {anomalies.map((anomaly) => (
                                <div key={anomaly.id} className="anomaly-card">
                                    <h4>{anomaly.type}</h4>
                                    <p>Сумма: {anomaly.amount ?? "—"}</p>
                                    <p className="muted">Статус: {anomaly.status}</p>
                                </div>
                            ))}
                        </div>
                    ) : null}
                </div>
            </section>

            <section className="panel">
                <div className="panel__title">Финансовый отчет</div>
                <div className="panel__section">
                    <h3>Сформировать отчёт</h3>
                    <form onSubmit={handleCreateReport} className="panel__form">
                        <label>
                            Начало периода
                            <input type="date" value={reportStart} onChange={(event) => setReportStart(event.target.value)} />
                        </label>
                        <label>
                            Конец периода
                            <input type="date" value={reportEnd} onChange={(event) => setReportEnd(event.target.value)} />
                        </label>
                        <button type="submit" className="primary-button">Сформировать отчет</button>
                    </form>
                    {reportOutput ? (
                        <div className="report-output">
                            CSV ссылка: {reportOutput.csvUrl ?? "Недоступно"}
                        </div>
                    ) : null}
                </div>
            </section>

            {error ? <div className="form-error">{error}</div> : null}
            {statusMessage ? <div className="form-success">{statusMessage}</div> : null}
        </PageShell>
    );
};

export default FinancePage;
