import {useState} from "react";
import type {FormEvent} from "react";
import PageShell from "../../components/PageShell";
import {apiRequest} from "../../api/client";
import {useAuth} from "../../auth/AuthContext";
import type {SuspiciousActivity} from "../../types";

const SuspiciousActivityPage = () => {
    const {token, baseUrl} = useAuth();
    const [activityType, setActivityType] = useState("HIGH_BET");
    const [description, setDescription] = useState("");
    const [location, setLocation] = useState("");
    const [risk, setRisk] = useState("MEDIUM");
    const [statusMessage, setStatusMessage] = useState("");
    const [error, setError] = useState("");
    const [activities, setActivities] = useState<SuspiciousActivity[]>([]);
    const [activityIdLookup, setActivityIdLookup] = useState("");
    const [activityDetails, setActivityDetails] = useState<SuspiciousActivity | null>(null);

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setError("");
        setStatusMessage("");
        if (!description) {
            setError("Заполните описание активности.");
            return;
        }
        try {
            await apiRequest(baseUrl, token, "/api/incident/suspicious-activities", {
                method: "POST",
                body: JSON.stringify({
                    shortDescription: description,
                    location,
                    risk,
                    participants: activityType ? [activityType] : [],
                }),
            });
            setDescription("");
            setLocation("");
            setStatusMessage("Активность зарегистрирована.");
        } catch {
            setError("Не удалось зафиксировать активность.");
        }
    };

    const handleFetchAll = async () => {
        setError("");
        try {
            const data = await apiRequest<SuspiciousActivity[]>(
                baseUrl,
                token,
                "/api/incident/suspicious-activities"
            );
            setActivities(data || []);
        } catch {
            setError("Не удалось получить список активностей.");
        }
    };

    const handleFetchById = async () => {
        setError("");
        if (!activityIdLookup) {
            setError("Укажите ID активности.");
            return;
        }
        try {
            const data = await apiRequest<SuspiciousActivity>(
                baseUrl,
                token,
                `/api/incident/suspicious-activities/${activityIdLookup}`
            );
            setActivityDetails(data);
        } catch {
            setError("Не удалось получить активность по ID.");
        }
    };

    return (
        <PageShell
            title="Фиксация подозрительной активности"
            subtitle="Форма для фиксации подозрительных действий и поведения в зале."
            className="theme-red"
        >
            <section className="suspicious-activity">
                <h2>Заполните данные о подозрительной активности</h2>
                <div className="card">
                    <h3>Информация о подозрительной активности</h3>
                    <form onSubmit={handleSubmit} className="stacked-form">
                        <label>
                            Тип активности:
                            <select value={activityType} onChange={(event) => setActivityType(event.target.value)}>
                                <option value="HIGH_BET">Высокие ставки</option>
                                <option value="COLLUSION">Сговор</option>
                                <option value="IRREGULAR_BEHAVIOR">Необычное поведение</option>
                                <option value="OTHER">Другое</option>
                            </select>
                        </label>
                        <label>
                            Описание активности:
                            <textarea
                                rows={4}
                                value={description}
                                onChange={(event) => setDescription(event.target.value)}
                                placeholder="Подробное описание подозрительной активности..."
                            />
                        </label>
                        <label>
                            Локация:
                            <input
                                value={location}
                                onChange={(event) => setLocation(event.target.value)}
                                placeholder="Зал, стол, зона"
                            />
                        </label>
                        <label>
                            Уровень риска:
                            <select value={risk} onChange={(event) => setRisk(event.target.value)}>
                                <option value="LOW">Низкий</option>
                                <option value="MEDIUM">Средний</option>
                                <option value="HIGH">Высокий</option>
                            </select>
                        </label>
                        <button type="submit" className="primary-button">Зарегистрировать активность</button>
                    </form>
                    {error ? <div className="form-error">{error}</div> : null}
                    {statusMessage ? <div className="form-success">{statusMessage}</div> : null}
                </div>
            </section>

            <section className="page-section">
                <h2>Список активностей</h2>
                <div className="card">
                    <div className="inline-actions">
                        <button type="button" className="secondary-button" onClick={handleFetchAll}>
                            Получить все
                        </button>
                    </div>
                    <label>
                        Найти по ID
                        <input
                            value={activityIdLookup}
                            onChange={(event) => setActivityIdLookup(event.target.value)}
                            placeholder="UUID активности"
                        />
                    </label>
                    <button type="button" className="secondary-button" onClick={handleFetchById}>
                        Найти активность
                    </button>
                    {activityDetails ? (
                        <div className="report-output">
                            <p><strong>{activityDetails.shortDescription ?? "Активность"}</strong></p>
                            <p>Локация: {activityDetails.location ?? "—"}</p>
                            <p>Риск: {activityDetails.risk ?? "MEDIUM"}</p>
                            <p>Статус: {activityDetails.status ?? "OPEN"}</p>
                        </div>
                    ) : null}
                </div>

                {activities.length ? (
                    <div className="card-list">
                        {activities.map((item) => (
                            <div key={item.id} className="card">
                                <h4>{item.shortDescription ?? "Активность"}</h4>
                                <p>Локация: {item.location ?? "—"}</p>
                                <p className="muted">Риск: {item.risk ?? "MEDIUM"} · Статус: {item.status ?? "OPEN"}</p>
                            </div>
                        ))}
                    </div>
                ) : null}
            </section>
        </PageShell>
    );
};

export default SuspiciousActivityPage;
