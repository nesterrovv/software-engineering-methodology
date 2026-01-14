import {useEffect, useState} from "react";
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

type EmployeeOption = {
    id: string;
    firstName: string;
    lastName: string;
    middleName?: string;
    position?: string;
    department?: string;
};

type HallStatus = {
    totalVisitors?: number;
    totalStaff?: number;
    activeTables?: number;
    anomaliesCount?: number;
    zones?: {
        zoneName?: string;
        visitorCount?: number;
        staffCount?: number;
        status?: string;
    }[];
    recentActivities?: {
        type?: string;
        description?: string;
        location?: string;
        timestamp?: string;
    }[];
};

type ContactEventItem = {
    id: string;
    personId1: string;
    personId2: string;
    contactStartTime?: string;
    contactEndTime?: string;
    durationSeconds?: number;
    location?: string;
    status?: string;
    suspicious?: boolean;
    suspiciousActivityId?: string;
};

type FraudRecord = {
    id: string;
    personId: string;
    fullName: string;
    description?: string;
    photoUrl?: string;
    fraudType?: string;
    addedAt?: string;
    addedBy?: string;
    lastCheckedAt?: string;
    matchCount?: number;
    status?: string;
};

type FraudCheckResult = {
    id?: string;
    personId?: string;
    matched?: boolean;
    matchedRecords?: unknown[];
    confidenceScore?: number;
    checkedAt?: string;
    status?: string;
    message?: string;
};

type NotificationItem = {
    id: string;
    recipientId: string;
    type: string;
    title: string;
    message: string;
    priority: string;
    status: string;
    createdAt?: string;
    sentAt?: string;
    readAt?: string;
    relatedEntityType?: string;
    relatedEntityId?: string;
};
type MonitoringSession = {
    id?: string;
    securityOfficerId?: string;
    startedAt?: string;
    endedAt?: string;
    status?: string;
    activeVisitors?: number;
    activeStaff?: number;
    anomaliesDetected?: number;
    notes?: string;
};

const toMonitoringSession = (data: unknown): MonitoringSession | null => {
    if (!data || typeof data !== "object") {
        return null;
    }
    return data as MonitoringSession;
};

const toEmployeeOptions = (data: unknown): EmployeeOption[] => {
    if (Array.isArray(data)) {
        return data as EmployeeOption[];
    }
    if (data && typeof data === "object") {
        return [data as EmployeeOption];
    }
    return [];
};

const formatEmployeeName = (employee?: EmployeeOption) => {
    if (!employee) {
        return "";
    }
    return [employee.lastName, employee.firstName, employee.middleName]
        .filter(Boolean)
        .join(" ");
};

const formatDateTime = (value?: string) => {
    if (!value) {
        return "-";
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return value;
    }
    return date.toLocaleString();
};

const toContactList = (data: unknown): ContactEventItem[] => {
    if (Array.isArray(data)) {
        return data as ContactEventItem[];
    }
    if (data && typeof data === "object") {
        return [data as ContactEventItem];
    }
    return [];
};

const toFraudList = (data: unknown): FraudRecord[] => {
    if (Array.isArray(data)) {
        return data as FraudRecord[];
    }
    if (data && typeof data === "object") {
        return [data as FraudRecord];
    }
    return [];
};

const toFraudCheck = (data: unknown): FraudCheckResult | null => {
    if (!data || typeof data !== "object") {
        return null;
    }
    return data as FraudCheckResult;
};

const toNotificationList = (data: unknown): NotificationItem[] => {
    if (Array.isArray(data)) {
        return data as NotificationItem[];
    }
    if (data && typeof data === "object") {
        return [data as NotificationItem];
    }
    return [];
};

const matchesPair = (event: ContactEventItem, person1: string, person2: string) => {
    if (!person1 || !person2) {
        return false;
    }
    return (
        (event.personId1 === person1 && event.personId2 === person2) ||
        (event.personId1 === person2 && event.personId2 === person1)
    );
};

const toHallStatus = (data: unknown): HallStatus | null => {
    if (!data || typeof data !== "object") {
        return null;
    }
    return data as HallStatus;
};

