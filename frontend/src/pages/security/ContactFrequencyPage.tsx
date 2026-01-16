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
                            Тип взаимодействия:
                            <select value={interactionType} onChange={(event) => setInteractionType(event.target.value)}>
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
        </PageShell>
    );
};

export default ContactFrequencyPage;
