import {useState} from "react";
import type {FormEvent} from "react";
import PageShell from "../../components/PageShell";
import {apiRequest} from "../../api/client";
import {useAuth} from "../../auth/AuthContext";

const IncidentRegistrationPage = () => {
    const {token, baseUrl} = useAuth();
    const [incidentType, setIncidentType] = useState("unusual-bet");
    const [description, setDescription] = useState("");
    const [dateTime, setDateTime] = useState("");
    const [statusMessage, setStatusMessage] = useState("");
    const [error, setError] = useState("");

    const mapType = (value: string) => {
        if (value === "unusual-bet") {
            return "CHEATING";
        }
        if (value === "rule-violation") {
            return "FIGHT";
        }
        if (value === "suspicious-behavior") {
            return "DRUNKENNESS";
        }
        return "OTHER";
    };

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setError("");
        setStatusMessage("");
        if (!description) {
            setError("Добавьте описание инцидента.");
            return;
        }
        try {
            await apiRequest(baseUrl, token, "/api/incident/incidents", {
                method: "POST",
                body: JSON.stringify({
                    type: mapType(incidentType),
                    description,
                }),
            });
            setDescription("");
            setStatusMessage("Инцидент зарегистрирован.");
        } catch {
            setError("Не удалось зарегистрировать инцидент.");
        }
    };

    return (
        <PageShell
            title="Регистрация инцидентов"
            subtitle="Форма для регистрации инцидентов и проблем в зале."
            className="theme-green"
        >
            <section className="incident-registration">
                <h2>Заполните данные инцидента</h2>
                <div className="card">
                    <h3>Информация о инциденте</h3>
                    <form onSubmit={handleSubmit} className="stacked-form">
                        <label>
                            Тип инцидента:
                            <select value={incidentType} onChange={(event) => setIncidentType(event.target.value)}>
                                <option value="unusual-bet">Необычная ставка</option>
                                <option value="rule-violation">Нарушение правил</option>
                                <option value="suspicious-behavior">Подозрительное поведение</option>
                                <option value="other">Другое</option>
                            </select>
                        </label>
                        <label>
                            Описание инцидента:
                            <textarea
                                rows={4}
                                value={description}
                                onChange={(event) => setDescription(event.target.value)}
                                placeholder="Подробное описание инцидента..."
                            />
                        </label>
                        <label>
                            Дата и время:
                            <input
                                type="datetime-local"
                                value={dateTime}
                                onChange={(event) => setDateTime(event.target.value)}
                            />
                        </label>
                        <button type="submit" className="primary-button">Зарегистрировать инцидент</button>
                    </form>
                    {error ? <div className="form-error">{error}</div> : null}
                    {statusMessage ? <div className="form-success">{statusMessage}</div> : null}
                </div>
            </section>
        </PageShell>
    );
};

export default IncidentRegistrationPage;
