import {useState} from "react";
import {useAuth} from "../../auth/AuthContext.tsx";
import "./security-page.scss";

const FRAUD_TYPES = ["CHEATING", "THEFT", "FRAUD", "BANNED", "OTHER"] as const;
const FRAUD_STATUSES = ["ACTIVE", "ARCHIVED"] as const;
const NOTIFICATION_TYPES = [
    "SUSPICIOUS_ACTIVITY",
    "FRAUD_MATCH",
    "LONG_CONTACT",
    "FREQUENT_INTERACTION",
    "SYSTEM_ALERT",
    "OTHER",
] as const;
const NOTIFICATION_PRIORITIES = ["LOW", "NORMAL", "HIGH", "CRITICAL"] as const;

const toIso = (value: string) => (value ? new Date(value).toISOString() : undefined);

const buildQuery = (params: Record<string, string | undefined>) => {
    const search = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value) {
            search.set(key, value);
        }
    });
    const query = search.toString();
    return query ? `?${query}` : "";
};

const formatBody = (data: unknown) => {
    if (typeof data === "string") {
        return data;
    }
    return JSON.stringify(data, null, 2);
};

const SecurityPage = () => {
    const {token, baseUrl} = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [lastRequest, setLastRequest] = useState("");
    const [lastStatus, setLastStatus] = useState("");
    const [lastDuration, setLastDuration] = useState("");
    const [lastBody, setLastBody] = useState("");

    const [monitorOfficerId, setMonitorOfficerId] = useState("");
    const [monitorSessionId, setMonitorSessionId] = useState("");

    const [contactPerson1, setContactPerson1] = useState("");
    const [contactPerson2, setContactPerson2] = useState("");
    const [contactStart, setContactStart] = useState("");
    const [contactEnd, setContactEnd] = useState("");
    const [contactLocation, setContactLocation] = useState("");
    const [contactCheckPerson1, setContactCheckPerson1] = useState("");
    const [contactCheckPerson2, setContactCheckPerson2] = useState("");
    const [contactMockCount, setContactMockCount] = useState("10");

    const [fraudPersonId, setFraudPersonId] = useState("");
    const [fraudFullName, setFraudFullName] = useState("");
    const [fraudDescription, setFraudDescription] = useState("");
    const [fraudPhotoUrl, setFraudPhotoUrl] = useState("");
    const [fraudType, setFraudType] = useState("CHEATING");
    const [fraudAddedBy, setFraudAddedBy] = useState("");
    const [fraudRecordId, setFraudRecordId] = useState("");
    const [fraudSearchQuery, setFraudSearchQuery] = useState("");
    const [fraudTypeFilter, setFraudTypeFilter] = useState("");
    const [fraudStatusId, setFraudStatusId] = useState("");
    const [fraudStatus, setFraudStatus] = useState("ACTIVE");
    const [fraudDeleteId, setFraudDeleteId] = useState("");

    const [fraudCheckPersonId, setFraudCheckPersonId] = useState("");
    const [fraudCheckPhotoUrl, setFraudCheckPhotoUrl] = useState("");
    const [fraudCheckActivityId, setFraudCheckActivityId] = useState("");
    const [fraudQuickPersonId, setFraudQuickPersonId] = useState("");
    const [fraudQuickActivityId, setFraudQuickActivityId] = useState("");

    const [notificationRecipientId, setNotificationRecipientId] = useState("");
    const [notificationRecipientUnreadId, setNotificationRecipientUnreadId] = useState("");
    const [notificationRecipientUnreadCountId, setNotificationRecipientUnreadCountId] = useState("");
    const [notificationReadId, setNotificationReadId] = useState("");
    const [notificationCreateRecipientId, setNotificationCreateRecipientId] = useState("");
    const [notificationType, setNotificationType] = useState("SYSTEM_ALERT");
    const [notificationTitle, setNotificationTitle] = useState("");
    const [notificationMessage, setNotificationMessage] = useState("");
    const [notificationPriority, setNotificationPriority] = useState("NORMAL");
    const [notificationRelatedType, setNotificationRelatedType] = useState("");
    const [notificationRelatedId, setNotificationRelatedId] = useState("");

    const runRequest = async (options: {
        method: string;
        path: string;
        query?: Record<string, string | undefined>;
        body?: unknown;
    }) => {
        const base = baseUrl.replace(/\/+$/, "");
        const query = options.query ? buildQuery(options.query) : "";
        const url = `${base}${options.path}${query}`;
        const started = performance.now();
        const headers: Record<string, string> = {
            Accept: "application/json",
        };
        if (options.body) {
            headers["Content-Type"] = "application/json";
        }
        if (token) {
            headers.Authorization = token;
        }
        setIsLoading(true);
        setLastRequest(`${options.method} ${url}`);
        setLastStatus("");
        setLastDuration("");
        setLastBody("");
        try {
            const response = await fetch(url, {
                method: options.method,
                headers,
                body: options.body ? JSON.stringify(options.body) : undefined,
            });
            const duration = `${Math.round(performance.now() - started)} ms`;
            const text = await response.text();
            try {
                setLastBody(formatBody(JSON.parse(text)));
            } catch {
                setLastBody(text || "Empty response.");
            }
            setLastStatus(`${response.status} ${response.ok ? "OK" : "ERROR"}`);
            setLastDuration(duration);
        } catch (error) {
            const message = error instanceof Error ? error.message : "Unknown error";
            setLastStatus("NETWORK ERROR");
            setLastDuration("");
            setLastBody(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="security-page">
            <section className="security-page__hero">
                <div className="security-page__hero-text">
                    <div className="hero-eyebrow">Консоль безопасности</div>
                    <h1>Видимость, оповещения, реакция.</h1>
                    <p>
                        Мониторинг зала, контроль контактов, проверки мошенничества и уведомления —
                        в одном центре управления.
                    </p>
                    <div className="hero-note">
                        База API: <strong>{baseUrl || "прокси"}</strong>
                    </div>
                </div>
                <div className="security-page__hero-stats">
                    <div className="hero-pill">Мониторинг зала</div>
                    <div className="hero-pill">Контакты</div>
                    <div className="hero-pill">База мошенников</div>
                    <div className="hero-pill">Уведомления</div>
                    <div className="hero-pill hero-pill--dark">
                        {isLoading ? "Выполняю запрос..." : "Готово к работе"}
                    </div>
                </div>
            </section>

            <section className="security-page__grid">
                <div className="panel">
                    <div className="panel__title">Мониторинг зала</div>
                    <div className="panel__section">
                        <h3>Начать мониторинг</h3>
                        <div className="inline-row">
                            <input
                                value={monitorOfficerId}
                                onChange={(e) => setMonitorOfficerId(e.target.value)}
                                placeholder="UUID сотрудника"
                            />
                            <button
                                className="primary-button"
                                type="button"
                                onClick={() =>
                                    runRequest({
                                        method: "POST",
                                        path: "/api/security/monitoring/start",
                                        query: {securityOfficerId: monitorOfficerId},
                                    })
                                }
                            >
                                Начать сессию
                            </button>
                        </div>
                        <div className="inline-row">
                            <input
                                value={monitorSessionId}
                                onChange={(e) => setMonitorSessionId(e.target.value)}
                                placeholder="UUID сессии"
                            />
                            <button
                                className="ghost-button"
                                type="button"
                                onClick={() =>
                                    runRequest({
                                        method: "POST",
                                        path: `/api/security/monitoring/${monitorSessionId}/end`,
                                    })
                                }
                            >
                                Завершить
                            </button>
                            <button
                                className="ghost-button"
                                type="button"
                                onClick={() =>
                                    runRequest({
                                        method: "GET",
                                        path: `/api/security/monitoring/${monitorSessionId}`,
                                    })
                                }
                            >
                                Получить сессию
                            </button>
                        </div>
                        <button
                            className="ghost-button"
                            type="button"
                            onClick={() =>
                                runRequest({
                                    method: "GET",
                                    path: "/api/security/monitoring/status",
                                })
                            }
                        >
                            Текущее состояние зала
                        </button>
                    </div>
                </div>

                <div className="panel">
                    <div className="panel__title">Контроль контактов</div>
                    <div className="panel__section">
                        <h3>Зарегистрировать контакт</h3>
                        <div className="form-grid">
                            <label>
                                ID лица 1
                                <input
                                    value={contactPerson1}
                                    onChange={(e) => setContactPerson1(e.target.value)}
                                    placeholder="ID лица"
                                />
                            </label>
                            <label>
                                ID лица 2
                                <input
                                    value={contactPerson2}
                                    onChange={(e) => setContactPerson2(e.target.value)}
                                    placeholder="ID лица"
                                />
                            </label>
                            <label>
                                Начало контакта
                                <input
                                    type="datetime-local"
                                    value={contactStart}
                                    onChange={(e) => setContactStart(e.target.value)}
                                />
                            </label>
                            <label>
                                Конец контакта
                                <input
                                    type="datetime-local"
                                    value={contactEnd}
                                    onChange={(e) => setContactEnd(e.target.value)}
                                />
                            </label>
                            <label className="form-span">
                                Локация
                                <input
                                    value={contactLocation}
                                    onChange={(e) => setContactLocation(e.target.value)}
                                    placeholder="Локация"
                                />
                            </label>
                        </div>
                        <button
                            className="primary-button"
                            type="button"
                            onClick={() =>
                                runRequest({
                                    method: "POST",
                                    path: "/api/security/contacts",
                                    body: {
                                        personId1: contactPerson1,
                                        personId2: contactPerson2,
                                        contactStartTime: toIso(contactStart),
                                        contactEndTime: toIso(contactEnd),
                                        location: contactLocation || undefined,
                                    },
                                })
                            }
                        >
                            Зарегистрировать
                        </button>
                    </div>
                    <div className="panel__section">
                        <h3>Проверки контактов</h3>
                        <div className="inline-row">
                            <input
                                value={contactCheckPerson1}
                                onChange={(e) => setContactCheckPerson1(e.target.value)}
                                placeholder="ID лица 1"
                            />
                            <input
                                value={contactCheckPerson2}
                                onChange={(e) => setContactCheckPerson2(e.target.value)}
                                placeholder="ID лица 2"
                            />
                            <button
                                className="ghost-button"
                                type="button"
                                onClick={() =>
                                    runRequest({
                                        method: "POST",
                                        path: "/api/security/contacts/check-frequency",
                                        query: {
                                            personId1: contactCheckPerson1,
                                            personId2: contactCheckPerson2,
                                        },
                                    })
                                }
                            >
                                Проверить частоту
                            </button>
                        </div>
                        <div className="inline-row">
                            <input
                                type="number"
                                min="1"
                                value={contactMockCount}
                                onChange={(e) => setContactMockCount(e.target.value)}
                            />
                            <button
                                className="ghost-button"
                                type="button"
                                onClick={() =>
                                    runRequest({
                                        method: "POST",
                                        path: "/api/security/contacts/generate-mocks",
                                        query: {count: contactMockCount || undefined},
                                    })
                                }
                            >
                                Сгенерировать мок-контакты
                            </button>
                        </div>
                        <button
                            className="ghost-button"
                            type="button"
                            onClick={() =>
                                runRequest({
                                    method: "GET",
                                    path: "/api/security/contacts/suspicious",
                                })
                            }
                        >
                            Подозрительные контакты
                        </button>
                    </div>
                </div>

                <div className="panel">
                    <div className="panel__title">База мошенников</div>
                    <div className="panel__section">
                        <h3>Добавить запись</h3>
                        <div className="form-grid">
                            <label>
                                ID лица
                                <input
                                    value={fraudPersonId}
                                    onChange={(e) => setFraudPersonId(e.target.value)}
                                    placeholder="ID лица"
                                />
                            </label>
                            <label>
                                ФИО
                                <input
                                    value={fraudFullName}
                                    onChange={(e) => setFraudFullName(e.target.value)}
                                    placeholder="ФИО"
                                />
                            </label>
                            <label>
                                Тип мошенничества
                                <select value={fraudType} onChange={(e) => setFraudType(e.target.value)}>
                                    {FRAUD_TYPES.map((type) => (
                                        <option key={type} value={type}>
                                            {type}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <label>
                                Добавил (UUID)
                                <input
                                    value={fraudAddedBy}
                                    onChange={(e) => setFraudAddedBy(e.target.value)}
                                    placeholder="UUID сотрудника"
                                />
                            </label>
                            <label className="form-span">
                                Описание
                                <textarea
                                    value={fraudDescription}
                                    onChange={(e) => setFraudDescription(e.target.value)}
                                    placeholder="Детали"
                                />
                            </label>
                            <label className="form-span">
                                URL фото
                                <input
                                    value={fraudPhotoUrl}
                                    onChange={(e) => setFraudPhotoUrl(e.target.value)}
                                    placeholder="https://..."
                                />
                            </label>
                        </div>
                        <button
                            className="primary-button"
                            type="button"
                            onClick={() =>
                                runRequest({
                                    method: "POST",
                                    path: "/api/security/fraud-database",
                                    body: {
                                        personId: fraudPersonId,
                                        fullName: fraudFullName,
                                        description: fraudDescription || undefined,
                                        photoUrl: fraudPhotoUrl || undefined,
                                        fraudType,
                                        addedBy: fraudAddedBy || undefined,
                                    },
                                })
                            }
                        >
                            Добавить
                        </button>
                    </div>
                    <div className="panel__section">
                        <h3>Поиск записей</h3>
                        <div className="inline-row">
                            <button
                                className="ghost-button"
                                type="button"
                                onClick={() =>
                                    runRequest({
                                        method: "GET",
                                        path: "/api/security/fraud-database",
                                    })
                                }
                            >
                                Получить все
                            </button>
                            <input
                                value={fraudRecordId}
                                onChange={(e) => setFraudRecordId(e.target.value)}
                                placeholder="UUID записи"
                            />
                            <button
                                className="ghost-button"
                                type="button"
                                onClick={() =>
                                    runRequest({
                                        method: "GET",
                                        path: `/api/security/fraud-database/${fraudRecordId}`,
                                    })
                                }
                            >
                                По ID
                            </button>
                        </div>
                        <div className="inline-row">
                            <input
                                value={fraudSearchQuery}
                                onChange={(e) => setFraudSearchQuery(e.target.value)}
                                placeholder="Поисковый запрос"
                            />
                            <button
                                className="ghost-button"
                                type="button"
                                onClick={() =>
                                    runRequest({
                                        method: "GET",
                                        path: "/api/security/fraud-database/search",
                                        query: {q: fraudSearchQuery},
                                    })
                                }
                            >
                                Искать
                            </button>
                        </div>
                        <div className="inline-row">
                            <select
                                value={fraudTypeFilter}
                                onChange={(e) => setFraudTypeFilter(e.target.value)}
                            >
                                <option value="">Выберите тип</option>
                                {FRAUD_TYPES.map((type) => (
                                    <option key={type} value={type}>
                                        {type}
                                    </option>
                                ))}
                            </select>
                            <button
                                className="ghost-button"
                                type="button"
                                onClick={() =>
                                    runRequest({
                                        method: "GET",
                                        path: `/api/security/fraud-database/type/${fraudTypeFilter}`,
                                    })
                                }
                            >
                                Фильтр по типу
                            </button>
                        </div>
                    </div>
                    <div className="panel__section">
                        <h3>Статус и удаление</h3>
                        <div className="inline-row">
                            <input
                                value={fraudStatusId}
                                onChange={(e) => setFraudStatusId(e.target.value)}
                                placeholder="UUID записи"
                            />
                            <select value={fraudStatus} onChange={(e) => setFraudStatus(e.target.value)}>
                                {FRAUD_STATUSES.map((status) => (
                                    <option key={status} value={status}>
                                        {status}
                                    </option>
                                ))}
                            </select>
                            <button
                                className="ghost-button"
                                type="button"
                                onClick={() =>
                                    runRequest({
                                        method: "PATCH",
                                        path: `/api/security/fraud-database/${fraudStatusId}/status`,
                                        query: {status: fraudStatus},
                                    })
                                }
                            >
                                Обновить статус
                            </button>
                        </div>
                        <div className="inline-row">
                            <input
                                value={fraudDeleteId}
                                onChange={(e) => setFraudDeleteId(e.target.value)}
                                placeholder="UUID записи"
                            />
                            <button
                                className="ghost-button"
                                type="button"
                                onClick={() =>
                                    runRequest({
                                        method: "DELETE",
                                        path: `/api/security/fraud-database/${fraudDeleteId}`,
                                    })
                                }
                            >
                                Удалить запись
                            </button>
                        </div>
                    </div>
                </div>

                <div className="panel">
                    <div className="panel__title">Проверки мошенничества</div>
                    <div className="panel__section">
                        <h3>Запустить проверку</h3>
                        <div className="form-grid">
                            <label>
                                ID лица
                                <input
                                    value={fraudCheckPersonId}
                                    onChange={(e) => setFraudCheckPersonId(e.target.value)}
                                    placeholder="ID лица"
                                />
                            </label>
                            <label>
                                URL фото
                                <input
                                    value={fraudCheckPhotoUrl}
                                    onChange={(e) => setFraudCheckPhotoUrl(e.target.value)}
                                    placeholder="https://..."
                                />
                            </label>
                            <label>
                                ID активности
                                <input
                                    value={fraudCheckActivityId}
                                    onChange={(e) => setFraudCheckActivityId(e.target.value)}
                                    placeholder="UUID активности"
                                />
                            </label>
                        </div>
                        <button
                            className="primary-button"
                            type="button"
                            onClick={() =>
                                runRequest({
                                    method: "POST",
                                    path: "/api/security/fraud-check",
                                    body: {
                                        personId: fraudCheckPersonId,
                                        photoUrl: fraudCheckPhotoUrl || undefined,
                                        triggeredByActivityId: fraudCheckActivityId || undefined,
                                    },
                                })
                            }
                        >
                            Запустить проверку
                        </button>
                    </div>
                    <div className="panel__section">
                        <h3>Быстрая проверка</h3>
                        <div className="inline-row">
                            <input
                                value={fraudQuickPersonId}
                                onChange={(e) => setFraudQuickPersonId(e.target.value)}
                                placeholder="ID лица"
                            />
                            <input
                                value={fraudQuickActivityId}
                                onChange={(e) => setFraudQuickActivityId(e.target.value)}
                                placeholder="UUID активности"
                            />
                            <button
                                className="ghost-button"
                                type="button"
                                onClick={() =>
                                    runRequest({
                                        method: "POST",
                                        path: "/api/security/fraud-check/quick",
                                        query: {
                                            personId: fraudQuickPersonId,
                                            activityId: fraudQuickActivityId || undefined,
                                        },
                                    })
                                }
                            >
                                Быстрая проверка
                            </button>
                        </div>
                    </div>
                </div>

                <div className="panel">
                    <div className="panel__title">Уведомления</div>
                    <div className="panel__section">
                        <h3>Получить уведомления</h3>
                        <div className="inline-row">
                            <input
                                value={notificationRecipientId}
                                onChange={(e) => setNotificationRecipientId(e.target.value)}
                                placeholder="UUID получателя"
                            />
                            <button
                                className="ghost-button"
                                type="button"
                                onClick={() =>
                                    runRequest({
                                        method: "GET",
                                        path: `/api/security/notifications/recipient/${notificationRecipientId}`,
                                    })
                                }
                            >
                                Получить уведомления
                            </button>
                        </div>
                        <div className="inline-row">
                            <input
                                value={notificationRecipientUnreadId}
                                onChange={(e) => setNotificationRecipientUnreadId(e.target.value)}
                                placeholder="UUID получателя"
                            />
                            <button
                                className="ghost-button"
                                type="button"
                                onClick={() =>
                                    runRequest({
                                        method: "GET",
                                        path: `/api/security/notifications/recipient/${notificationRecipientUnreadId}/unread`,
                                    })
                                }
                            >
                                Непрочитанные
                            </button>
                        </div>
                        <div className="inline-row">
                            <input
                                value={notificationRecipientUnreadCountId}
                                onChange={(e) => setNotificationRecipientUnreadCountId(e.target.value)}
                                placeholder="UUID получателя"
                            />
                            <button
                                className="ghost-button"
                                type="button"
                                onClick={() =>
                                    runRequest({
                                        method: "GET",
                                        path: `/api/security/notifications/recipient/${notificationRecipientUnreadCountId}/unread-count`,
                                    })
                                }
                            >
                                Количество непрочитанных
                            </button>
                        </div>
                        <div className="inline-row">
                            <input
                                value={notificationReadId}
                                onChange={(e) => setNotificationReadId(e.target.value)}
                                placeholder="UUID уведомления"
                            />
                            <button
                                className="ghost-button"
                                type="button"
                                onClick={() =>
                                    runRequest({
                                        method: "POST",
                                        path: `/api/security/notifications/${notificationReadId}/read`,
                                    })
                                }
                            >
                                Отметить прочитанным
                            </button>
                        </div>
                    </div>
                    <div className="panel__section">
                        <h3>Создать уведомление</h3>
                        <div className="form-grid">
                            <label>
                                UUID получателя
                                <input
                                    value={notificationCreateRecipientId}
                                    onChange={(e) => setNotificationCreateRecipientId(e.target.value)}
                                    placeholder="UUID получателя"
                                />
                            </label>
                            <label>
                                Тип
                                <select
                                    value={notificationType}
                                    onChange={(e) => setNotificationType(e.target.value)}
                                >
                                    {NOTIFICATION_TYPES.map((type) => (
                                        <option key={type} value={type}>
                                            {type}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <label>
                                Приоритет
                                <select
                                    value={notificationPriority}
                                    onChange={(e) => setNotificationPriority(e.target.value)}
                                >
                                    {NOTIFICATION_PRIORITIES.map((priority) => (
                                        <option key={priority} value={priority}>
                                            {priority}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <label className="form-span">
                                Заголовок
                                <input
                                    value={notificationTitle}
                                    onChange={(e) => setNotificationTitle(e.target.value)}
                                    placeholder="Заголовок"
                                />
                            </label>
                            <label className="form-span">
                                Сообщение
                                <textarea
                                    value={notificationMessage}
                                    onChange={(e) => setNotificationMessage(e.target.value)}
                                    placeholder="Текст уведомления"
                                />
                            </label>
                            <label>
                                Тип связанной сущности
                                <input
                                    value={notificationRelatedType}
                                    onChange={(e) => setNotificationRelatedType(e.target.value)}
                                    placeholder="Необязательно"
                                />
                            </label>
                            <label>
                                UUID связанной сущности
                                <input
                                    value={notificationRelatedId}
                                    onChange={(e) => setNotificationRelatedId(e.target.value)}
                                    placeholder="Необязательно"
                                />
                            </label>
                        </div>
                        <button
                            className="primary-button"
                            type="button"
                            onClick={() =>
                                runRequest({
                                    method: "POST",
                                    path: "/api/security/notifications",
                                    body: {
                                        recipientId: notificationCreateRecipientId,
                                        type: notificationType,
                                        title: notificationTitle,
                                        message: notificationMessage,
                                        priority: notificationPriority,
                                        relatedEntityType: notificationRelatedType || undefined,
                                        relatedEntityId: notificationRelatedId || undefined,
                                    },
                                })
                            }
                        >
                            Создать уведомление
                        </button>
                    </div>
                </div>
            </section>

            <section className="panel panel--wide">
                <div className="panel__title">Последний ответ</div>
                <div className="response-meta">
                    <span>{lastRequest || "Выполните запрос, чтобы увидеть детали."}</span>
                    <span>{lastStatus}</span>
                    <span>{lastDuration}</span>
                </div>
                <pre className="response-body">{lastBody || "Тело ответа появится здесь."}</pre>
            </section>
        </div>
    );
};

export default SecurityPage;
