import {useState} from "react";
import type {FormEvent} from "react";
import PageShell from "../../components/PageShell";
import {apiRequest} from "../../api/client";
import {useAuth} from "../../auth/AuthContext";

const SuspiciousActivityPage = () => {
    const {token, baseUrl} = useAuth();
    const [activityType, setActivityType] = useState("HIGH_BET");
    const [description, setDescription] = useState("");
    const [location, setLocation] = useState("");
    const [risk, setRisk] = useState("MEDIUM");
    const [statusMessage, setStatusMessage] = useState("");
    const [error, setError] = useState("");

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
        </PageShell>
    );
};

export default SuspiciousActivityPage;
