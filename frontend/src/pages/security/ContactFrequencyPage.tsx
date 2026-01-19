import {useState} from "react";
import type {FormEvent} from "react";
import PageShell from "../../components/PageShell";
import {apiRequest} from "../../api/client";
import {useAuth} from "../../auth/AuthContext";

const ContactFrequencyPage = () => {
    const {token, baseUrl} = useAuth();
    const [personOne, setPersonOne] = useState("");
    const [personTwo, setPersonTwo] = useState("");
    const [interactionType, setInteractionType] = useState("game-play");
    const [interactionDate, setInteractionDate] = useState("");
    const [statusMessage, setStatusMessage] = useState("");
    const [error, setError] = useState("");
    // const [suspiciousContacts, setSuspiciousContacts] = useState<ContactEvent[]>([]);

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setError("");
        setStatusMessage("");
        if (!personOne || !personTwo) {
            setError("Укажите идентификаторы участников.");
            return;
        }
        try {
            await apiRequest(baseUrl, token,
                `/api/security/contacts/check-frequency?personId1=${personOne}&personId2=${personTwo}`,
                {method: "POST"}
            );
            setStatusMessage("Частота взаимодействий проверена.");
        } catch {
            setError("Не удалось проверить частоту взаимодействий.");
        }
    };

    // const handleFetchSuspicious = async () => {
    //     setError("");
    //     try {
    //         const data = await apiRequest<ContactEvent[]>(
    //             baseUrl,
    //             token,
    //             "/api/security/contacts/suspicious"
    //         );
    //         setSuspiciousContacts(data || []);
    //     } catch {
    //         setError("Не удалось получить список подозрительных контактов.");
    //     }
    // };

    return (
        <PageShell
            title="Контроль частоты взаимодействий"
            subtitle="Форма для контроля частоты взаимодействий сотрудников с клиентами."
            className="theme-red"
        >
            <section className="interaction-frequency">
                <h2>Заполните информацию о частоте взаимодействий</h2>
                <div className="card">
                    <h3>Информация о взаимодействии</h3>
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
                            Тип взаимодействия:
                            <select value={interactionType}
                                    onChange={(event) => setInteractionType(event.target.value)}>
                                <option value="game-play">Игровой процесс</option>
                                <option value="cashier">Обслуживание кассой</option>
                                <option value="customer-service">Обслуживание клиента</option>
                                <option value="other">Другое</option>
                            </select>
                        </label>
                        <label>
                            Дата и время взаимодействия:
                            <input
                                type="datetime-local"
                                value={interactionDate}
                                onChange={(event) => setInteractionDate(event.target.value)}
                            />
                        </label>
                        <button type="submit" className="primary-button">Зарегистрировать взаимодействие</button>
                    </form>
                    {error ? <div className="form-error">{error}</div> : null}
                    {statusMessage ? <div className="form-success">{statusMessage}</div> : null}
                </div>
            </section>

            {/*<section className="page-section">
                <h2>Подозрительные контакты</h2>
                <div className="card">
                    <div className="inline-actions">
                        <button type="button" className="secondary-button" onClick={handleFetchSuspicious}>
                            Загрузить список
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
            </section>*/}
        </PageShell>
    );
};

export default ContactFrequencyPage;
