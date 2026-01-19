import {useEffect, useMemo, useState} from "react";
import type {FormEvent} from "react";
import PageShell from "../../components/PageShell";
import {apiRequest} from "../../api/client";
import {useAuth} from "../../auth/AuthContext";
import {useReferenceData} from "../../hooks/useReferenceData";
import type {CashOperation, CashReconciliation} from "../../types";
const CashControlPage = () => {
    const {token, baseUrl} = useAuth();
    const {cashDesks} = useReferenceData();
    const [cashDeskId, setCashDeskId] = useState("");
    const [operations, setOperations] = useState<CashOperation[]>([]);
    const [reconciliations, setReconciliations] = useState<CashReconciliation[]>([]);
    const [reconciliationIdLookup, setReconciliationIdLookup] = useState("");
    const [reconciliationDetails, setReconciliationDetails] = useState<CashReconciliation | null>(null);
    const [reconciliationStatus, setReconciliationStatus] = useState("PENDING");

    const cashDeskOptions = useMemo(() => cashDesks.map((desk) => ({
        value: desk.id,
        label: `${desk.name}${desk.location ? ` · ${desk.location}` : ""}`,
    })), [cashDesks]);

    useEffect(() => {
        const loadOperations = async () => {
            try {
                const data = await apiRequest<CashOperation[]>(baseUrl, token, "/api/finance/operations");
                setOperations(data || []);
            } catch {
                setOperations([]);
            }
        };
        void loadOperations();
    }, [baseUrl, token]);

    const balance = useMemo(() => {
        return operations.reduce((sum, op) => {
            const amount = Number(op.amount ?? 0);
            if (op.type === "WITHDRAWAL") {
                return sum - amount;
            }
            return sum + amount;
        }, 0);
    }, [operations]);

    const discrepancy = useMemo(() => {
        if (!reconciliations.length) {
            return 0;
        }
        return Number(reconciliations[0].discrepancy ?? 0);
    }, [reconciliations]);

    const handleFetch = async (event: FormEvent) => {
        event.preventDefault();
        if (!cashDeskId) {
            return;
        }
        try {
            const data = await apiRequest<CashReconciliation[]>(
                baseUrl,
                token,
                `/api/finance/reconciliation/cashdesk/${cashDeskId}`
            );
            setReconciliations(data || []);
        } catch {
            setReconciliations([]);
        }
    };

    const handleFetchById = async () => {
        if (!reconciliationIdLookup) {
            return;
        }
        try {
            const data = await apiRequest<CashReconciliation>(
                baseUrl,
                token,
                `/api/finance/reconciliation/${reconciliationIdLookup}`
            );
            setReconciliationDetails(data);
        } catch {
            setReconciliationDetails(null);
        }
    };

    const handleUpdateStatus = async () => {
        if (!reconciliationIdLookup) {
            return;
        }
        try {
            const data = await apiRequest<CashReconciliation>(
                baseUrl,
                token,
                `/api/finance/reconciliation/${reconciliationIdLookup}/status?status=${reconciliationStatus}`,
                {method: "PATCH"}
            );
            setReconciliationDetails(data);
            setReconciliations((prev) => prev.map((item) => (item.id === data.id ? data : item)));
        } catch {
            // ignore
        }
    };

    return (
        <PageShell
            title="Контроль кассы"
            subtitle="Отслеживание состояния касс, сверка и анализ операций."
            className="theme-green"
        >
            <section className="overview">
                <h2>Общее состояние</h2>
                <div className="card">
                    <h3>Текущий остаток:</h3>
                    <p className="data">₽ {balance.toLocaleString("ru-RU")}</p>
                </div>
                <div className="card">
                    <h3>Несоответствия за смену:</h3>
                    <p className="data">₽ {discrepancy.toLocaleString("ru-RU")}</p>
                    {discrepancy !== 0 ? <div className="alert">Обнаружено расхождение!</div> : null}
                </div>
                <form onSubmit={handleFetch} className="stacked-form">
                    <label>
                        Касса
                        <select value={cashDeskId} onChange={(event) => setCashDeskId(event.target.value)}>
                            <option value="">Выберите кассу</option>
                            {cashDeskOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label || option.value}
                                </option>
                            ))}
                        </select>
                    </label>
                    <button type="submit" className="primary-button">Обновить сверку</button>
                </form>
                <div className="card">
                    <h3>Сверка по ID</h3>
                    <label>
                        ID сверки
                        <input
                            value={reconciliationIdLookup}
                            onChange={(event) => setReconciliationIdLookup(event.target.value)}
                        />
                    </label>
                    <div className="inline-actions">
                        <button type="button" className="secondary-button" onClick={handleFetchById}>
                            Найти сверку
                        </button>
                        <button type="button" className="secondary-button" onClick={handleUpdateStatus}>
                            Обновить статус
                        </button>
                    </div>
                    <label>
                        Новый статус
                        <select value={reconciliationStatus} onChange={(event) => setReconciliationStatus(event.target.value)}>
                            <option value="PENDING">PENDING</option>
                            <option value="CONFIRMED">CONFIRMED</option>
                            <option value="DISCREPANCY_FOUND">DISCREPANCY_FOUND</option>
                            <option value="RESOLVED">RESOLVED</option>
                        </select>
                    </label>
                    {reconciliationDetails ? (
                        <div className="report-output">
                            <p><strong>ID:</strong> {reconciliationDetails.id}</p>
                            <p><strong>Статус:</strong> {reconciliationDetails.status}</p>
                            <p><strong>Расхождение:</strong> {reconciliationDetails.discrepancy ?? "0"}</p>
                        </div>
                    ) : null}
                </div>
            </section>

            <section className="history">
                <h2>История операций</h2>
                <table>
                    <thead>
                    <tr>
                        <th>Дата</th>
                        <th>Тип операции</th>
                        <th>Сумма</th>
                        <th>Ответственный</th>
                    </tr>
                    </thead>
                    <tbody>
                    {operations.slice(0, 5).map((operation) => (
                        <tr key={operation.id}>
                            <td>{operation.operatedAt ? new Date(operation.operatedAt).toLocaleString("ru-RU") : "—"}</td>
                            <td>{operation.type}</td>
                            <td>₽ {Number(operation.amount ?? 0).toLocaleString("ru-RU")}</td>
                            <td>{operation.cashDeskId}</td>
                        </tr>
                    ))}
                    {operations.length === 0 ? (
                        <tr>
                            <td colSpan={4}>Операции отсутствуют.</td>
                        </tr>
                    ) : null}
                    </tbody>
                </table>
            </section>
        </PageShell>
    );
};

export default CashControlPage;
