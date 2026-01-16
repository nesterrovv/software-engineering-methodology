import {useState} from "react";
import type {FormEvent} from "react";
import PageShell from "../../components/PageShell";

const NotificationsSettingsPage = () => {
    const [notificationType, setNotificationType] = useState("incident");
    const [notificationMethod, setNotificationMethod] = useState("email");
    const [notificationFrequency, setNotificationFrequency] = useState("immediate");
    const [statusMessage, setStatusMessage] = useState("");

    const handleSubmit = (event: FormEvent) => {
        event.preventDefault();
        localStorage.setItem("casino.notifications.type", notificationType);
        localStorage.setItem("casino.notifications.method", notificationMethod);
        localStorage.setItem("casino.notifications.frequency", notificationFrequency);
        setStatusMessage("Настройки сохранены.");
    };

    return (
        <PageShell
            title="Получение автоматических уведомлений"
            subtitle="Настройте систему для получения уведомлений о событиях, связанных с безопасностью и другими аспектами казино."
            className="theme-red"
        >
            <section className="notifications">
                <h2>Настройка уведомлений</h2>
                <div className="card">
                    <h3>Тип уведомлений</h3>
                    <form onSubmit={handleSubmit} className="stacked-form">
                        <label>
                            Выберите тип уведомлений:
                            <select value={notificationType} onChange={(event) => setNotificationType(event.target.value)}>
                                <option value="incident">Инциденты</option>
                                <option value="security">Безопасность</option>
                                <option value="fraud">Мошенничество</option>
                                <option value="general">Общие уведомления</option>
                            </select>
                        </label>
                        <label>
                            Выберите способ получения уведомлений:
                            <select value={notificationMethod} onChange={(event) => setNotificationMethod(event.target.value)}>
                                <option value="email">Email</option>
                                <option value="sms">SMS</option>
                                <option value="push">Push-уведомления</option>
                            </select>
                        </label>
                        <label>
                            Частота уведомлений:
                            <select value={notificationFrequency} onChange={(event) => setNotificationFrequency(event.target.value)}>
                                <option value="immediate">Немедленно</option>
                                <option value="daily">Ежедневно</option>
                                <option value="weekly">Еженедельно</option>
                            </select>
                        </label>
                        <button type="submit" className="primary-button">Сохранить настройки</button>
                    </form>
                    {statusMessage ? <div className="form-success">{statusMessage}</div> : null}
                </div>
            </section>
        </PageShell>
    );
};

export default NotificationsSettingsPage;
