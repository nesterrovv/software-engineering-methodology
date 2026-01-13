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
                    <div className="hero-eyebrow">Finance service console</div>
                    <h1>Money flow, fully controlled.</h1>
                    <p>
                        Register cash operations, reconcile registers, analyze games, detect
                        anomalies, and generate financial reports from a single command center.
                    </p>
                    <div className="hero-note">
                        API base: <strong>{baseUrl || "proxy"}</strong>
                    </div>
                </div>
                <div className="finance-page__hero-stats">
                    <div className="hero-pill">Operations</div>
                    <div className="hero-pill">Reconciliation</div>
                    <div className="hero-pill">Game analysis</div>
                    <div className="hero-pill">Anomalies</div>
                    <div className="hero-pill hero-pill--dark">
                        {isLoading ? "Running request..." : "Ready for action"}
                    </div>
                </div>
            </section>

            <section className="finance-page__grid">
                <div className="panel">
                    <div className="panel__title">Cash operations</div>
                    <div className="panel__section">
                        <h3>Create operation</h3>
                        <div className="form-grid">
                            <label>
                                Cash desk UUID
                                <input
                                    value={operationCashDeskId}
                                    onChange={(e) => setOperationCashDeskId(e.target.value)}
                                    placeholder="Cash desk UUID"
                                />
                            </label>
                            <label>
                                Amount
                                <input
                                    type="number"
                                    value={operationAmount}
                                    onChange={(e) => setOperationAmount(e.target.value)}
                                    placeholder="0.00"
                                />
                            </label>
                            <label>
                                Type
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
                                Currency
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
                            Create operation
                        </button>
                    </div>
                    <div className="panel__section">
                        <h3>Lookup operations</h3>
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
                                Fetch all operations
                            </button>
                        </div>
                        <div className="inline-row">
                            <input
                                value={operationId}
                                onChange={(e) => setOperationId(e.target.value)}
                                placeholder="Operation UUID"
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
                                Get operation by ID
                            </button>
                        </div>
                    </div>
                </div>

                <div className="panel">
                    <div className="panel__title">Cash reconciliation</div>
                    <div className="panel__section">
                        <h3>Reconcile cash desk</h3>
                        <div className="form-grid">
                            <label>
                                Cash desk UUID
                                <input
                                    value={reconciliationCashDeskId}
                                    onChange={(e) => setReconciliationCashDeskId(e.target.value)}
                                    placeholder="Cash desk UUID"
                                />
                            </label>
                            <label>
                                Shift start
                                <input
                                    type="datetime-local"
                                    value={reconciliationShiftStart}
                                    onChange={(e) => setReconciliationShiftStart(e.target.value)}
                                />
                            </label>
                            <label>
                                Shift end
                                <input
                                    type="datetime-local"
                                    value={reconciliationShiftEnd}
                                    onChange={(e) => setReconciliationShiftEnd(e.target.value)}
                                />
                            </label>
                            <label>
                                Actual balance
                                <input
                                    type="number"
                                    value={reconciliationActualBalance}
                                    onChange={(e) => setReconciliationActualBalance(e.target.value)}
                                />
                            </label>
                            <label className="form-span">
                                Notes
                                <textarea
                                    value={reconciliationNotes}
                                    onChange={(e) => setReconciliationNotes(e.target.value)}
                                    placeholder="Notes or explanation"
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
                            Run reconciliation
                        </button>
                    </div>
                    <div className="panel__section">
                        <h3>Reconciliation lookup</h3>
                        <div className="inline-row">
                            <input
                                value={reconciliationId}
                                onChange={(e) => setReconciliationId(e.target.value)}
                                placeholder="Reconciliation UUID"
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
                                Get by ID
                            </button>
                        </div>
                        <div className="inline-row">
                            <input
                                value={reconciliationCashDeskFilter}
                                onChange={(e) => setReconciliationCashDeskFilter(e.target.value)}
                                placeholder="Cash desk UUID"
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
                                Get by cash desk
                            </button>
                        </div>
                    </div>
                    <div className="panel__section">
                        <h3>Update reconciliation status</h3>
                        <div className="inline-row">
                            <input
                                value={reconciliationStatusId}
                                onChange={(e) => setReconciliationStatusId(e.target.value)}
                                placeholder="Reconciliation UUID"
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
                                Update status
                            </button>
                        </div>
                    </div>
                </div>

                <div className="panel">
                    <div className="panel__title">Game analysis</div>
                    <div className="panel__section">
                        <h3>Analyze game sessions</h3>
                        <div className="form-grid">
                            <label>
                                Period start
                                <input
                                    type="datetime-local"
                                    value={analysisStart}
                                    onChange={(e) => setAnalysisStart(e.target.value)}
                                />
                            </label>
                            <label>
                                Period end
                                <input
                                    type="datetime-local"
                                    value={analysisEnd}
                                    onChange={(e) => setAnalysisEnd(e.target.value)}
                                />
                            </label>
                            <label>
                                Game table ID
                                <input
                                    value={analysisTableId}
                                    onChange={(e) => setAnalysisTableId(e.target.value)}
                                    placeholder="Optional"
                                />
                            </label>
                            <label>
                                Expected RTP %
                                <input
                                    type="number"
                                    value={analysisExpectedRtp}
                                    onChange={(e) => setAnalysisExpectedRtp(e.target.value)}
                                />
                            </label>
                            <label>
                                Large win threshold
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
                            Run analysis
                        </button>
                    </div>
                    <div className="panel__section">
                        <h3>Analysis lookup</h3>
                        <div className="inline-row">
                            <input
                                value={analysisId}
                                onChange={(e) => setAnalysisId(e.target.value)}
                                placeholder="Analysis UUID"
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
                                Get by ID
                            </button>
                        </div>
                        <div className="inline-row">
                            <input
                                value={analysisTableFilter}
                                onChange={(e) => setAnalysisTableFilter(e.target.value)}
                                placeholder="Game table ID"
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
                                Get by table
                            </button>
                        </div>
                    </div>
                </div>

                <div className="panel">
                    <div className="panel__title">Financial report</div>
                    <div className="panel__section">
                        <h3>Generate CSV report</h3>
                        <div className="form-grid">
                            <label>
                                Period start
                                <input
                                    type="date"
                                    value={reportStart}
                                    onChange={(e) => setReportStart(e.target.value)}
                                />
                            </label>
                            <label>
                                Period end
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
                            Generate report
                        </button>
                    </div>
                </div>

                <div className="panel">
                    <div className="panel__title">Anomaly detection</div>
                    <div className="panel__section">
                        <h3>Detect anomalies</h3>
                        <div className="form-grid">
                            <label>
                                Period start
                                <input
                                    type="datetime-local"
                                    value={anomalyStart}
                                    onChange={(e) => setAnomalyStart(e.target.value)}
                                />
                            </label>
                            <label>
                                Period end
                                <input
                                    type="datetime-local"
                                    value={anomalyEnd}
                                    onChange={(e) => setAnomalyEnd(e.target.value)}
                                />
                            </label>
                            <label>
                                Large amount threshold
                                <input
                                    type="number"
                                    value={anomalyLargeAmount}
                                    onChange={(e) => setAnomalyLargeAmount(e.target.value)}
                                />
                            </label>
                            <label>
                                Frequency threshold
                                <input
                                    type="number"
                                    value={anomalyFrequency}
                                    onChange={(e) => setAnomalyFrequency(e.target.value)}
                                />
                            </label>
                            <label>
                                Time window (minutes)
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
                            Run detection
                        </button>
                    </div>
                    <div className="panel__section">
                        <h3>Browse anomalies</h3>
                        <div className="inline-row">
                            <select
                                value={anomalyStatusFilter}
                                onChange={(e) => setAnomalyStatusFilter(e.target.value)}
                            >
                                <option value="">All statuses</option>
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
                                <option value="">All risk levels</option>
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
                                Fetch anomalies
                            </button>
                        </div>
                        <div className="inline-row">
                            <input
                                value={anomalyId}
                                onChange={(e) => setAnomalyId(e.target.value)}
                                placeholder="Anomaly UUID"
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
                                Get by ID
                            </button>
                        </div>
                    </div>
                    <div className="panel__section">
                        <h3>Review anomaly</h3>
                        <div className="form-grid">
                            <label>
                                Anomaly UUID
                                <input
                                    value={anomalyReviewId}
                                    onChange={(e) => setAnomalyReviewId(e.target.value)}
                                    placeholder="Anomaly UUID"
                                />
                            </label>
                            <label>
                                Status
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
                                Reviewer UUID
                                <input
                                    value={anomalyReviewerId}
                                    onChange={(e) => setAnomalyReviewerId(e.target.value)}
                                    placeholder="Reviewer UUID"
                                />
                            </label>
                            <label className="form-span">
                                Notes
                                <textarea
                                    value={anomalyReviewNotes}
                                    onChange={(e) => setAnomalyReviewNotes(e.target.value)}
                                    placeholder="Review notes"
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
                            Submit review
                        </button>
                    </div>
                </div>
            </section>

            <section className="panel panel--wide">
                <div className="panel__title">Last response</div>
                <div className="response-meta">
                    <span>{lastRequest || "Run a request to see details."}</span>
                    <span>{lastStatus}</span>
                    <span>{lastDuration}</span>
                </div>
                <pre className="response-body">{lastBody || "Response payloads show up here."}</pre>
            </section>
        </div>
    );
};

export default FinancePage;
