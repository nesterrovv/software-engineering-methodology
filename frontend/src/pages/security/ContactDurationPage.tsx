import {useState} from "react";
import type {FormEvent} from "react";
import PageShell from "../../components/PageShell";
import {apiRequest} from "../../api/client";
import {useAuth} from "../../auth/AuthContext";
import type {ContactEvent} from "../../types";

const ContactDurationPage = () => {
    const {token, baseUrl} = useAuth();
    const [personOne, setPersonOne] = useState("");
    const [personTwo, setPersonTwo] = useState("");
    const [contactType, setContactType] = useState("game-play");
    const [durationMinutes, setDurationMinutes] = useState("");
    const [contactDate, setContactDate] = useState("");
    const [statusMessage, setStatusMessage] = useState("");
    const [error, setError] = useState("");
    const [mockCount, setMockCount] = useState("10");
    const [suspiciousContacts, setSuspiciousContacts] = useState<ContactEvent[]>([]);

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setError("");
        setStatusMessage("");
        if (!personOne || !personTwo || !contactDate || !durationMinutes) {
            setError("Заполните все поля контакта.");
            return;
        }
        const start = new Date(contactDate);
        const end = new Date(start.getTime() + Number(durationMinutes) * 60000);
        try {
            await apiRequest(baseUrl, token, "/api/security/contacts", {
                method: "POST",
                body: JSON.stringify({
                    personId1: personOne,
                    personId2: personTwo,
                    contactStartTime: start.toISOString(),
                    contactEndTime: end.toISOString(),
                    location: contactType,
                }),
            });
            setStatusMessage("Контакт зарегистрирован.");
            setDurationMinutes("");
        } catch {
            setError("Не удалось зарегистрировать контакт.");
        }
    };

    const handleGenerateMocks = async () => {
        setError("");
        setStatusMessage("");
        try {
            await apiRequest<ContactEvent[]>(
                baseUrl,
                token,
                `/api/security/contacts/generate-mocks?count=${mockCount}`,
                {method: "POST"}
            );
            setStatusMessage("Моковые контакты сгенерированы.");
        } catch {
            setError("Не удалось сгенерировать контакты.");
        }
    };

    const handleFetchSuspicious = async () => {
        setError("");
        try {
            const data = await apiRequest<ContactEvent[]>(
                baseUrl,
                token,
                "/api/security/contacts/suspicious"
            );
            setSuspiciousContacts(data || []);
        } catch {
            setError("Не удалось получить подозрительные контакты.");
        }
    };

    return (
        <PageShell
            title="Контроль длительности контактов"
            subtitle="Форма для контроля времени контактов с клиентами в зале."
            className="theme-red"
        >
            <section className="contact-duration">
                <h2>Заполните информацию о длительности контакта</h2>
                <div className="card">
                    <h3>Информация о контакте</h3>
                    <form onSubmit={handleSubmit} className="stacked-form">
                        <label>
                            ID участника 1:
                            <input
                                value={personOne}
                                onChange={(event) => setPersonOne(event.target.value)}
                                placeholder="UUID или идентификатор"
                            />
                        </label>
                        <label>
                            ID участника 2:
                            <input
                                value={personTwo}
                                onChange={(event) => setPersonTwo(event.target.value)}
                                placeholder="UUID или идентификатор"
                            />
                        </label>
                        <label>
                            Тип контакта:
                            <select value={contactType} onChange={(event) => setContactType(event.target.value)}>
                                <option value="game-play">Игровой процесс</option>
                                <option value="cashier">Обслуживание кассой</option>
                                <option value="customer-service">Обслуживание клиента</option>
                                <option value="other">Другое</option>
                            </select>
                        </label>
                        <label>
                            Длительность контакта (минуты):
                            <input
                                type="number"
                                min="1"
                                value={durationMinutes}
                                onChange={(event) => setDurationMinutes(event.target.value)}
                                placeholder="Время в минутах"
                            />
                        </label>
                        <label>
                            Дата и время контакта:
                            <input
                                type="datetime-local"
                                value={contactDate}
                                onChange={(event) => setContactDate(event.target.value)}
                            />
                        </label>
                        <button type="submit" className="primary-button">Зарегистрировать контакт</button>
                    </form>
                    {error ? <div className="form-error">{error}</div> : null}
                    {statusMessage ? <div className="form-success">{statusMessage}</div> : null}
                </div>
            </section>

            <section className="page-section">
                <h2>Подозрительные контакты</h2>
                <div className="card">
                    <label>
                        Количество моков
                        <input
                            type="number"
                            min="1"
                            value={mockCount}
                            onChange={(event) => setMockCount(event.target.value)}
                        />
                    </label>
                    <div className="inline-actions">
                        <button type="button" className="secondary-button" onClick={handleGenerateMocks}>
                            Сгенерировать моковые контакты
                        </button>
                        <button type="button" className="secondary-button" onClick={handleFetchSuspicious}>
                            Получить подозрительные
                        </button>
                    </div>
                    {suspiciousContacts.length ? (
                        <div className="card-list">
                            {suspiciousContacts.map((item) => (
                                <div key={item.id} className="card">
                                    <p><strong>Участники:</strong> {item.personId1} / {item.personId2}</p>
                                    <p><strong>Длительность:</strong> {item.durationSeconds ?? 0} сек</p>
                                    <p><strong>Локация:</strong> {item.location ?? "—"}</p>
                                    <p className="muted">Статус: {item.status ?? "SUSPICIOUS"}</p>
                                </div>
                            ))}
                        </div>
                    ) : null}
                </div>
            </section>
        </PageShell>
    );
};

export default ContactDurationPage;
