import {useEffect, useState} from "react";
import type {FormEvent} from "react";
import PageShell from "../../components/PageShell";
import {apiRequest} from "../../api/client";
import {useAuth} from "../../auth/AuthContext";
import type {ContactEvent} from "../../types";

const ContactDurationPage = () => {
    const {token, baseUrl} = useAuth();
    const [personOne, setPersonOne] = useState("");
    const [personTwo, setPersonTwo] = useState("");
    const [contactLocation, setContactLocation] = useState("");
    const [contactStart, setContactStart] = useState("");
    const [contactEnd, setContactEnd] = useState("");
    const [statusMessage, setStatusMessage] = useState("");
    const [error, setError] = useState("");
    const [suspiciousContacts, setSuspiciousContacts] = useState<ContactEvent[]>([]);
    const [isContactsShown, setIsContactsShown] = useState(false);

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setError("");
        setStatusMessage("");
        if (!personOne || !personTwo || !contactStart || !contactEnd || !contactLocation) {
            setError("Заполните все поля контакта.");
            return;
        }
        const start = new Date(contactStart);
        const end = new Date(contactEnd);
        if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
            setError("Укажите корректные даты начала и конца контакта.");
            return;
        }
        if (end <= start) {
            setError("Конец контакта должен быть позже начала.");
            return;
        }
        try {
            await apiRequest(baseUrl, token, "/api/security/contacts", {
                method: "POST",
                body: JSON.stringify({
                    personId1: personOne,
                    personId2: personTwo,
                    contactStartTime: start.toISOString(),
                    contactEndTime: end.toISOString(),
                    location: contactLocation,
                }),
            });
            setStatusMessage("Контакт зарегистрирован.");
            setContactLocation("");
            setContactStart("");
            setContactEnd("");
        } catch {
            setError("Не удалось зарегистрировать контакт.");
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

    useEffect(() => {
        void handleFetchSuspicious();
    }, [baseUrl, token]);

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
                            Имя участника 1:
                            <input
                                value={personOne}
                                onChange={(event) => setPersonOne(event.target.value)}
                                placeholder="Имя или UUID"
                            />
                        </label>
                        <label>
                            Имя участника 2:
                            <input
                                value={personTwo}
                                onChange={(event) => setPersonTwo(event.target.value)}
                                placeholder="Имя или UUID"
                            />
                        </label>
                        <label>
                            Место контакта:
                            <input
                                value={contactLocation}
                                onChange={(event) => setContactLocation(event.target.value)}
                                placeholder="Зал, стол, зона"
                            />
                        </label>
                        <label>
                            Начало контакта:
                            <input
                                type="datetime-local"
                                value={contactStart}
                                onChange={(event) => setContactStart(event.target.value)}
                            />
                        </label>
                        <label>
                            Конец контакта:
                            <input
                                type="datetime-local"
                                value={contactEnd}
                                onChange={(event) => setContactEnd(event.target.value)}
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
                    <div className="inline-actions">
                        <button
                            type="button"
                            className="secondary-button"
                            onClick={() => setIsContactsShown((prev) => !prev)}
                        >
                            {isContactsShown ? "Скрыть список" : "Показать список"}
                        </button>
                    </div>
                    {isContactsShown && suspiciousContacts.length ? (
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
