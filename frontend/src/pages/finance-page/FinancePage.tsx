import {useEffect, useState} from "react";
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

const generateUuid = () => {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        return crypto.randomUUID();
    }
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
        const rand = (Math.random() * 16) | 0;
        const value = char === "x" ? rand : (rand & 0x3) | 0x8;
        return value.toString(16);
    });
};

type GameAnalysisItem = {
    id: string;
    gameTableId?: string;
    cashDeskId?: string;
    periodStart?: string;
    periodEnd?: string;
    totalSessions?: number;
    totalBets?: number;
    totalWins?: number;
    rtp?: number;
    expectedRtp?: number;
    rtpDeviation?: number;
    largeWinsCount?: number;
    largestWinAmount?: number;
    status?: string;
    analyzedAt?: string;
    notes?: string;
};

type AnomalyItem = {
    id: string;
    cashOperationId?: string;
    type?: string;
    riskLevel?: string;
    reason?: string;
    amount?: number | string;
    detectedAt?: string;
    status?: string;
    reviewedBy?: string;
    reviewedAt?: string;
    reviewerNotes?: string;
};

type FinancialReportInfo = {
    id?: string;
    periodStart?: string;
    periodEnd?: string;
    csvUrl?: string;
};

type CashOperationItem = {
    id: string;
    cashDeskId?: string;
    gameTableId?: string;
    amount?: number | string;
    type?: string;
    currency?: string;
    operatedAt?: string;
};

type CashReconciliationItem = {
    id?: string;
    cashDeskId?: string;
    shiftStart?: string;
    shiftEnd?: string;
    expectedBalance?: number | string;
    actualBalance?: number | string;
    discrepancy?: number | string;
    status?: string;
    createdAt?: string;
    notes?: string;
};

type EmployeeOption = {
    id: string;
    firstName: string;
    lastName: string;
    middleName?: string;
};

const toGameAnalysisList = (data: unknown): GameAnalysisItem[] => {
    if (Array.isArray(data)) {
        return data as GameAnalysisItem[];
    }
    if (data && typeof data === "object") {
        return [data as GameAnalysisItem];
    }
    return [];
};

const toAnomalyList = (data: unknown): AnomalyItem[] => {
    if (Array.isArray(data)) {
        return data as AnomalyItem[];
    }
    if (data && typeof data === "object") {
        return [data as AnomalyItem];
    }
    return [];
};

const toFinancialReport = (data: unknown): FinancialReportInfo | null => {
    if (!data) {
        return null;
    }
    if (Array.isArray(data)) {
        const first = data[0] as FinancialReportInfo | undefined;
        return first ?? null;
    }
    if (typeof data === "object") {
        return data as FinancialReportInfo;
    }
    return null;
};

const toCashOperationList = (data: unknown): CashOperationItem[] => {
    if (Array.isArray(data)) {
        return data as CashOperationItem[];
    }
    if (data && typeof data === "object") {
        return [data as CashOperationItem];
    }
    return [];
};

const toCashReconciliation = (data: unknown): CashReconciliationItem | null => {
    if (!data) {
        return null;
    }
    if (Array.isArray(data)) {
        const first = data[0] as CashReconciliationItem | undefined;
        return first ?? null;
    }
    if (typeof data === "object") {
        return data as CashReconciliationItem;
    }
    return null;
};

const toCashReconciliationList = (data: unknown): CashReconciliationItem[] => {
    if (Array.isArray(data)) {
        return data as CashReconciliationItem[];
    }
    if (data && typeof data === "object") {
        return [data as CashReconciliationItem];
    }
    return [];
};

const toEmployeeOptions = (data: unknown): EmployeeOption[] => {
    if (Array.isArray(data)) {
        return data as EmployeeOption[];
    }
    if (data && typeof data === "object") {
        return [data as EmployeeOption];
    }
    return [];
};

const formatEmployeeName = (employee?: EmployeeOption) => {
    if (!employee) {
        return "";
    }
    return [employee.lastName, employee.firstName, employee.middleName]
        .filter(Boolean)
        .join(" ");
};

const formatDateTime = (value?: string) => {
    if (!value) {
        return "-";
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return value;
    }
    return date.toLocaleString();
};

