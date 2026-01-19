import {useMemo, useState} from "react";
import type {FormEvent} from "react";
import PageShell from "../../components/PageShell";
import {apiRequest} from "../../api/client";
import {useAuth} from "../../auth/AuthContext";
import {useReferenceData} from "../../hooks/useReferenceData";
import type {CashOperation} from "../../types";

const OperationsPage = () => {
    const {token, baseUrl} = useAuth();
    const {cashDesks} = useReferenceData();
    const [dateTime, setDateTime] = useState("");
    const [type, setType] = useState("DEPOSIT");
    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");
    const [cashDeskId, setCashDeskId] = useState("");
    const [statusMessage, setStatusMessage] = useState("");
    const [error, setError] = useState("");
    const [operationIdLookup, setOperationIdLookup] = useState("");
    const [operationDetails, setOperationDetails] = useState<CashOperation | null>(null);

    const cashDeskOptions = useMemo(() => cashDesks.map((desk) => ({
        value: desk.id,
        label: `${desk.name}${desk.location ? ` · ${desk.location}` : ""}`,
    })), [cashDesks]);

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setError("");
        setStatusMessage("");
        if (!cashDeskId || !amount) {
            setError("Выберите кассу и укажите сумму.");
            return;
        }
        try {
            await apiRequest(baseUrl, token, "/api/finance/operations", {
                method: "POST",
                body: JSON.stringify({
                    cashDeskId,
                    amount,
                    type,
                    currency: "RUB",
                }),
            });
            setStatusMessage("Операция сохранена.");
            setAmount("");
            setDescription("");
        } catch {
            setError("Не удалось сохранить операцию.");
        }
    };

    const handleFetchOperation = async () => {
        setError("");
        if (!operationIdLookup) {
            setError("Укажите ID операции.");
            return;
        }
        try {
            const data = await apiRequest<CashOperation>(
                baseUrl,
                token,
                `/api/finance/operations/${operationIdLookup}`
            );
            setOperationDetails(data);
        } catch {
            setError("Не удалось получить операцию.");
        }
    };

    return (
        <PageShell
            title="Фиксация операций"
            subtitle="Ввод и сохранение операций, связанных с финансами казино."
            className="theme-green"
        >
            <section>
                <h2>Новая операция</h2>
                <form onSubmit={handleSubmit} className="card stacked-form">
                    <label>
                        Дата и время
                        <input
                            type="datetime-local"
                            value={dateTime}
                            onChange={(event) => setDateTime(event.target.value)}
                        />
                    </label>
                    <label>
                        Касса
                        <select
                            value={cashDeskId}
                            onChange={(event) => setCashDeskId(event.target.value)}
                        >
                            <option value="">Выберите кассу</option>
                            {cashDeskOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label || option.value}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label>
                        Тип операции
                        <select value={type} onChange={(event) => setType(event.target.value)}>
                            <option value="DEPOSIT">Внесение наличных</option>
                            <option value="WITHDRAWAL">Снятие наличных</option>
                        </select>
                    </label>
                    <label>
                        Сумма
                        <input
                            type="number"
                            value={amount}
                            onChange={(event) => setAmount(event.target.value)}
                            placeholder="Введите сумму"
                        />
                    </label>
                    <label>
                        Описание
                        <input
                            value={description}
                            onChange={(event) => setDescription(event.target.value)}
                            placeholder="Комментарий к операции"
                        />
                    </label>
                    <button type="submit" className="button">Сохранить операцию</button>
                    {statusMessage ? <div className="form-success">{statusMessage}</div> : null}
                    {error ? <div className="form-error">{error}</div> : null}
                </form>
            </section>

            <section className="page-section">
                <h2>Поиск операции</h2>
                <div className="card">
                    <label>
                        ID операции
                        <input value={operationIdLookup} onChange={(event) => setOperationIdLookup(event.target.value)} />
                    </label>
                    <button type="button" className="secondary-button" onClick={handleFetchOperation}>
                        Найти операцию
                    </button>
                    {operationDetails ? (
                        <div className="report-output">
                            <p><strong>Тип:</strong> {operationDetails.type}</p>
                            <p><strong>Сумма:</strong> {operationDetails.amount}</p>
                            <p><strong>Касса:</strong> {operationDetails.cashDeskId}</p>
                        </div>
                    ) : null}
                </div>
            </section>
        </PageShell>
    );
};

export default OperationsPage;
