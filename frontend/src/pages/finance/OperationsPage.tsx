import {useState} from "react";
import type {FormEvent} from "react";
import PageShell from "../../components/PageShell";
import {apiRequest} from "../../api/client";
import {useAuth} from "../../auth/AuthContext";

const OperationsPage = () => {
    const {token, baseUrl} = useAuth();
    const [dateTime, setDateTime] = useState("");
    const [type, setType] = useState("DEPOSIT");
    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");
    const [cashDeskId, setCashDeskId] = useState("");
    const [statusMessage, setStatusMessage] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setError("");
        setStatusMessage("");
        if (!cashDeskId || !amount) {
            setError("Укажите UUID кассы и сумму.");
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
                        UUID кассы
                        <input
                            value={cashDeskId}
                            onChange={(event) => setCashDeskId(event.target.value)}
                            placeholder="UUID кассы"
                        />
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
        </PageShell>
    );
};

export default OperationsPage;
