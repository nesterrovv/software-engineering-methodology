import {useState} from "react";
import type {FormEvent} from "react";
import PageShell from "../../components/PageShell";
import {apiRequest} from "../../api/client";
import {useAuth} from "../../auth/AuthContext";

type FraudCheckResponse = {
    matchFound?: boolean;
    matches?: Array<{
        fraudRecordName?: string;
        confidence?: string;
        similarityScore?: number;
        matchDetails?: string;
    }>;
};

const FraudCheckPage = () => {
    const {token, baseUrl} = useAuth();
    const [customerName, setCustomerName] = useState("");
    const [customerId, setCustomerId] = useState("");
    const [customerDob, setCustomerDob] = useState("");
    const [checkType, setCheckType] = useState("id");
    const [activityId, setActivityId] = useState("");
    const [result, setResult] = useState<FraudCheckResponse | null>(null);
    const [error, setError] = useState("");

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setError("");
        if (!customerId) {
            setError("Укажите ID клиента.");
            return;
        }
        try {
            const payload: Record<string, string> = {personId: customerId};
            if (activityId) {
                payload.triggeredByActivityId = activityId;
            }
            const data = await apiRequest<FraudCheckResponse>(baseUrl, token, "/api/security/fraud-check", {
                method: "POST",
                body: JSON.stringify(payload),
            });
            setResult(data);
        } catch {
            setError("Не удалось выполнить сверку.");
        }
    };

    return (
        <PageShell
            title="Сверка с базой мошенников"
            subtitle="Форма для сверки данных с базой мошенников для предотвращения мошенничества в казино."
            className="theme-red"
        >
            <section className="fraud-check">
                <h2>Проверьте данные клиента на совпадение с базой мошенников</h2>
                <div className="card">
                    <h3>Информация о клиенте</h3>
                    <form onSubmit={handleSubmit} className="stacked-form">
                        <label>
                            Имя клиента:
                            <input
                                value={customerName}
                                onChange={(event) => setCustomerName(event.target.value)}
                                placeholder="Имя клиента"
                            />
                        </label>
                        <label>
                            ID клиента:
                            <input
                                value={customerId}
                                onChange={(event) => setCustomerId(event.target.value)}
                                placeholder="ID клиента"
                            />
                        </label>
                        <label>
                            Дата рождения клиента:
                            <input
                                type="date"
                                value={customerDob}
                                onChange={(event) => setCustomerDob(event.target.value)}
                            />
                        </label>
                        <label>
                            Выберите тип проверки:
                            <select value={checkType} onChange={(event) => setCheckType(event.target.value)}>
                                <option value="name">По имени</option>
                                <option value="id">По ID</option>
                                <option value="dob">По дате рождения</option>
                            </select>
                        </label>
                        <label>
                            ID активности (опционально):
                            <input
                                value={activityId}
                                onChange={(event) => setActivityId(event.target.value)}
                                placeholder="UUID активности"
                            />
                        </label>
                        <button type="submit" className="primary-button">Провести сверку</button>
                    </form>
                    {error ? <div className="form-error">{error}</div> : null}
                </div>
            </section>

            {result ? (
                <section className="page-section">
                    <h2>Результаты сверки</h2>
                    <div className="card">
                        <p>Совпадения: {result.matchFound ? "Найдены" : "Не найдены"}</p>
                        {result.matches?.length ? (
                            <ul className="plain-list">
                                {result.matches.map((match, index) => (
                                    <li key={`${match.fraudRecordName}-${index}`}>
                                        {match.fraudRecordName ?? "Запись"} — {match.confidence ?? ""} ({match.similarityScore ?? 0})
                                    </li>
                                ))}
                            </ul>
                        ) : null}
                    </div>
                </section>
            ) : null}
        </PageShell>
    );
};

export default FraudCheckPage;
