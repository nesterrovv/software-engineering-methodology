import {useEffect, useMemo, useState} from "react";
import type {FormEvent} from "react";
import PageShell from "../../components/PageShell";
import {apiRequest} from "../../api/client";
import {useAuth} from "../../auth/AuthContext";
import {useEmployees} from "../../hooks/useEmployees";
import type {HallSession, HallStatus, NotificationItem} from "../../types";
const SecurityPage = () => {
    const {token, baseUrl} = useAuth();
    const {employees, refresh: refreshEmployees} = useEmployees();
    const [hallStatus, setHallStatus] = useState<HallStatus | null>(null);
    const [sessions, setSessions] = useState<HallSession[]>([]);
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [unreadNotifications, setUnreadNotifications] = useState<NotificationItem[]>([]);
    const [unreadCount, setUnreadCount] = useState<number | null>(null);
    const [sessionId, setSessionId] = useState("");
    const [sessionDetails, setSessionDetails] = useState<HallSession | null>(null);

    const [monitoringEmployeeId, setMonitoringEmployeeId] = useState("");
    const [notificationRecipientId, setNotificationRecipientId] = useState("");
    const [notificationTitle, setNotificationTitle] = useState("");
    const [notificationMessage, setNotificationMessage] = useState("");
    const [notificationType, setNotificationType] = useState("SYSTEM_ALERT");
    const [notificationPriority, setNotificationPriority] = useState("NORMAL");
    const [fetchRecipientId, setFetchRecipientId] = useState("");

    const [error, setError] = useState("");
    const [statusMessage, setStatusMessage] = useState("");

    useEffect(() => {
        const loadStatus = async () => {
            try {
                const data = await apiRequest<HallStatus>(baseUrl, token, "/api/security/monitoring/status");
                setHallStatus(data);
            } catch {
                setHallStatus(null);
            }
        };
        void loadStatus();
    }, [baseUrl, token]);

    useEffect(() => {
        if (!employees.length) {
            return;
        }
        if (!monitoringEmployeeId) {
            setMonitoringEmployeeId(employees[0].id);
        }
        if (!notificationRecipientId) {
            setNotificationRecipientId(employees[0].id);
        }
        if (!fetchRecipientId) {
            setFetchRecipientId(employees[0].id);
        }
    }, [employees, monitoringEmployeeId, notificationRecipientId, fetchRecipientId]);

    const employeeOptions = useMemo(() => employees.map((employee) => ({
        value: employee.id,
        label: [employee.lastName, employee.firstName, employee.middleName].filter(Boolean).join(" ").trim(),
    })), [employees]);

    const handleStartMonitoring = async (event: FormEvent) => {
        event.preventDefault();
        setError("");
        setStatusMessage("");
        if (!monitoringEmployeeId) {
            setError("Выберите сотрудника для мониторинга.");
            return;
        }
        try {
            const session = await apiRequest<HallSession>(
                baseUrl,
                token,
                `/api/security/monitoring/start?securityOfficerId=${monitoringEmployeeId}`,
                {method: "POST"}
            );
            setSessions((prev) => [session, ...prev]);
            setStatusMessage("Сессия мониторинга запущена.");
        } catch (err) {
            setError("Не удалось начать мониторинг.");
        }
    };

    const handleCreateNotification = async (event: FormEvent) => {
        event.preventDefault();
        setError("");
        setStatusMessage("");
        if (!notificationRecipientId || !notificationTitle || !notificationMessage) {
            setError("Заполните получателя, заголовок и сообщение.");
            return;
        }
        try {
            const created = await apiRequest<NotificationItem>(
                baseUrl,
                token,
                "/api/security/notifications",
                {
                    method: "POST",
                    body: JSON.stringify({
                        recipientId: notificationRecipientId,
                        type: notificationType,
                        title: notificationTitle,
                        message: notificationMessage,
                        priority: notificationPriority,
                    }),
                }
            );
            setNotifications((prev) => [created, ...prev]);
            setNotificationTitle("");
            setNotificationMessage("");
            setStatusMessage("Уведомление создано.");
        } catch {
            setError("Не удалось создать уведомление.");
        }
    };

    const handleFetchNotifications = async (event: FormEvent) => {
        event.preventDefault();
        setError("");
        setStatusMessage("");
        if (!fetchRecipientId) {
            setError("Выберите получателя.");
            return;
        }
        try {
            const data = await apiRequest<NotificationItem[]>(
                baseUrl,
                token,
                `/api/security/notifications/recipient/${fetchRecipientId}`
            );
            setNotifications(data || []);
        } catch {
            setError("Не удалось получить уведомления.");
        }
    };

    const handleFetchUnread = async () => {
        setError("");
        setStatusMessage("");
        if (!fetchRecipientId) {
            setError("Выберите получателя.");
            return;
        }
        try {
            const data = await apiRequest<NotificationItem[]>(
                baseUrl,
                token,
                `/api/security/notifications/recipient/${fetchRecipientId}/unread`
            );
            setUnreadNotifications(data || []);
        } catch {
            setError("Не удалось получить непрочитанные уведомления.");
        }
    };

    const handleFetchUnreadCount = async () => {
        setError("");
        setStatusMessage("");
        if (!fetchRecipientId) {
            setError("Выберите получателя.");
            return;
        }
        try {
            const count = await apiRequest<number>(
                baseUrl,
                token,
                `/api/security/notifications/recipient/${fetchRecipientId}/unread-count`
            );
            setUnreadCount(count ?? 0);
        } catch {
            setError("Не удалось получить количество непрочитанных.");
        }
    };

    const handleMarkAsRead = async (id: string) => {
        setError("");
        try {
            const updated = await apiRequest<NotificationItem>(
                baseUrl,
                token,
                `/api/security/notifications/${id}/read`,
                {method: "POST"}
            );
            setNotifications((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
            setUnreadNotifications((prev) => prev.filter((item) => item.id !== updated.id));
        } catch {
            setError("Не удалось отметить уведомление как прочитанное.");
        }
    };

    const handleFetchSession = async (event: FormEvent) => {
        event.preventDefault();
        setError("");
        setStatusMessage("");
        if (!sessionId) {
            setError("Укажите ID сессии.");
            return;
        }
        try {
            const data = await apiRequest<HallSession>(
                baseUrl,
                token,
                `/api/security/monitoring/${sessionId}`
            );
            setSessionDetails(data);
        } catch {
            setError("Не удалось получить данные сессии.");
        }
    };

    const handleEndSession = async () => {
        setError("");
        setStatusMessage("");
        if (!sessionId) {
            setError("Укажите ID сессии.");
            return;
        }
        try {
            const data = await apiRequest<HallSession>(
                baseUrl,
                token,
                `/api/security/monitoring/${sessionId}/end`,
                {method: "POST"}
            );
            setSessionDetails(data);
            setSessions((prev) => prev.map((item) => (item.id === data.id ? data : item)));
            setStatusMessage("Сессия завершена.");
        } catch {
            setError("Не удалось завершить сессию.");
        }
    };

    return (
        <PageShell
            title="Служба безопасности"
            subtitle="Мониторинг зала, уведомления и реагирование на события."
            className="theme-red"
        >
            {hallStatus ? (
                <section className="page-section">
                    <h2>Состояние зала</h2>
                    <div className="card-grid">
                        <div className="card">
                            <h3>Посетители</h3>
                            <p className="data">{hallStatus.totalVisitors ?? 0}</p>
                        </div>
                        <div className="card">
                            <h3>Персонал</h3>
                            <p className="data">{hallStatus.totalStaff ?? 0}</p>
                        </div>
                        <div className="card">
                            <h3>Аномалии</h3>
                            <p className="data">{hallStatus.anomaliesCount ?? 0}</p>
                        </div>
                    </div>
                </section>
            ) : null}

            <section className="panel">
                <div className="panel__title">Оперативные действия</div>
                <div className="panel__section">
                    <h3>Начать мониторинг</h3>
                    <form onSubmit={handleStartMonitoring} className="panel__form">
                        <label>
                            Сотрудник
                            <select
                                value={monitoringEmployeeId}
                                onChange={(event) => setMonitoringEmployeeId(event.target.value)}
                            >
                                <option value="">Выберите сотрудника</option>
                                {employeeOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label || option.value}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <button type="submit" className="primary-button">
                            Начать сессию
                        </button>
                    </form>
                </div>

                <div className="panel__section">
                    <h3>Создать уведомление</h3>
                    <form onSubmit={handleCreateNotification} className="panel__form">
                        <label>
                            Получатель
                            <select
                                value={notificationRecipientId}
                                onChange={(event) => setNotificationRecipientId(event.target.value)}
                            >
                                <option value="">Выберите получателя</option>
                                {employeeOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label || option.value}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label>
                            Заголовок
                            <input
                                value={notificationTitle}
                                onChange={(event) => setNotificationTitle(event.target.value)}
                                placeholder="Кратко о событии"
                            />
                        </label>
                        <label>
                            Сообщение
                            <textarea
                                rows={3}
                                value={notificationMessage}
                                onChange={(event) => setNotificationMessage(event.target.value)}
                                placeholder="Подробности уведомления"
                            />
                        </label>
                        <label>
                            Тип
                            <select
                                value={notificationType}
                                onChange={(event) => setNotificationType(event.target.value)}
                            >
                                <option value="SUSPICIOUS_ACTIVITY">Подозрительная активность</option>
                                <option value="FRAUD_MATCH">Совпадение с базой</option>
                                <option value="LONG_CONTACT">Длительный контакт</option>
                                <option value="FREQUENT_INTERACTION">Частые взаимодействия</option>
                                <option value="SYSTEM_ALERT">Системное уведомление</option>
                                <option value="OTHER">Другое</option>
                            </select>
                        </label>
                        <label>
                            Приоритет
                            <select
                                value={notificationPriority}
                                onChange={(event) => setNotificationPriority(event.target.value)}
                            >
                                <option value="LOW">Низкий</option>
                                <option value="NORMAL">Обычный</option>
                                <option value="HIGH">Высокий</option>
                                <option value="CRITICAL">Критический</option>
                            </select>
                        </label>
                        <button type="submit" className="primary-button">
                            Создать уведомление
                        </button>
                    </form>
                </div>

                <div className="panel__section">
                    <h3>Получить уведомления</h3>
                    <form onSubmit={handleFetchNotifications} className="panel__form">
                        <label>
                            Получатель
                            <select
                                value={fetchRecipientId}
                                onChange={(event) => setFetchRecipientId(event.target.value)}
                            >
                                <option value="">Выберите получателя</option>
                                {employeeOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label || option.value}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <button type="submit" className="secondary-button">
                            Получить уведомления
                        </button>
                    </form>
                    <div className="inline-actions">
                        <button type="button" className="secondary-button" onClick={handleFetchUnread}>
                            Непрочитанные
                        </button>
                        <button type="button" className="secondary-button" onClick={handleFetchUnreadCount}>
                            Количество непрочитанных
                        </button>
                        {unreadCount !== null ? <span className="muted">Непрочитанных: {unreadCount}</span> : null}
                    </div>
                </div>

                <div className="panel__section">
                    <h3>Управление сессией мониторинга</h3>
                    <form onSubmit={handleFetchSession} className="panel__form">
                        <label>
                            ID сессии
                            <input value={sessionId} onChange={(event) => setSessionId(event.target.value)} />
                        </label>
                        <div className="inline-actions">
                            <button type="submit" className="secondary-button">Получить сессию</button>
                            <button type="button" className="primary-button" onClick={handleEndSession}>
                                Завершить сессию
                            </button>
                        </div>
                    </form>
                    {sessionDetails ? (
                        <div className="card">
                            <p><strong>ID:</strong> {sessionDetails.id}</p>
                            <p><strong>Статус:</strong> {sessionDetails.status}</p>
                            <p><strong>Посетители:</strong> {sessionDetails.activeVisitors ?? 0}</p>
                            <p><strong>Персонал:</strong> {sessionDetails.activeStaff ?? 0}</p>
                            <p><strong>Аномалии:</strong> {sessionDetails.anomaliesDetected ?? 0}</p>
                        </div>
                    ) : null}
                </div>

                {error ? <div className="form-error">{error}</div> : null}
                {statusMessage ? <div className="form-success">{statusMessage}</div> : null}
            </section>

            {sessions.length ? (
                <section className="page-section">
                    <h2>Активные сессии</h2>
                    <div className="card-list">
                        {sessions.map((session) => (
                            <div key={session.id} className="session-card">
                                <p><strong>ID:</strong> {session.id}</p>
                                <p><strong>Статус:</strong> {session.status ?? "ACTIVE"}</p>
                                <p><strong>Посетители:</strong> {session.activeVisitors ?? 0}</p>
                                <p><strong>Персонал:</strong> {session.activeStaff ?? 0}</p>
                                <p><strong>Аномалии:</strong> {session.anomaliesDetected ?? 0}</p>
                            </div>
                        ))}
                    </div>
                </section>
            ) : null}

            {notifications.length ? (
                <section className="page-section">
                    <h2>Уведомления</h2>
                    <div className="card-list">
                        {notifications.map((item) => (
                            <div key={item.id} className="notification-card">
                                <h4>{item.title}</h4>
                                <p>{item.message}</p>
                                <p className="muted">Тип: {item.type} · Статус: {item.status}</p>
                                {item.status !== "READ" ? (
                                    <button
                                        type="button"
                                        className="secondary-button"
                                        onClick={() => handleMarkAsRead(item.id)}
                                    >
                                        Отметить прочитанным
                                    </button>
                                ) : null}
                            </div>
                        ))}
                    </div>
                </section>
            ) : null}

            {unreadNotifications.length ? (
                <section className="page-section">
                    <h2>Непрочитанные уведомления</h2>
                    <div className="card-list">
                        {unreadNotifications.map((item) => (
                            <div key={item.id} className="notification-card">
                                <h4>{item.title}</h4>
                                <p>{item.message}</p>
                                <p className="muted">Тип: {item.type} · Статус: {item.status}</p>
                                <button
                                    type="button"
                                    className="secondary-button"
                                    onClick={() => handleMarkAsRead(item.id)}
                                >
                                    Отметить прочитанным
                                </button>
                            </div>
                        ))}
                    </div>
                </section>
            ) : null}

            <div className="inline-actions">
                <button type="button" className="secondary-button" onClick={refreshEmployees}>
                    Обновить список сотрудников
                </button>
            </div>
        </PageShell>
    );
};

export default SecurityPage;