const SecurityPage = () => {
    const {token, baseUrl} = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [lastRequest, setLastRequest] = useState("");
    const [lastStatus, setLastStatus] = useState("");
    const [lastDuration, setLastDuration] = useState("");
    const [lastBody, setLastBody] = useState("");
    const [employeeOptions, setEmployeeOptions] = useState<EmployeeOption[]>([]);
    const [hallStatus, setHallStatus] = useState<HallStatus | null>(null);
    const [monitoringSession, setMonitoringSession] = useState<MonitoringSession | null>(null);
    const [suspiciousContacts, setSuspiciousContacts] = useState<ContactEventItem[]>([]);
    const [contactFrequencyCount, setContactFrequencyCount] = useState<number | null>(null);
    const [fraudRecords, setFraudRecords] = useState<FraudRecord[]>([]);
    const [fraudCheckResult, setFraudCheckResult] = useState<FraudCheckResult | null>(null);
    const [notificationList, setNotificationList] = useState<NotificationItem[]>([]);
    const [unreadNotificationList, setUnreadNotificationList] = useState<NotificationItem[]>([]);
    const [unreadCount, setUnreadCount] = useState<number | null>(null);

    const [monitorOfficerId, setMonitorOfficerId] = useState("");
    const [monitorSessionId, setMonitorSessionId] = useState("");

    const [contactPerson1, setContactPerson1] = useState("");
    const [contactPerson2, setContactPerson2] = useState("");
    const [contactStart, setContactStart] = useState("");
    const [contactEnd, setContactEnd] = useState("");
    const [contactLocation, setContactLocation] = useState("");
    const [contactCheckPerson1, setContactCheckPerson1] = useState("");
    const [contactCheckPerson2, setContactCheckPerson2] = useState("");

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
        onSuccess?: (data: unknown) => void;
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
            let parsed: unknown = text || "Empty response.";
            try {
                parsed = JSON.parse(text);
            } catch {
                parsed = text || "Empty response.";
            }
            setLastBody(formatBody(parsed));
            if (response.ok && options.onSuccess) {
                options.onSuccess(parsed);
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

    useEffect(() => {
        if (!token) {
            return;
        }
        const base = baseUrl.replace(/\/+$/, "");
        fetch(`${base}/api/staff/employees`, {
            headers: {
                Accept: "application/json",
                Authorization: token,
            },
        })
            .then((response) => (response.ok ? response.json() : []))
            .then((data) => setEmployeeOptions(toEmployeeOptions(data)))
            .catch(() => setEmployeeOptions([]));
    }, [token, baseUrl]);

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
                            <label className="employee-select">
                                Сотрудник
                                <select
                                    value={monitorOfficerId}
                                    onChange={(e) => setMonitorOfficerId(e.target.value)}
                                >
                                    <option value="">Выберите сотрудника</option>
                                    {employeeOptions.map((employee) => (
                                        <option key={employee.id} value={employee.id}>
                                            {formatEmployeeName(employee)}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <button
                                className="primary-button"
                                type="button"
                                onClick={() =>
                                    runRequest({
                                        method: "POST",
                                        path: "/api/security/monitoring/start",
                                        query: {securityOfficerId: monitorOfficerId},
                                        onSuccess: (data) => setMonitoringSession(toMonitoringSession(data)),
                                    })
                                }
                            >
                                Начать сессию
                            </button>
                        </div>
                        <div className="hint">
                            UUID сессии: {monitoringSession?.id || "появится после запуска"}
                        </div>
                        {monitoringSession ? (
                            <div className="session-card">
                                <div className="session-card__title">
                                    Сессия {monitoringSession.status || ""}
                                </div>
                                <div className="session-card__meta">
                                    <span>Офицер: {monitoringSession.securityOfficerId || "-"}</span>
                                    <span>Старт: {monitoringSession.startedAt || "-"}</span>
                                    <span>Завершение: {monitoringSession.endedAt || "-"}</span>
                                    <span>Посетители: {monitoringSession.activeVisitors ?? 0}</span>
                                    <span>Персонал: {monitoringSession.activeStaff ?? 0}</span>
                                    <span>Аномалии: {monitoringSession.anomaliesDetected ?? 0}</span>
                                </div>
                                {monitoringSession.notes ? (
                                    <div className="session-card__desc">{monitoringSession.notes}</div>
                                ) : null}
                            </div>
                        ) : (
                            <div className="hint">Данные сессии появятся после запроса.</div>
                        )}
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
                                        onSuccess: (data) => setMonitoringSession(toMonitoringSession(data)),
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
                                        onSuccess: (data) => setMonitoringSession(toMonitoringSession(data)),
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
                                    onSuccess: (data) => setHallStatus(toHallStatus(data)),
                                })
                            }
                        >
                            Текущее состояние зала
                        </button>
                    </div>
                    <div className="panel__section">
                        <h3>Статус зала</h3>
                        {hallStatus ? (
                            <div className="hall-status">
                                <div className="hall-status__summary">
                                    <div>Посетители: {hallStatus.totalVisitors ?? 0}</div>
                                    <div>Персонал: {hallStatus.totalStaff ?? 0}</div>
                                    <div>Активные столы: {hallStatus.activeTables ?? 0}</div>
                                    <div>Аномалии: {hallStatus.anomaliesCount ?? 0}</div>
                                </div>
                                {hallStatus.zones?.length ? (
                                    <div className="hall-status__section">
                                        <div className="hall-status__title">Зоны</div>
                                        <div className="hall-status__list">
                                            {hallStatus.zones.map((zone, index) => (
                                                <div className="hall-status__card" key={`${zone.zoneName}-${index}`}>
                                                    <div className="hall-status__card-title">
                                                        {zone.zoneName || "Без названия"}
                                                    </div>
                                                    <div className="hall-status__meta">
                                                        <span>Посетители: {zone.visitorCount ?? 0}</span>
                                                        <span>Персонал: {zone.staffCount ?? 0}</span>
                                                        <span>Статус: {zone.status || "-"}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : null}
                                {hallStatus.recentActivities?.length ? (
                                    <div className="hall-status__section">
                                        <div className="hall-status__title">Последние события</div>
                                        <div className="hall-status__list">
                                            {hallStatus.recentActivities.map((activity, index) => (
                                                <div
                                                    className="hall-status__card"
                                                    key={`${activity.type}-${index}`}
                                                >
                                                    <div className="hall-status__card-title">
                                                        {activity.type || "Событие"}
                                                    </div>
                                                    <div className="hall-status__meta">
                                                        <span>{activity.description || "-"}</span>
                                                        {activity.location ? (
                                                            <span>Локация: {activity.location}</span>
                                                        ) : null}
                                                        {activity.timestamp ? (
                                                            <span>Время: {activity.timestamp}</span>
                                                        ) : null}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : null}
                            </div>
                        ) : (
                            <div className="hint">Статус появится после запроса.</div>
                        )}
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
                                        onSuccess: () =>
                                            runRequest({
                                                method: "GET",
                                                path: "/api/security/contacts/suspicious",
                                                onSuccess: (data) => {
                                                    const contacts = toContactList(data);
                                                    setSuspiciousContacts(contacts);
                                                    const count = contacts.filter((event) =>
                                                        matchesPair(event, contactCheckPerson1, contactCheckPerson2)
                                                    ).length;
                                                    setContactFrequencyCount(count);
                                                },
                                            }),
                                    })
                                }
                            >
                                Проверить частоту
                            </button>
                        </div>
                        <div className="hint">
                            Частота контактов (подозрительные):{" "}
                            {contactFrequencyCount !== null ? contactFrequencyCount : "нет данных"}
                        </div>
                        <button
                            className="ghost-button"
                            type="button"
                            onClick={() =>
                                runRequest({
                                    method: "GET",
                                    path: "/api/security/contacts/suspicious",
                                    onSuccess: (data) => {
                                        const contacts = toContactList(data);
                                        setSuspiciousContacts(contacts);
                                        if (contactCheckPerson1 && contactCheckPerson2) {
                                            setContactFrequencyCount(
                                                contacts.filter((event) =>
                                                    matchesPair(event, contactCheckPerson1, contactCheckPerson2)
                                                ).length
                                            );
                                        }
                                    },
                                })
                            }
                        >
                            Подозрительные контакты
                        </button>
                    </div>
                    <div className="panel__section">
                        <h3>Список подозрительных контактов</h3>
                        {suspiciousContacts.length ? (
                            <div className="contact-list">
                                {suspiciousContacts.map((event) => (
                                    <div className="contact-card" key={event.id}>
                                        <div className="contact-card__title">
                                            {event.personId1} ↔ {event.personId2}
                                        </div>
                                        <div className="contact-card__meta">
                                            <span>Начало: {formatDateTime(event.contactStartTime)}</span>
                                            <span>Конец: {formatDateTime(event.contactEndTime)}</span>
                                            <span>Длительность: {event.durationSeconds ?? 0} сек.</span>
                                            {event.location ? <span>Локация: {event.location}</span> : null}
                                        </div>
                                        <div className="contact-card__meta">
                                            <span>Статус: {event.status || "-"}</span>
                                            <span>
                                                Подозрительный: {event.suspicious ? "да" : "нет"}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="hint">Подозрительные контакты появятся после запроса.</div>
                        )}
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
                                Добавил
                                <select
                                    value={fraudAddedBy}
                                    onChange={(e) => setFraudAddedBy(e.target.value)}
                                >
                                    <option value="">Выберите сотрудника</option>
                                    {employeeOptions.map((employee) => (
                                        <option key={employee.id} value={employee.id}>
                                            {formatEmployeeName(employee)}
                                        </option>
                                    ))}
                                </select>
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
                                        onSuccess: (data) => setFraudRecords(toFraudList(data)),
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
                                        onSuccess: (data) => setFraudRecords(toFraudList(data)),
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
                                        onSuccess: (data) => setFraudRecords(toFraudList(data)),
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
                                        onSuccess: (data) => setFraudRecords(toFraudList(data)),
                                    })
                                }
                            >
                                Фильтр по типу
                            </button>
                        </div>
                    </div>
                    <div className="panel__section">
                        <h3>Список записей</h3>
                        {fraudRecords.length ? (
                            <div className="fraud-list">
                                {fraudRecords.map((record) => (
                                    <div className="fraud-card" key={record.id}>
                                        <div className="fraud-card__title">
                                            {record.fullName} {record.status ? `· ${record.status}` : ""}
                                        </div>
                                        <div className="fraud-card__meta">
                                            <span>ID лица: {record.personId}</span>
                                            {record.fraudType ? <span>Тип: {record.fraudType}</span> : null}
                                            {record.matchCount !== undefined ? (
                                                <span>Совпадений: {record.matchCount}</span>
                                            ) : null}
                                        </div>
                                        {record.description ? (
                                            <div className="fraud-card__desc">{record.description}</div>
                                        ) : null}
                                        <div className="fraud-card__id">{record.id}</div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="hint">Записи появятся после запроса.</div>
                        )}
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
                                    onSuccess: (data) => setFraudCheckResult(toFraudCheck(data)),
                                })
                            }
                        >
                            Запустить проверку
                        </button>
                        {fraudCheckResult ? (
                            <div className="fraud-check-card">
                                <div className="fraud-check-card__title">
                                    Проверка: {fraudCheckResult.matched ? "совпадение" : "нет совпадений"}
                                </div>
                                <div className="fraud-check-card__meta">
                                    <span>Лицо: {fraudCheckResult.personId || "-"}</span>
                                    {fraudCheckResult.status ? <span>Статус: {fraudCheckResult.status}</span> : null}
                                    {fraudCheckResult.checkedAt ? (
                                        <span>Проверено: {fraudCheckResult.checkedAt}</span>
                                    ) : null}
                                    {fraudCheckResult.confidenceScore !== undefined ? (
                                        <span>Уверенность: {fraudCheckResult.confidenceScore}</span>
                                    ) : null}
                                </div>
                                {fraudCheckResult.message ? (
                                    <div className="fraud-check-card__desc">{fraudCheckResult.message}</div>
                                ) : null}
                            </div>
                        ) : (
                            <div className="hint">Результат проверки появится после запроса.</div>
                        )}
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
                                        onSuccess: (data) => setFraudCheckResult(toFraudCheck(data)),
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
                            <label className="employee-select">
                                Получатель
                                <select
                                    value={notificationRecipientId}
                                    onChange={(e) => setNotificationRecipientId(e.target.value)}
                                >
                                    <option value="">Выберите сотрудника</option>
                                    {employeeOptions.map((employee) => (
                                        <option key={employee.id} value={employee.id}>
                                            {formatEmployeeName(employee)}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <button
                                className="ghost-button"
                                type="button"
                                onClick={() =>
                                    runRequest({
                                        method: "GET",
                                        path: `/api/security/notifications/recipient/${notificationRecipientId}`,
                                        onSuccess: (data) => setNotificationList(toNotificationList(data)),
                                    })
                                }
                            >
                                Получить уведомления
                            </button>
                        </div>
                        {notificationList.length ? (
                            <div className="notification-list">
                                {notificationList.map((item) => (
                                    <div className="notification-card" key={item.id}>
                                        <div className="notification-card__title">
                                            {item.title} · {item.priority}
                                        </div>
                                        <div className="notification-card__meta">
                                            <span>Тип: {item.type}</span>
                                            <span>Статус: {item.status}</span>
                                            {item.createdAt ? <span>Создано: {item.createdAt}</span> : null}
                                            {item.readAt ? <span>Прочитано: {item.readAt}</span> : null}
                                        </div>
                                        <div className="notification-card__desc">{item.message}</div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="hint">Уведомления появятся после запроса.</div>
                        )}
                        <div className="inline-row">
                            <label className="employee-select">
                                Получатель
                                <select
                                    value={notificationRecipientUnreadId}
                                    onChange={(e) => setNotificationRecipientUnreadId(e.target.value)}
                                >
                                    <option value="">Выберите сотрудника</option>
                                    {employeeOptions.map((employee) => (
                                        <option key={employee.id} value={employee.id}>
                                            {formatEmployeeName(employee)}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <button
                                className="ghost-button"
                                type="button"
                                onClick={() =>
                                    runRequest({
                                        method: "GET",
                                        path: `/api/security/notifications/recipient/${notificationRecipientUnreadId}/unread`,
                                        onSuccess: (data) => setUnreadNotificationList(toNotificationList(data)),
                                    })
                                }
                            >
                                Непрочитанные
                            </button>
                        </div>
                        {unreadNotificationList.length ? (
                            <div className="notification-list">
                                {unreadNotificationList.map((item) => (
                                    <div className="notification-card" key={item.id}>
                                        <div className="notification-card__title">
                                            {item.title} · {item.priority}
                                        </div>
                                        <div className="notification-card__meta">
                                            <span>Тип: {item.type}</span>
                                            <span>Статус: {item.status}</span>
                                            {item.createdAt ? <span>Создано: {item.createdAt}</span> : null}
                                        </div>
                                        <div className="notification-card__desc">{item.message}</div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="hint">Непрочитанные появятся после запроса.</div>
                        )}
                        <div className="inline-row">
                            <label className="employee-select">
                                Получатель
                                <select
                                    value={notificationRecipientUnreadCountId}
                                    onChange={(e) => setNotificationRecipientUnreadCountId(e.target.value)}
                                >
                                    <option value="">Выберите сотрудника</option>
                                    {employeeOptions.map((employee) => (
                                        <option key={employee.id} value={employee.id}>
                                            {formatEmployeeName(employee)}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <button
                                className="ghost-button"
                                type="button"
                                onClick={() =>
                                    runRequest({
                                        method: "GET",
                                        path: `/api/security/notifications/recipient/${notificationRecipientUnreadCountId}/unread-count`,
                                        onSuccess: (data) => {
                                            if (typeof data === "number") {
                                                setUnreadCount(data);
                                            } else if (data && typeof data === "object" && "count" in data) {
                                                setUnreadCount(Number((data as { count?: number }).count ?? 0));
                                            } else {
                                                setUnreadCount(null);
                                            }
                                        },
                                    })
                                }
                            >
                                Количество непрочитанных
                            </button>
                        </div>
                        <div className="hint">
                            Количество непрочитанных: {unreadCount !== null ? unreadCount : "нет данных"}
                        </div>
                        <div className="inline-row">
                            <label className="employee-select">
                                Уведомление
                                <select
                                    value={notificationReadId}
                                    onChange={(e) => setNotificationReadId(e.target.value)}
                                >
                                    <option value="">Выберите уведомление</option>
                                    {unreadNotificationList.map((item) => (
                                        <option key={item.id} value={item.id}>
                                            {item.title}
                                        </option>
                                    ))}
                                </select>
                            </label>
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
                            <label className="employee-select">
                                Получатель
                                <select
                                    value={notificationCreateRecipientId}
                                    onChange={(e) => setNotificationCreateRecipientId(e.target.value)}
                                >
                                    <option value="">Выберите сотрудника</option>
                                    {employeeOptions.map((employee) => (
                                        <option key={employee.id} value={employee.id}>
                                            {formatEmployeeName(employee)}
                                        </option>
                                    ))}
                                </select>
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


        </div>
    );
};

export default SecurityPage;
