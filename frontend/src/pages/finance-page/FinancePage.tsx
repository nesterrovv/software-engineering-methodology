import {useState} from "react";
import {useAuth} from "../../auth/AuthContext.tsx";
import "./finance-page.scss";

const OPERATION_TYPES = ["DEPOSIT", "WITHDRAWAL"] as const;
const RECONCILIATION_STATUSES = ["PENDING", "CONFIRMED", "DISCREPANCY_FOUND", "RESOLVED"] as const;
const ANOMALY_STATUSES = ["DETECTED", "CONFIRMED", "REJECTED", "RESOLVED"] as const;
const RISK_LEVELS = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;

const toIso = (value: string) => (value ? new Date(value).toISOString() : undefined);

const buildQuery = (params: Record<string, string | undefined>) => {
    const search = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value) {
            search.set(key, value);
        }
    });
    const query = search.toString();
    return query ? `?${query}` : "";
};

const formatBody = (data: unknown) => {
    if (typeof data === "string") {
        return data;
    }
    return JSON.stringify(data, null, 2);
};

const FinancePage = () => {
    const {token, baseUrl} = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [lastRequest, setLastRequest] = useState("");
    const [lastStatus, setLastStatus] = useState("");
    const [lastDuration, setLastDuration] = useState("");
    const [lastBody, setLastBody] = useState("");

    const [operationCashDeskId, setOperationCashDeskId] = useState("");
    const [operationAmount, setOperationAmount] = useState("");
    const [operationType, setOperationType] = useState("DEPOSIT");
    const [operationCurrency, setOperationCurrency] = useState("RUB");
    const [operationId, setOperationId] = useState("");

    const [reconciliationCashDeskId, setReconciliationCashDeskId] = useState("");
    const [reconciliationShiftStart, setReconciliationShiftStart] = useState("");
    const [reconciliationShiftEnd, setReconciliationShiftEnd] = useState("");
    const [reconciliationActualBalance, setReconciliationActualBalance] = useState("");
    const [reconciliationNotes, setReconciliationNotes] = useState("");
    const [reconciliationId, setReconciliationId] = useState("");
    const [reconciliationCashDeskFilter, setReconciliationCashDeskFilter] = useState("");
    const [reconciliationStatusId, setReconciliationStatusId] = useState("");
    const [reconciliationStatus, setReconciliationStatus] = useState("PENDING");

    const [analysisStart, setAnalysisStart] = useState("");
    const [analysisEnd, setAnalysisEnd] = useState("");
    const [analysisTableId, setAnalysisTableId] = useState("");
    const [analysisExpectedRtp, setAnalysisExpectedRtp] = useState("95");
    const [analysisLargeWin, setAnalysisLargeWin] = useState("1000");
    const [analysisId, setAnalysisId] = useState("");
    const [analysisTableFilter, setAnalysisTableFilter] = useState("");

    const [reportStart, setReportStart] = useState("");
    const [reportEnd, setReportEnd] = useState("");

    const [anomalyStart, setAnomalyStart] = useState("");
    const [anomalyEnd, setAnomalyEnd] = useState("");
    const [anomalyLargeAmount, setAnomalyLargeAmount] = useState("10000");
    const [anomalyFrequency, setAnomalyFrequency] = useState("10");
    const [anomalyWindow, setAnomalyWindow] = useState("60");
    const [anomalyStatusFilter, setAnomalyStatusFilter] = useState("");
    const [anomalyRiskFilter, setAnomalyRiskFilter] = useState("");
    const [anomalyId, setAnomalyId] = useState("");
    const [anomalyReviewId, setAnomalyReviewId] = useState("");
    const [anomalyReviewStatus, setAnomalyReviewStatus] = useState("CONFIRMED");
    const [anomalyReviewerId, setAnomalyReviewerId] = useState("");
    const [anomalyReviewNotes, setAnomalyReviewNotes] = useState("");

    const runRequest = async (options: {
        method: string;
        path: string;
        query?: Record<string, string | undefined>;
        body?: unknown;
    }) => {
        const base = baseUrl.replace(/\/+$/, "");
        const query = options.query ? buildQuery(options.query) : "";
        const url = `${base}${options.path}${query}`;
        const started = performance.now();
        const headers: Record<string, string> = {
            Accept: "application/json",
        };
        if (options.body) {
            headers["Content-Type"] = "application/json";
        }
        if (token) {
            headers.Authorization = token;
        }
        setIsLoading(true);
        setLastRequest(`${options.method} ${url}`);
        setLastStatus("");
        setLastDuration("");
        setLastBody("");
        try {
            const response = await fetch(url, {
                method: options.method,
                headers,
                body: options.body ? JSON.stringify(options.body) : undefined,
            });
            const duration = `${Math.round(performance.now() - started)} ms`;
            const text = await response.text();
            try {
                setLastBody(formatBody(JSON.parse(text)));
            } catch {
                setLastBody(text || "Empty response.");
            }
            setLastStatus(`${response.status} ${response.ok ? "OK" : "ERROR"}`);
            setLastDuration(duration);
        } catch (error) {
            const message = error instanceof Error ? error.message : "Unknown error";
            setLastStatus("NETWORK ERROR");
            setLastDuration("");
            setLastBody(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="finance-page">
            <section className="finance-page__hero">
                <div className="finance-page__hero-text">
                    <div className="hero-eyebrow">Консоль финансов</div>
                    <h1>Полный контроль денежных потоков.</h1>
                    <p>
                        Регистрируйте операции, сверяйте кассы, анализируйте игры, выявляйте
                        аномалии и формируйте финансовые отчеты в одном центре управления.
                    </p>
                    <div className="hero-note">
                        База API: <strong>{baseUrl || "прокси"}</strong>
                    </div>
                </div>
                <div className="finance-page__hero-stats">
                    <div className="hero-pill">Операции</div>
                    <div className="hero-pill">Сверка кассы</div>
                    <div className="hero-pill">Анализ игр</div>
                    <div className="hero-pill">Аномалии</div>
                    <div className="hero-pill hero-pill--dark">
                        {isLoading ? "Выполняю запрос..." : "Готово к работе"}
                    </div>
                </div>
            </section>

            <section className="finance-page__grid">
                <div className="panel">
                    <div className="panel__title">Кассовые операции</div>
                    <div className="panel__section">
                        <h3>Создать операцию</h3>
                        <div className="form-grid">
                            <label>
                                UUID кассы
                                <input
                                    value={operationCashDeskId}
                                    onChange={(e) => setOperationCashDeskId(e.target.value)}
                                    placeholder="UUID кассы"
                                />
                            </label>
                            <label>
                                Сумма
                                <input
                                    type="number"
                                    value={operationAmount}
                                    onChange={(e) => setOperationAmount(e.target.value)}
                                    placeholder="0.00"
                                />
                            </label>
                            <label>
                                Тип
                                <select
                                    value={operationType}
                                    onChange={(e) => setOperationType(e.target.value)}
                                >
                                    {OPERATION_TYPES.map((type) => (
                                        <option key={type} value={type}>
                                            {type}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <label>
                                Валюта
                                <input
                                    value={operationCurrency}
                                    onChange={(e) => setOperationCurrency(e.target.value)}
                                    placeholder="RUB"
                                />
                            </label>
                        </div>
                        <button
                            className="primary-button"
                            type="button"
                            onClick={() =>
                                runRequest({
                                    method: "POST",
                                    path: "/api/finance/operations",
                                    body: {
                                        cashDeskId: operationCashDeskId,
                                        amount: operationAmount ? Number(operationAmount) : undefined,
                                        type: operationType,
                                        currency: operationCurrency || undefined,
                                    },
                                })
                            }
                        >
                            Создать операцию
                        </button>
                    </div>
                    <div className="panel__section">
                        <h3>Поиск операций</h3>
                        <div className="inline-row">
                            <button
                                className="ghost-button"
                                type="button"
                                onClick={() =>
                                    runRequest({
                                        method: "GET",
                                        path: "/api/finance/operations",
                                    })
                                }
                            >
                                Получить все операции
                            </button>
                        </div>
                        <div className="inline-row">
                            <input
                                value={operationId}
                                onChange={(e) => setOperationId(e.target.value)}
                                placeholder="UUID операции"
                            />
                            <button
                                className="ghost-button"
                                type="button"
                                onClick={() =>
                                    runRequest({
                                        method: "GET",
                                        path: `/api/finance/operations/${operationId}`,
                                    })
                                }
                            >
                                Операция по ID
                            </button>
                        </div>
                    </div>
                </div>

                <div className="panel">
                    <div className="panel__title">Сверка кассы</div>
                    <div className="panel__section">
                        <h3>Выполнить сверку</h3>
                        <div className="form-grid">
                            <label>
                                UUID кассы
                                <input
                                    value={reconciliationCashDeskId}
                                    onChange={(e) => setReconciliationCashDeskId(e.target.value)}
                                    placeholder="UUID кассы"
                                />
                            </label>
                            <label>
                                Начало смены
                                <input
                                    type="datetime-local"
                                    value={reconciliationShiftStart}
                                    onChange={(e) => setReconciliationShiftStart(e.target.value)}
                                />
                            </label>
                            <label>
                                Конец смены
                                <input
                                    type="datetime-local"
                                    value={reconciliationShiftEnd}
                                    onChange={(e) => setReconciliationShiftEnd(e.target.value)}
                                />
                            </label>
                            <label>
                                Фактический баланс
                                <input
                                    type="number"
                                    value={reconciliationActualBalance}
                                    onChange={(e) => setReconciliationActualBalance(e.target.value)}
                                />
                            </label>
                            <label className="form-span">
                                Примечания
                                <textarea
                                    value={reconciliationNotes}
                                    onChange={(e) => setReconciliationNotes(e.target.value)}
                                    placeholder="Примечания или пояснение"
                                />
                            </label>
                        </div>
                        <button
                            className="primary-button"
                            type="button"
                            onClick={() =>
                                runRequest({
                                    method: "POST",
                                    path: "/api/finance/reconciliation",
                                    body: {
                                        cashDeskId: reconciliationCashDeskId,
                                        shiftStart: toIso(reconciliationShiftStart),
                                        shiftEnd: toIso(reconciliationShiftEnd),
                                        actualBalance: reconciliationActualBalance
                                            ? Number(reconciliationActualBalance)
                                            : undefined,
                                        notes: reconciliationNotes || undefined,
                                    },
                                })
                            }
                        >
                            Запустить сверку
                        </button>
                    </div>
                    <div className="panel__section">
                        <h3>Поиск сверок</h3>
                        <div className="inline-row">
                            <input
                                value={reconciliationId}
                                onChange={(e) => setReconciliationId(e.target.value)}
                                placeholder="UUID сверки"
                            />
                            <button
                                className="ghost-button"
                                type="button"
                                onClick={() =>
                                    runRequest({
                                        method: "GET",
                                        path: `/api/finance/reconciliation/${reconciliationId}`,
                                    })
                                }
                            >
                                Сверка по ID
                            </button>
                        </div>
                        <div className="inline-row">
                            <input
                                value={reconciliationCashDeskFilter}
                                onChange={(e) => setReconciliationCashDeskFilter(e.target.value)}
                                placeholder="UUID кассы"
                            />
                            <button
                                className="ghost-button"
                                type="button"
                                onClick={() =>
                                    runRequest({
                                        method: "GET",
                                        path: `/api/finance/reconciliation/cashdesk/${reconciliationCashDeskFilter}`,
                                    })
                                }
                            >
                                По кассе
                            </button>
                        </div>
                    </div>
                    <div className="panel__section">
                        <h3>Обновить статус сверки</h3>
                        <div className="inline-row">
                            <input
                                value={reconciliationStatusId}
                                onChange={(e) => setReconciliationStatusId(e.target.value)}
                                placeholder="UUID сверки"
                            />
                            <select
                                value={reconciliationStatus}
                                onChange={(e) => setReconciliationStatus(e.target.value)}
                            >
                                {RECONCILIATION_STATUSES.map((status) => (
                                    <option key={status} value={status}>
                                        {status}
                                    </option>
                                ))}
                            </select>
                            <button
                                className="ghost-button"
                                type="button"
                                onClick={() =>
                                    runRequest({
                                        method: "PATCH",
                                        path: `/api/finance/reconciliation/${reconciliationStatusId}/status`,
                                        query: {status: reconciliationStatus},
                                    })
                                }
                            >
                                Обновить статус
                            </button>
                        </div>
                    </div>
                </div>

                <div className="panel">
                    <div className="panel__title">Анализ игр</div>
                    <div className="panel__section">
                        <h3>Анализ игровых сессий</h3>
                        <div className="form-grid">
                            <label>
                                Начало периода
                                <input
                                    type="datetime-local"
                                    value={analysisStart}
                                    onChange={(e) => setAnalysisStart(e.target.value)}
                                />
                            </label>
                            <label>
                                Конец периода
                                <input
                                    type="datetime-local"
                                    value={analysisEnd}
                                    onChange={(e) => setAnalysisEnd(e.target.value)}
                                />
                            </label>
                            <label>
                                ID игрового стола
                                <input
                                    value={analysisTableId}
                                    onChange={(e) => setAnalysisTableId(e.target.value)}
                                    placeholder="Необязательно"
                                />
                            </label>
                            <label>
                                Ожидаемый RTP %
                                <input
                                    type="number"
                                    value={analysisExpectedRtp}
                                    onChange={(e) => setAnalysisExpectedRtp(e.target.value)}
                                />
                            </label>
                            <label>
                                Порог крупного выигрыша
                                <input
                                    type="number"
                                    value={analysisLargeWin}
                                    onChange={(e) => setAnalysisLargeWin(e.target.value)}
                                />
                            </label>
                        </div>
                        <button
                            className="primary-button"
                            type="button"
                            onClick={() =>
                                runRequest({
                                    method: "POST",
                                    path: "/api/finance/game-analysis",
                                    body: {
                                        periodStart: toIso(analysisStart),
                                        periodEnd: toIso(analysisEnd),
                                        gameTableId: analysisTableId || undefined,
                                        expectedRtp: analysisExpectedRtp
                                            ? Number(analysisExpectedRtp)
                                            : undefined,
                                        largeWinThreshold: analysisLargeWin
                                            ? Number(analysisLargeWin)
                                            : undefined,
                                    },
                                })
                            }
                        >
                            Запустить анализ
                        </button>
                    </div>
                    <div className="panel__section">
                        <h3>Поиск анализов</h3>
                        <div className="inline-row">
                            <input
                                value={analysisId}
                                onChange={(e) => setAnalysisId(e.target.value)}
                                placeholder="UUID анализа"
                            />
                            <button
                                className="ghost-button"
                                type="button"
                                onClick={() =>
                                    runRequest({
                                        method: "GET",
                                        path: `/api/finance/game-analysis/${analysisId}`,
                                    })
                                }
                            >
                                Анализ по ID
                            </button>
                        </div>
                        <div className="inline-row">
                            <input
                                value={analysisTableFilter}
                                onChange={(e) => setAnalysisTableFilter(e.target.value)}
                                placeholder="ID игрового стола"
                            />
                            <button
                                className="ghost-button"
                                type="button"
                                onClick={() =>
                                    runRequest({
                                        method: "GET",
                                        path: `/api/finance/game-analysis/table/${analysisTableFilter}`,
                                    })
                                }
                            >
                                По столу
                            </button>
                        </div>
                    </div>
                </div>

                <div className="panel">
                    <div className="panel__title">Финансовый отчет</div>
                    <div className="panel__section">
                        <h3>Сформировать CSV отчет</h3>
                        <div className="form-grid">
                            <label>
                                Начало периода
                                <input
                                    type="date"
                                    value={reportStart}
                                    onChange={(e) => setReportStart(e.target.value)}
                                />
                            </label>
                            <label>
                                Конец периода
                                <input
                                    type="date"
                                    value={reportEnd}
                                    onChange={(e) => setReportEnd(e.target.value)}
                                />
                            </label>
                        </div>
                        <button
                            className="primary-button"
                            type="button"
                            onClick={() =>
                                runRequest({
                                    method: "POST",
                                    path: "/api/finance/reports",
                                    body: {
                                        periodStart: reportStart || undefined,
                                        periodEnd: reportEnd || undefined,
                                    },
                                })
                            }
                        >
                            Сформировать отчет
                        </button>
                    </div>
                </div>

                <div className="panel">
                    <div className="panel__title">Выявление аномалий</div>
                    <div className="panel__section">
                        <h3>Запустить детекцию</h3>
                        <div className="form-grid">
                            <label>
                                Начало периода
                                <input
                                    type="datetime-local"
                                    value={anomalyStart}
                                    onChange={(e) => setAnomalyStart(e.target.value)}
                                />
                            </label>
                            <label>
                                Конец периода
                                <input
                                    type="datetime-local"
                                    value={anomalyEnd}
                                    onChange={(e) => setAnomalyEnd(e.target.value)}
                                />
                            </label>
                            <label>
                                Порог крупной суммы
                                <input
                                    type="number"
                                    value={anomalyLargeAmount}
                                    onChange={(e) => setAnomalyLargeAmount(e.target.value)}
                                />
                            </label>
                            <label>
                                Порог частоты
                                <input
                                    type="number"
                                    value={anomalyFrequency}
                                    onChange={(e) => setAnomalyFrequency(e.target.value)}
                                />
                            </label>
                            <label>
                                Окно времени (мин)
                                <input
                                    type="number"
                                    value={anomalyWindow}
                                    onChange={(e) => setAnomalyWindow(e.target.value)}
                                />
                            </label>
                        </div>
                        <button
                            className="primary-button"
                            type="button"
                            onClick={() =>
                                runRequest({
                                    method: "POST",
                                    path: "/api/finance/anomalies/detect",
                                    body: {
                                        periodStart: toIso(anomalyStart),
                                        periodEnd: toIso(anomalyEnd),
                                        largeAmountThreshold: anomalyLargeAmount
                                            ? Number(anomalyLargeAmount)
                                            : undefined,
                                        frequencyThreshold: anomalyFrequency
                                            ? Number(anomalyFrequency)
                                            : undefined,
                                        timeWindowMinutes: anomalyWindow
                                            ? Number(anomalyWindow)
                                            : undefined,
                                    },
                                })
                            }
                        >
                            Запустить детекцию
                        </button>
                    </div>
                    <div className="panel__section">
                        <h3>Просмотр аномалий</h3>
                        <div className="inline-row">
                            <select
                                value={anomalyStatusFilter}
                                onChange={(e) => setAnomalyStatusFilter(e.target.value)}
                            >
                                <option value="">Все статусы</option>
                                {ANOMALY_STATUSES.map((status) => (
                                    <option key={status} value={status}>
                                        {status}
                                    </option>
                                ))}
                            </select>
                            <select
                                value={anomalyRiskFilter}
                                onChange={(e) => setAnomalyRiskFilter(e.target.value)}
                            >
                                <option value="">Все уровни риска</option>
                                {RISK_LEVELS.map((risk) => (
                                    <option key={risk} value={risk}>
                                        {risk}
                                    </option>
                                ))}
                            </select>
                            <button
                                className="ghost-button"
                                type="button"
                                onClick={() =>
                                    runRequest({
                                        method: "GET",
                                        path: "/api/finance/anomalies",
                                        query: {
                                            status: anomalyStatusFilter || undefined,
                                            riskLevel: anomalyRiskFilter || undefined,
                                        },
                                    })
                            }
                        >
                            Получить аномалии
                        </button>
                        </div>
                        <div className="inline-row">
                            <input
                                value={anomalyId}
                                onChange={(e) => setAnomalyId(e.target.value)}
                                placeholder="UUID аномалии"
                            />
                            <button
                                className="ghost-button"
                                type="button"
                                onClick={() =>
                                    runRequest({
                                        method: "GET",
                                        path: `/api/finance/anomalies/${anomalyId}`,
                                    })
                                }
                            >
                                Аномалия по ID
                            </button>
                        </div>
                    </div>
                    <div className="panel__section">
                        <h3>Проверка аномалии</h3>
                        <div className="form-grid">
                            <label>
                                UUID аномалии
                                <input
                                    value={anomalyReviewId}
                                    onChange={(e) => setAnomalyReviewId(e.target.value)}
                                    placeholder="UUID аномалии"
                                />
                            </label>
                            <label>
                                Статус
                                <select
                                    value={anomalyReviewStatus}
                                    onChange={(e) => setAnomalyReviewStatus(e.target.value)}
                                >
                                    {ANOMALY_STATUSES.map((status) => (
                                        <option key={status} value={status}>
                                            {status}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <label>
                                UUID проверяющего
                                <input
                                    value={anomalyReviewerId}
                                    onChange={(e) => setAnomalyReviewerId(e.target.value)}
                                    placeholder="UUID проверяющего"
                                />
                            </label>
                            <label className="form-span">
                                Примечания
                                <textarea
                                    value={anomalyReviewNotes}
                                    onChange={(e) => setAnomalyReviewNotes(e.target.value)}
                                    placeholder="Комментарий"
                                />
                            </label>
                        </div>
                        <button
                            className="ghost-button"
                            type="button"
                            onClick={() =>
                                runRequest({
                                    method: "POST",
                                    path: `/api/finance/anomalies/${anomalyReviewId}/review`,
                                    query: {
                                        status: anomalyReviewStatus,
                                        reviewerId: anomalyReviewerId,
                                        notes: anomalyReviewNotes || undefined,
                                    },
                                })
                            }
                        >
                            Отправить проверку
                        </button>
                    </div>
                </div>
            </section>

            <section className="panel panel--wide">
                <div className="panel__title">Последний ответ</div>
                <div className="response-meta">
                    <span>{lastRequest || "Выполните запрос, чтобы увидеть детали."}</span>
                    <span>{lastStatus}</span>
                    <span>{lastDuration}</span>
                </div>
                <pre className="response-body">{lastBody || "Тело ответа появится здесь."}</pre>
            </section>
        </div>
    );
};

export default FinancePage;