const FinancePage = () => {
    const {token, baseUrl} = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [lastRequest, setLastRequest] = useState("");
    const [lastStatus, setLastStatus] = useState("");
    const [lastDuration, setLastDuration] = useState("");
    const [lastBody, setLastBody] = useState("");
    const [employeeOptions, setEmployeeOptions] = useState<EmployeeOption[]>([]);

    const [operationCashDeskId, setOperationCashDeskId] = useState("");
    const [operationAmount, setOperationAmount] = useState("");
    const [operationType, setOperationType] = useState("DEPOSIT");
    const [operationCurrency, setOperationCurrency] = useState("RUB");
    const [operationId, setOperationId] = useState("");
    const [operationResults, setOperationResults] = useState<CashOperationItem[]>([]);

    const [reconciliationCashDeskId, setReconciliationCashDeskId] = useState(() => generateUuid());
    const [reconciliationShiftStart, setReconciliationShiftStart] = useState("");
    const [reconciliationShiftEnd, setReconciliationShiftEnd] = useState("");
    const [reconciliationActualBalance, setReconciliationActualBalance] = useState("");
    const [reconciliationNotes, setReconciliationNotes] = useState("");
    const [reconciliationId, setReconciliationId] = useState("");
    const [reconciliationCashDeskFilter, setReconciliationCashDeskFilter] = useState("");
    const [reconciliationStatusId, setReconciliationStatusId] = useState("");
    const [reconciliationStatus, setReconciliationStatus] = useState("PENDING");
    const [reconciliationResult, setReconciliationResult] = useState<CashReconciliationItem | null>(null);
    const [reconciliationResults, setReconciliationResults] = useState<CashReconciliationItem[]>([]);

    const [analysisStart, setAnalysisStart] = useState("");
    const [analysisEnd, setAnalysisEnd] = useState("");
    const [analysisTableId, setAnalysisTableId] = useState("");
    const [analysisExpectedRtp, setAnalysisExpectedRtp] = useState("95");
    const [analysisLargeWin, setAnalysisLargeWin] = useState("1000");
    const [analysisId, setAnalysisId] = useState("");
    const [analysisTableFilter, setAnalysisTableFilter] = useState("");
    const [analysisResults, setAnalysisResults] = useState<GameAnalysisItem[]>([]);

    const [reportStart, setReportStart] = useState("");
    const [reportEnd, setReportEnd] = useState("");
    const [reportInfo, setReportInfo] = useState<FinancialReportInfo | null>(null);

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
    const [anomalyResults, setAnomalyResults] = useState<AnomalyItem[]>([]);

    const runRequest = async (options: {
        method: string;
        path: string;
        query?: Record<string, string | undefined>;
        body?: unknown;
        onSuccess?: (data: unknown) => void;
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
            let parsed: unknown = text || "Empty response.";
            try {
                parsed = JSON.parse(text);
            } catch {
                parsed = text || "Empty response.";
            }
            setLastBody(formatBody(parsed));
            if (response.ok && options.onSuccess) {
                options.onSuccess(parsed);
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

    const resolveReportUrl = (url: string) => {
        if (!url) {
            return "";
        }
        if (/^https?:\/\//i.test(url)) {
            return url;
        }
        const base = baseUrl.replace(/\/+$/, "");
        if (!base) {
            return url.startsWith("/") ? url : `/${url}`;
        }
        return `${base}${url.startsWith("/") ? "" : "/"}${url}`;
    };

    const downloadFinancialReport = async () => {
        if (!reportInfo?.csvUrl) {
            return;
        }
        const url = resolveReportUrl(reportInfo.csvUrl);
        setIsLoading(true);
        setLastRequest(`GET ${url}`);
        setLastStatus("");
        setLastDuration("");
        setLastBody("");
        const link = document.createElement("a");
        link.href = url;
        link.download = `financial-report-${reportInfo.id ?? "report"}.csv`;
        link.rel = "noreferrer";
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        link.remove();
        setLastStatus("OK");
        setLastDuration("0 ms");
        setLastBody("Ссылка на CSV открыта для скачивания.");
        setIsLoading(false);
    };

    useEffect(() => {
        if (!token) {
            return;
        }
        const base = baseUrl.replace(/\/+$/, "");
        fetch(`${base}/api/staff/employees`, {
            headers: {
                Accept: "application/json",
                Authorization: token,
            },
        })
            .then((response) => (response.ok ? response.json() : []))
            .then((data) => setEmployeeOptions(toEmployeeOptions(data)))
            .catch(() => setEmployeeOptions([]));
    }, [token, baseUrl]);

    const tableIdOptions = Array.from(
        new Set(
            operationResults
                .map((item) => item.gameTableId || item.cashDeskId)
                .filter((value): value is string => Boolean(value))
        )
    );

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
                                    onSuccess: (data) => setOperationResults(toCashOperationList(data)),
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
                                        onSuccess: (data) => setOperationResults(toCashOperationList(data)),
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
                                        onSuccess: (data) => setOperationResults(toCashOperationList(data)),
                                    })
                                }
                            >
                                Операция по ID
                            </button>
                        </div>
                    </div>
                    <div className="panel__section">
                        <h3>Список операций</h3>
                        {operationResults.length ? (
                            <div className="operation-list">
                                {operationResults.map((item) => (
                                    <div className="operation-card" key={item.id}>
                                        <div className="operation-card__title">
                                            {item.type || "Операция"} {item.currency ? `· ${item.currency}` : ""}
                                        </div>
                                        <div className="operation-card__meta">
                                            <span>UUID кассы: {item.cashDeskId || "—"}</span>
                                            <span>Сумма: {item.amount ?? "—"}</span>
                                            <span>Дата: {formatDateTime(item.operatedAt)}</span>
                                        </div>
                                        <div className="operation-card__id">UUID: {item.id}</div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="hint">Операции появятся после запроса.</div>
                        )}
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
                            onClick={() => {
                                const cashDeskId = reconciliationCashDeskId || generateUuid();
                                if (!reconciliationCashDeskId) {
                                    setReconciliationCashDeskId(cashDeskId);
                                }
                                runRequest({
                                    method: "POST",
                                    path: "/api/finance/reconciliation",
                                    body: {
                                        cashDeskId,
                                        shiftStart: toIso(reconciliationShiftStart),
                                        shiftEnd: toIso(reconciliationShiftEnd),
                                        actualBalance: reconciliationActualBalance
                                            ? Number(reconciliationActualBalance)
                                            : undefined,
                                        notes: reconciliationNotes || undefined,
                                    },
                                    onSuccess: (data) => setReconciliationResult(toCashReconciliation(data)),
                                });
                            }}
                        >
                            Запустить сверку
                        </button>
                        {reconciliationResult?.id ? (
                            <div className="reconciliation-output">
                                UUID сверки: {reconciliationResult.id}
                            </div>
                        ) : null}
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
                                        onSuccess: (data) => setReconciliationResults(toCashReconciliationList(data)),
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
                                        onSuccess: (data) => setReconciliationResults(toCashReconciliationList(data)),
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
                                    onSuccess: (data) => setReconciliationResults(toCashReconciliationList(data)),
                                })
                            }
                        >
                            Обновить статус
                        </button>
                    </div>
                    <div className="panel__section">
                        <h3>Результаты сверок</h3>
                        {reconciliationResults.length ? (
                            <div className="reconciliation-list">
                                {reconciliationResults.map((item) => (
                                    <div className="reconciliation-card" key={item.id}>
                                        <div className="reconciliation-card__title">
                                            Сверка {item.status ? `· ${item.status}` : ""}
                                        </div>
                                        <div className="reconciliation-card__meta">
                                            <span>UUID кассы: {item.cashDeskId || "—"}</span>
                                            <span>Начало: {formatDateTime(item.shiftStart)}</span>
                                            <span>Конец: {formatDateTime(item.shiftEnd)}</span>
                                            <span>Ожид. баланс: {item.expectedBalance ?? "—"}</span>
                                            <span>Факт. баланс: {item.actualBalance ?? "—"}</span>
                                            <span>Расхождение: {item.discrepancy ?? "—"}</span>
                                            <span>Создано: {formatDateTime(item.createdAt)}</span>
                                        </div>
                                        <div className="reconciliation-card__desc">
                                            Примечание: {item.notes || "—"}
                                        </div>
                                        <div className="reconciliation-card__id">UUID: {item.id}</div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="hint">Сверки появятся после запроса.</div>
                        )}
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
                                <select
                                    value={analysisTableId}
                                    onChange={(e) => setAnalysisTableId(e.target.value)}
                                >
                                    <option value="">Все столы</option>
                                    {tableIdOptions.map((tableId) => (
                                        <option key={tableId} value={tableId}>
                                            {tableId}
                                        </option>
                                    ))}
                                </select>
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
                                    onSuccess: (data) => setAnalysisResults(toGameAnalysisList(data)),
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
                                        onSuccess: (data) => setAnalysisResults(toGameAnalysisList(data)),
                                    })
                                }
                            >
                                Анализ по ID
                            </button>
                        </div>
                        <div className="inline-row">
                            <select
                                value={analysisTableFilter}
                                onChange={(e) => setAnalysisTableFilter(e.target.value)}
                            >
                                <option value="">Выберите стол</option>
                                {tableIdOptions.map((tableId) => (
                                    <option key={tableId} value={tableId}>
                                        {tableId}
                                    </option>
                                ))}
                            </select>
                            <button
                                className="ghost-button"
                                type="button"
                                onClick={() =>
                                    runRequest({
                                        method: "GET",
                                        path: `/api/finance/game-analysis/table/${analysisTableFilter}`,
                                        onSuccess: (data) => setAnalysisResults(toGameAnalysisList(data)),
                                    })
                                }
                            >
                                По столу
                            </button>
                        </div>
                    </div>
                    <div className="panel__section">
                        <h3>Результаты анализа</h3>
                        {analysisResults.length ? (
                            <div className="analysis-list">
                                {analysisResults.map((item) => (
                                    <div className="analysis-card" key={item.id}>
                                        <div className="analysis-card__title">
                                            {item.gameTableId || "Все столы"} {item.status ? `· ${item.status}` : ""}
                                        </div>
                                        <div className="analysis-card__meta">
                                            <span>UUID стола: {item.gameTableId || "—"}</span>
                                            <span>UUID кассы: {item.cashDeskId || "—"}</span>
                                            <span>Период: {formatDateTime(item.periodStart)} — {formatDateTime(item.periodEnd)}</span>
                                            <span>Сессии: {item.totalSessions ?? 0}</span>
                                            <span>Ставки: {item.totalBets ?? 0}</span>
                                            <span>Выигрыши: {item.totalWins ?? 0}</span>
                                            <span>RTP: {item.rtp ?? 0}%</span>
                                            <span>Ожидаемый RTP: {item.expectedRtp ?? 0}%</span>
                                            {item.rtpDeviation !== undefined ? (
                                                <span>Отклонение: {item.rtpDeviation}%</span>
                                            ) : null}
                                            {item.largeWinsCount !== undefined ? (
                                                <span>Крупные выигрыши: {item.largeWinsCount}</span>
                                            ) : null}
                                            {item.largestWinAmount !== undefined ? (
                                                <span>Макс. выигрыш: {item.largestWinAmount}</span>
                                            ) : null}
                                            {item.analyzedAt ? <span>Проанализировано: {formatDateTime(item.analyzedAt)}</span> : null}
                                        </div>
                                        {item.notes ? (
                                            <div className="analysis-card__desc">{item.notes}</div>
                                        ) : null}
                                        <div className="analysis-card__id">{item.id}</div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="hint">Результаты появятся после запроса.</div>
                        )}
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
                                    onSuccess: (data) => setReportInfo(toFinancialReport(data)),
                                })
                            }
                        >
                            Сформировать отчет
                        </button>
                        {reportInfo ? (
                            <div className="report-output">
                                <div>UUID отчета: {reportInfo.id || "—"}</div>
                                <div>CSV ссылка: {reportInfo.csvUrl || "—"}</div>
                                <button
                                    className="ghost-button"
                                    type="button"
                                    onClick={downloadFinancialReport}
                                    disabled={!reportInfo.csvUrl}
                                >
                                    Скачать отчет
                                </button>
                            </div>
                        ) : (
                            <div className="hint">После формирования появится ссылка на отчет.</div>
                        )}
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
                                    onSuccess: (data) => setAnomalyResults(toAnomalyList(data)),
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
                                        onSuccess: (data) => setAnomalyResults(toAnomalyList(data)),
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
                                        onSuccess: (data) => setAnomalyResults(toAnomalyList(data)),
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
                                <select
                                    value={anomalyReviewerId}
                                    onChange={(e) => setAnomalyReviewerId(e.target.value)}
                                >
                                    <option value="">Выберите сотрудника</option>
                                    {employeeOptions.map((employee) => (
                                        <option key={employee.id} value={employee.id}>
                                            {formatEmployeeName(employee) || employee.id}
                                        </option>
                                    ))}
                                </select>
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
                                    onSuccess: (data) => setAnomalyResults(toAnomalyList(data)),
                                })
                            }
                        >
                            Отправить проверку
                        </button>
                    </div>
                    <div className="panel__section">
                        <h3>Результаты по аномалиям</h3>
                        {anomalyResults.length ? (
                            <div className="anomaly-list">
                                {anomalyResults.map((item) => (
                                    <div className="anomaly-card" key={item.id}>
                                        <div className="anomaly-card__title">
                                            Аномалия
                                        </div>
                                        <div className="anomaly-card__meta">
                                            <span>Тип: {item.type || "—"}</span>
                                            <span>Статус: {item.status || "—"}</span>
                                            <span>Операция: {item.cashOperationId || "—"}</span>
                                            <span>Риск: {item.riskLevel || "—"}</span>
                                            <span>Сумма: {item.amount ?? "—"}</span>
                                            <span>Обнаружено: {formatDateTime(item.detectedAt)}</span>
                                            <span>Проверил: {item.reviewedBy || "—"}</span>
                                            <span>Проверено: {formatDateTime(item.reviewedAt)}</span>
                                        </div>
                                        <div className="anomaly-card__desc">Причина: {item.reason || "—"}</div>
                                        <div className="anomaly-card__desc">
                                            Комментарий: {item.reviewerNotes || "—"}
                                        </div>
                                        <div className="anomaly-card__id">UUID: {item.id}</div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="hint">Результаты появятся после запроса.</div>
                        )}
                    </div>
                </div>
            </section>

        </div>
    );
};

export default FinancePage;
