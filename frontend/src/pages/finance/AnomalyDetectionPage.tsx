import {useState} from "react";
import type {FormEvent} from "react";
import PageShell from "../../components/PageShell";
import {apiRequest} from "../../api/client";
import {useAuth} from "../../auth/AuthContext";
import type {Anomaly} from "../../types";
const toIso = (value: string) => (value ? new Date(value).toISOString() : undefined);

const AnomalyDetectionPage = () => {
    const {token, baseUrl} = useAuth();
    const [start, setStart] = useState("");
    const [end, setEnd] = useState("");
    const [amount, setAmount] = useState("10000");
    const [frequency, setFrequency] = useState("10");
    const [windowMinutes, setWindowMinutes] = useState("60");
    const [reviewerId, setReviewerId] = useState("");
    const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
    const [error, setError] = useState("");

    const handleDetect = async (event: FormEvent) => {
        event.preventDefault();
        setError("");
        try {
            const data = await apiRequest<Anomaly[]>(baseUrl, token, "/api/finance/anomalies/detect", {
                method: "POST",
                body: JSON.stringify({
                    periodStart: toIso(start),
                    periodEnd: toIso(end),
                    largeAmountThreshold: amount,
                    frequencyThreshold: Number(frequency),
                    timeWindowMinutes: Number(windowMinutes),
                }),
            });
            setAnomalies(data || []);
        } catch {
            setError("Не удалось загрузить аномалии.");
        }
    };

    const reviewAnomaly = async (id: string, status: string) => {
        if (!reviewerId) {
            setError("Укажите ID проверяющего.");
            return;
        }
        try {
            const updated = await apiRequest<Anomaly>(
                baseUrl,
                token,
                `/api/finance/anomalies/${id}/review?status=${status}&reviewerId=${reviewerId}`,
                {method: "POST"}
            );
            setAnomalies((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
        } catch {
            setError("Не удалось обновить статус.");
        }
    };

    return (
        <PageShell
            title="Выявление аномальных транзакций"
            subtitle="Мониторинг и анализ подозрительных финансовых операций в системе казино."
            className="theme-green"
        >
            <section>
                <div className="card">
                    <form onSubmit={handleDetect} className="stacked-form">
                        <label>
                            Начало периода
                            <input type="datetime-local" value={start} onChange={(event) => setStart(event.target.value)} />
                        </label>
                        <label>
                            Конец периода
                            <input type="datetime-local" value={end} onChange={(event) => setEnd(event.target.value)} />
                        </label>
                        <label>
                            Порог суммы
                            <input type="number" value={amount} onChange={(event) => setAmount(event.target.value)} />
                        </label>
                        <label>
                            Порог частоты
                            <input type="number" value={frequency} onChange={(event) => setFrequency(event.target.value)} />
                        </label>
                        <label>
                            Окно времени (мин)
                            <input type="number" value={windowMinutes} onChange={(event) => setWindowMinutes(event.target.value)} />
                        </label>
                        <label>
                            ID проверяющего
                            <input value={reviewerId} onChange={(event) => setReviewerId(event.target.value)} />
                        </label>
                        <button type="submit" className="primary-button">Запустить анализ</button>
                    </form>
                </div>
            </section>
            <section>
                <h2>Аномальные транзакции</h2>
                <div className="card">
                    <table>
                        <thead>
                        <tr>
                            <th>Дата</th>
                            <th>Сумма</th>
                            <th>Тип</th>
                            <th>Статус</th>
                            <th>Действия</th>
                        </tr>
                        </thead>
                        <tbody>
                        {anomalies.map((anomaly) => (
                            <tr key={anomaly.id}>
                                <td>{anomaly.detectedAt ? new Date(anomaly.detectedAt).toLocaleDateString("ru-RU") : "—"}</td>
                                <td>{anomaly.amount ?? "—"}</td>
                                <td>{anomaly.type}</td>
                                <td className="flagged">{anomaly.status}</td>
                                <td className="actions">
                                    <button type="button" onClick={() => reviewAnomaly(anomaly.id, "CONFIRMED")}>Проверить</button>
                                    <button type="button" onClick={() => reviewAnomaly(anomaly.id, "REJECTED")}>Отклонить</button>
                                </td>
                            </tr>
                        ))}
                        {anomalies.length === 0 ? (
                            <tr>
                                <td colSpan={5}>Аномалии не найдены.</td>
                            </tr>
                        ) : null}
                        </tbody>
                    </table>
                    {error ? <div className="form-error">{error}</div> : null}
                </div>
            </section>
        </PageShell>
    );
};

export default AnomalyDetectionPage;
