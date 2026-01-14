import {useEffect, useState} from "react";
import {useAuth} from "../../auth/AuthContext.tsx";
import "./incidents-page.scss";

const INCIDENT_TYPES = ["THEFT", "FIGHT", "DRUNKENNESS", "CHEATING", "OTHER"] as const;
const COMPLAINT_CATEGORIES = ["SERVICE_QUALITY", "STAFF_BEHAVIOR", "GAME_ISSUES", "SAFETY", "OTHER"] as const;
const COMPLAINT_SOURCES = ["VISITOR", "EMPLOYEE", "SYSTEM", "TERMINAL"] as const;
const COMPLAINT_STATUSES = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"] as const;
const VIOLATION_TYPES = ["LATE", "OUT_OF_ZONE", "CONFLICT", "OTHER"] as const;

type DownloadState = { url: string; filename: string } | null;

const parseList = (value: string) =>
    value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

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

type IncidentItem = {
    id: string;
    type: string;
    location?: string;
    occurredAt?: string;
    description?: string;
    participants?: string[];
    attachmentUrls?: string[];
    status?: string;
    reportedBy?: string;
};

type ComplaintItem = {
    id: string;
    category: string;
    description: string;
    reportedAt?: string;
    source: string;
    status?: string;
    reporterName?: string;
    relatedIncidentId?: string;
};

type ViolationItem = {
    id: string;
    employeeId: string;
    type: string;
    description?: string;
    occurredAt?: string;
    status?: string;
    attachmentUrls?: string[];
};

const extractReportId = (data: unknown) => {
    if (data && typeof data === "object") {
        if (Array.isArray(data)) {
            const first = data[0] as { id?: string } | undefined;
            return first?.id ?? "";
        }
        const record = data as { id?: string };
        return record.id ?? "";
    }
    return "";
};

const toIncidentList = (data: unknown): IncidentItem[] => {
    if (Array.isArray(data)) {
        return data as IncidentItem[];
    }
    if (data && typeof data === "object") {
        return [data as IncidentItem];
    }
    return [];
};

const toComplaintList = (data: unknown): ComplaintItem[] => {
    if (Array.isArray(data)) {
        return data as ComplaintItem[];
    }
    if (data && typeof data === "object") {
        return [data as ComplaintItem];
    }
    return [];
};

const toViolationList = (data: unknown): ViolationItem[] => {
    if (Array.isArray(data)) {
        return data as ViolationItem[];
    }
    if (data && typeof data === "object") {
        return [data as ViolationItem];
    }
    return [];
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

const IncidentsPage = () => {
    const {token, baseUrl} = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [lastRequest, setLastRequest] = useState("");
    const [lastStatus, setLastStatus] = useState("");
    const [lastDuration, setLastDuration] = useState("");
    const [lastBody, setLastBody] = useState("");
    const [download, setDownload] = useState<DownloadState>(null);

    const [incidentType, setIncidentType] = useState("THEFT");
    const [incidentLocation, setIncidentLocation] = useState("");
    const [incidentDescription, setIncidentDescription] = useState("");
    const [incidentParticipants, setIncidentParticipants] = useState("");
    const [incidentAttachments, setIncidentAttachments] = useState("");
    const [incidentReportedBy, setIncidentReportedBy] = useState("");
    const [incidentStart, setIncidentStart] = useState("");
    const [incidentEnd, setIncidentEnd] = useState("");
    const [incidentFilterType, setIncidentFilterType] = useState("");
    const [incidentId, setIncidentId] = useState("");

    const [complaintCategory, setComplaintCategory] = useState("SERVICE_QUALITY");
    const [complaintDescription, setComplaintDescription] = useState("");
    const [complaintSource, setComplaintSource] = useState("VISITOR");
    const [complaintReporter, setComplaintReporter] = useState("");
    const [complaintRelatedIncidentId, setComplaintRelatedIncidentId] = useState("");
    const [complaintStart, setComplaintStart] = useState("");
    const [complaintEnd, setComplaintEnd] = useState("");
    const [complaintFilterCategory, setComplaintFilterCategory] = useState("");
    const [complaintFilterSource, setComplaintFilterSource] = useState("");
    const [complaintId, setComplaintId] = useState("");
    const [complaintStatusId, setComplaintStatusId] = useState("");
    const [complaintStatus, setComplaintStatus] = useState("OPEN");

    const [violationEmployeeId, setViolationEmployeeId] = useState("");
    const [violationType, setViolationType] = useState("LATE");
    const [violationDescription, setViolationDescription] = useState("");
    const [violationAttachments, setViolationAttachments] = useState("");
    const [violationId, setViolationId] = useState("");

    const [reportStart, setReportStart] = useState("");
    const [reportEnd, setReportEnd] = useState("");
    const [reportIncidentTypes, setReportIncidentTypes] = useState<string[]>([]);
    const [reportGeneratedBy, setReportGeneratedBy] = useState("");
    const [managementReportStart, setManagementReportStart] = useState("");
    const [managementReportEnd, setManagementReportEnd] = useState("");
    const [managementReportGeneratedBy, setManagementReportGeneratedBy] = useState("");
    const [regulatoryReportStart, setRegulatoryReportStart] = useState("");
    const [regulatoryReportEnd, setRegulatoryReportEnd] = useState("");
    const [regulatoryReportGeneratedBy, setRegulatoryReportGeneratedBy] = useState("");
    const [repeatedStart, setRepeatedStart] = useState("");
    const [repeatedEnd, setRepeatedEnd] = useState("");
    const [repeatedThreshold, setRepeatedThreshold] = useState("3");
    const [exportReportId, setExportReportId] = useState("");
    const [employeeOptions, setEmployeeOptions] = useState<EmployeeOption[]>([]);
    const [incidentResults, setIncidentResults] = useState<IncidentItem[]>([]);
    const [complaintResults, setComplaintResults] = useState<ComplaintItem[]>([]);
    const [violationResults, setViolationResults] = useState<ViolationItem[]>([]);
    const [incidentReportId, setIncidentReportId] = useState("");
    const [managementReportId, setManagementReportId] = useState("");
    const [regulatoryReportId, setRegulatoryReportId] = useState("");

    useEffect(() => {
        return () => {
            if (download) {
                URL.revokeObjectURL(download.url);
            }
        };
    }, [download]);

    useEffect(() => {
        if (!token) {
            return;
        }
        runRequest({
            method: "GET",
            path: "/api/staff/employees",
            onSuccess: (data) => setEmployeeOptions(toEmployeeOptions(data)),
        });
    }, [token]);

    const runRequest = async (options: {
        method: string;
        path: string;
        query?: Record<string, string | undefined>;
        body?: unknown;
        onSuccess?: (data: unknown) => void;
        responseType?: "json" | "blob";
        downloadName?: string;
    }) => {
        const base = baseUrl.replace(/\/+$/, "");
        const query = options.query ? buildQuery(options.query) : "";
        const url = `${base}${options.path}${query}`;
        const started = performance.now();
        const headers: Record<string, string> = {
            Accept: options.responseType === "blob" ? "*/*" : "application/json",
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
        setDownload(null);
        try {
            const response = await fetch(url, {
                method: options.method,
                headers,
                body: options.body ? JSON.stringify(options.body) : undefined,
            });
            const duration = `${Math.round(performance.now() - started)} ms`;
            if (options.responseType === "blob") {
                if (!response.ok) {
                    const text = await response.text();
                    setLastBody(text || "Empty response.");
                } else {
                    const blob = await response.blob();
                    const safeName = options.downloadName ?? "report.bin";
                    const downloadUrl = URL.createObjectURL(blob);
                    const contentType = response.headers.get("content-type") || blob.type || "unknown";
                    setDownload({url: downloadUrl, filename: safeName});
                    setLastBody(`Binary response (${contentType}) ready for download.`);
                }
            } else {
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

    const toggleIncidentType = (value: string) => {
        setReportIncidentTypes((prev) =>
            prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
        );
    };

    return (
        <div className="incidents-page">
            <section className="incidents-page__hero">
                <div className="incidents-page__hero-text">
                    <div className="hero-eyebrow">Консоль инцидентов</div>
                    <h1>Все ручки в одном месте.</h1>
                    <p>
                        Полный контроль над инцидентами, жалобами, нарушениями и отчетами. Каждый
                        блок ниже соответствует ручке бэка с мгновенным превью ответа.
                    </p>
                </div>
                <div className="incidents-page__hero-stats">
                    <div className="hero-pill">Инциденты</div>
                    <div className="hero-pill">Жалобы</div>
                    <div className="hero-pill">Нарушения</div>
                    <div className="hero-pill">Отчеты</div>
                    <div className="hero-pill hero-pill--dark">
                        {isLoading ? "Выполняю запрос..." : "Готово к работе"}
                    </div>
                </div>
            </section>

            <section className="incidents-page__grid">
                <div className="panel">
                    <div className="panel__title">Инциденты</div>
                    <div className="panel__section">
                        <h3>Создать инцидент</h3>
                        <div className="form-grid">
                            <label>
                                Тип
                                <select value={incidentType} onChange={(e) => setIncidentType(e.target.value)}>
                                    {INCIDENT_TYPES.map((type) => (
                                        <option key={type} value={type}>
                                            {type}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <label>
                                Локация
                                <input
                                    value={incidentLocation}
                                    onChange={(e) => setIncidentLocation(e.target.value)}
                                    placeholder="Этаж, стол, зона"
                                />
                            </label>
                            <label className="form-span">
                                Описание
                                <textarea
                                    value={incidentDescription}
                                    onChange={(e) => setIncidentDescription(e.target.value)}
                                    placeholder="Что случилось?"
                                />
                            </label>
                            <label>
                                Участники (через запятую)
                                <input
                                    value={incidentParticipants}
                                    onChange={(e) => setIncidentParticipants(e.target.value)}
                                    placeholder="uuid1, uuid2"
                                />
                            </label>
                            <label>
                                Вложения (URL)
                                <input
                                    value={incidentAttachments}
                                    onChange={(e) => setIncidentAttachments(e.target.value)}
                                    placeholder="https://..."
                                />
                            </label>
                            <label>
                                Кто сообщил (UUID)
                                <input
                                    value={incidentReportedBy}
                                    onChange={(e) => setIncidentReportedBy(e.target.value)}
                                    placeholder="uuid"
                                />
                            </label>
                        </div>
                        <button
                            className="primary-button"
                            type="button"
                            onClick={() =>
                                runRequest({
                                    method: "POST",
                                    path: "/api/incident/incidents",
                                    body: {
                                        type: incidentType,
                                        location: incidentLocation || undefined,
                                        description: incidentDescription || undefined,
                                        participants: parseList(incidentParticipants) || undefined,
                                        attachmentUrls: parseList(incidentAttachments) || undefined,
                                        reportedBy: incidentReportedBy || undefined,
                                    },
                                })
                            }
                        >
                            Создать инцидент
                        </button>
                    </div>
                    <div className="panel__section">
                        <h3>Фильтр инцидентов</h3>
                        <div className="form-grid">
                            <label>
                                Начало периода
                                <input
                                    type="datetime-local"
                                    value={incidentStart}
                                    onChange={(e) => setIncidentStart(e.target.value)}
                                />
                            </label>
                            <label>
                                Конец периода
                                <input
                                    type="datetime-local"
                                    value={incidentEnd}
                                    onChange={(e) => setIncidentEnd(e.target.value)}
                                />
                            </label>
                            <label>
                                Тип (необязательно)
                                <select
                                    value={incidentFilterType}
                                    onChange={(e) => setIncidentFilterType(e.target.value)}
                                >
                                    <option value="">Все</option>
                                    {INCIDENT_TYPES.map((type) => (
                                        <option key={type} value={type}>
                                            {type}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </div>
                        <button
                            className="ghost-button"
                            type="button"
                            onClick={() =>
                                runRequest({
                                    method: "GET",
                                    path: "/api/incident/incidents",
                                    query: {
                                        start: toIso(incidentStart),
                                        end: toIso(incidentEnd),
                                        type: incidentFilterType || undefined,
                                    },
                                    onSuccess: (data) => setIncidentResults(toIncidentList(data)),
                                })
                            }
                        >
                            Получить инциденты
                        </button>
                    </div>
                    <div className="panel__section">
                        <h3>Список инцидентов</h3>
                        {incidentResults.length ? (
                            <div className="incident-list">
                                {incidentResults.map((incident) => (
                                    <div className="incident-card" key={incident.id}>
                                        <div className="incident-card__title">
                                            {incident.type} {incident.status ? `· ${incident.status}` : ""}
                                        </div>
                                        <div className="incident-card__meta">
                                            <span>Дата: {formatDateTime(incident.occurredAt)}</span>
                                            {incident.location ? <span>Локация: {incident.location}</span> : null}
                                            {incident.reportedBy ? (
                                                <span>Сообщил: {incident.reportedBy}</span>
                                            ) : null}
                                        </div>
                                        {incident.description ? (
                                            <div className="incident-card__desc">{incident.description}</div>
                                        ) : null}
                                        <div className="incident-card__id">{incident.id}</div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="hint">Инциденты появятся после запроса.</div>
                        )}
                    </div>
                    <div className="panel__section">
                        <h3>Инцидент по ID</h3>
                        <div className="inline-row">
                            <input
                                value={incidentId}
                                onChange={(e) => setIncidentId(e.target.value)}
                                placeholder="UUID инцидента"
                            />
                            <button
                                className="ghost-button"
                                type="button"
                                onClick={() =>
                                    runRequest({
                                        method: "GET",
                                        path: `/api/incident/incidents/${incidentId}`,
                                        onSuccess: (data) => setIncidentResults(toIncidentList(data)),
                                    })
                                }
                            >
                                Получить инцидент
                            </button>
                        </div>
                    </div>
                </div>

                <div className="panel">
                    <div className="panel__title">Жалобы</div>
                    <div className="panel__section">
                        <h3>Создать жалобу</h3>
                        <div className="form-grid">
                            <label>
                                Категория
                                <select
                                    value={complaintCategory}
                                    onChange={(e) => setComplaintCategory(e.target.value)}
                                >
                                    {COMPLAINT_CATEGORIES.map((category) => (
                                        <option key={category} value={category}>
                                            {category}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <label>
                                Источник
                                <select
                                    value={complaintSource}
                                    onChange={(e) => setComplaintSource(e.target.value)}
                                >
                                    {COMPLAINT_SOURCES.map((source) => (
                                        <option key={source} value={source}>
                                            {source}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <label className="form-span">
                                Описание
                                <textarea
                                    value={complaintDescription}
                                    onChange={(e) => setComplaintDescription(e.target.value)}
                                    placeholder="Детали жалобы"
                                />
                            </label>
                            <label>
                                Имя заявителя
                                <input
                                    value={complaintReporter}
                                    onChange={(e) => setComplaintReporter(e.target.value)}
                                    placeholder="Имя или псевдоним"
                                />
                            </label>
                            <label>
                                Связанный инцидент (UUID)
                                <input
                                    value={complaintRelatedIncidentId}
                                    onChange={(e) => setComplaintRelatedIncidentId(e.target.value)}
                                    placeholder="UUID инцидента"
                                />
                            </label>
                        </div>
                        <button
                            className="primary-button"
                            type="button"
                            onClick={() =>
                                runRequest({
                                    method: "POST",
                                    path: "/api/incident/complaints",
                                    body: {
                                        category: complaintCategory,
                                        description: complaintDescription,
                                        source: complaintSource,
                                        reporterName: complaintReporter || undefined,
                                        relatedIncidentId: complaintRelatedIncidentId || undefined,
                                    },
                                })
                            }
                        >
                            Создать жалобу
                        </button>
                    </div>
                    <div className="panel__section">
                        <h3>Фильтр жалоб</h3>
                        <div className="form-grid">
                            <label>
                                Начало периода
                                <input
                                    type="datetime-local"
                                    value={complaintStart}
                                    onChange={(e) => setComplaintStart(e.target.value)}
                                />
                            </label>
                            <label>
                                Конец периода
                                <input
                                    type="datetime-local"
                                    value={complaintEnd}
                                    onChange={(e) => setComplaintEnd(e.target.value)}
                                />
                            </label>
                            <label>
                                Категория
                                <select
                                    value={complaintFilterCategory}
                                    onChange={(e) => setComplaintFilterCategory(e.target.value)}
                                >
                                    <option value="">Все</option>
                                    {COMPLAINT_CATEGORIES.map((category) => (
                                        <option key={category} value={category}>
                                            {category}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <label>
                                Источник
                                <select
                                    value={complaintFilterSource}
                                    onChange={(e) => setComplaintFilterSource(e.target.value)}
                                >
                                    <option value="">Все</option>
                                    {COMPLAINT_SOURCES.map((source) => (
                                        <option key={source} value={source}>
                                            {source}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </div>
                        <button
                            className="ghost-button"
                            type="button"
                            onClick={() =>
                                runRequest({
                                    method: "GET",
                                    path: "/api/incident/complaints",
                                    query: {
                                        start: toIso(complaintStart),
                                        end: toIso(complaintEnd),
                                        category: complaintFilterCategory || undefined,
                                        source: complaintFilterSource || undefined,
                                    },
                                    onSuccess: (data) => setComplaintResults(toComplaintList(data)),
                                })
                            }
                        >
                            Получить жалобы
                        </button>
                    </div>
                    <div className="panel__section">
                        <h3>Список жалоб</h3>
                        {complaintResults.length ? (
                            <div className="complaint-list">
                                {complaintResults.map((complaint) => (
                                    <div className="complaint-card" key={complaint.id}>
                                        <div className="complaint-card__title">
                                            {complaint.category} {complaint.status ? `· ${complaint.status}` : ""}
                                        </div>
                                        <div className="complaint-card__meta">
                                            <span>Источник: {complaint.source}</span>
                                            <span>Дата: {formatDateTime(complaint.reportedAt)}</span>
                                            {complaint.reporterName ? (
                                                <span>Заявитель: {complaint.reporterName}</span>
                                            ) : null}
                                            {complaint.relatedIncidentId ? (
                                                <span>Инцидент: {complaint.relatedIncidentId}</span>
                                            ) : null}
                                        </div>
                                        {complaint.description ? (
                                            <div className="complaint-card__desc">{complaint.description}</div>
                                        ) : null}
                                        <div className="complaint-card__id">{complaint.id}</div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="hint">Жалобы появятся после запроса.</div>
                        )}
                    </div>
                    <div className="panel__section">
                        <h3>Жалоба по ID</h3>
                        <div className="inline-row">
                            <input
                                value={complaintId}
                                onChange={(e) => setComplaintId(e.target.value)}
                                placeholder="UUID жалобы"
                            />
                            <button
                                className="ghost-button"
                                type="button"
                                onClick={() =>
                                    runRequest({
                                        method: "GET",
                                        path: `/api/incident/complaints/${complaintId}`,
                                        onSuccess: (data) => setComplaintResults(toComplaintList(data)),
                                    })
                                }
                            >
                                Получить жалобу
                            </button>
                        </div>
                    </div>
                    <div className="panel__section">
                        <h3>Изменить статус жалобы</h3>
                        <div className="inline-row">
                            <input
                                value={complaintStatusId}
                                onChange={(e) => setComplaintStatusId(e.target.value)}
                                placeholder="UUID жалобы"
                            />
                            <select
                                value={complaintStatus}
                                onChange={(e) => setComplaintStatus(e.target.value)}
                            >
                                {COMPLAINT_STATUSES.map((status) => (
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
                                        path: `/api/incident/complaints/${complaintStatusId}/status`,
                                        query: {status: complaintStatus},
                                    })
                                }
                            >
                                Обновить статус
                            </button>
                        </div>
                    </div>
                </div>

                <div className="panel">
                    <div className="panel__title">Нарушения</div>
                    <div className="panel__section">
                        <div className="inline-row">
                            <button
                                className="ghost-button"
                                type="button"
                                onClick={() =>
                                    runRequest({
                                        method: "GET",
                                        path: "/api/staff/employees",
                                        onSuccess: (data) => setEmployeeOptions(toEmployeeOptions(data)),
                                    })
                                }
                            >
                                Обновить список сотрудников
                            </button>
                            <span className="hint">Загружено: {employeeOptions.length}</span>
                        </div>
                    </div>
                    <div className="panel__section">
                        <h3>Создать нарушение</h3>
                        <div className="form-grid">
                            <label className="employee-select">
                                Сотрудник
                                <select
                                    value={violationEmployeeId}
                                    onChange={(e) => setViolationEmployeeId(e.target.value)}
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
                                    value={violationType}
                                    onChange={(e) => setViolationType(e.target.value)}
                                >
                                    {VIOLATION_TYPES.map((type) => (
                                        <option key={type} value={type}>
                                            {type}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <label className="form-span">
                                Описание
                                <textarea
                                    value={violationDescription}
                                    onChange={(e) => setViolationDescription(e.target.value)}
                                    placeholder="Контекст нарушения"
                                />
                            </label>
                            <label className="form-span">
                                Вложения (URL)
                                <input
                                    value={violationAttachments}
                                    onChange={(e) => setViolationAttachments(e.target.value)}
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
                                    path: "/api/incident/violations",
                                    body: {
                                        employeeId: violationEmployeeId,
                                        type: violationType,
                                        description: violationDescription || undefined,
                                        attachmentUrls: parseList(violationAttachments) || undefined,
                                    },
                                })
                            }
                        >
                            Создать нарушение
                        </button>
                    </div>
                    <div className="panel__section">
                        <h3>Список нарушений</h3>
                        <button
                            className="ghost-button"
                            type="button"
                            onClick={() =>
                                runRequest({
                                    method: "GET",
                                    path: "/api/incident/violations",
                                    onSuccess: (data) => setViolationResults(toViolationList(data)),
                                })
                            }
                        >
                            Получить нарушения
                        </button>
                    </div>
                    <div className="panel__section">
                        <h3>Список нарушений</h3>
                        {violationResults.length ? (
                            <div className="violation-list">
                                {violationResults.map((violation) => (
                                    <div className="violation-card" key={violation.id}>
                                        <div className="violation-card__title">
                                            {violation.type} {violation.status ? `· ${violation.status}` : ""}
                                        </div>
                                        <div className="violation-card__meta">
                                            <span>Сотрудник: {violation.employeeId}</span>
                                            <span>Дата: {formatDateTime(violation.occurredAt)}</span>
                                        </div>
                                        {violation.description ? (
                                            <div className="violation-card__desc">{violation.description}</div>
                                        ) : null}
                                        <div className="violation-card__id">{violation.id}</div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="hint">Нарушения появятся после запроса.</div>
                        )}
                    </div>
                    <div className="panel__section">
                        <h3>Нарушение по ID</h3>
                        <div className="inline-row">
                            <input
                                value={violationId}
                                onChange={(e) => setViolationId(e.target.value)}
                                placeholder="UUID нарушения"
                            />
                            <button
                                className="ghost-button"
                                type="button"
                                onClick={() =>
                                    runRequest({
                                        method: "GET",
                                        path: `/api/incident/violations/${violationId}`,
                                        onSuccess: (data) => setViolationResults(toViolationList(data)),
                                    })
                                }
                            >
                                Получить нарушение
                            </button>
                        </div>
                    </div>
                </div>

                <div className="panel">
                    <div className="panel__title">Отчеты</div>
                    <div className="panel__section">
                        <h3>Отчет по инцидентам</h3>
                        <div className="form-grid">
                            <label>
                                Начало периода
                                <input
                                    type="datetime-local"
                                    value={reportStart}
                                    onChange={(e) => setReportStart(e.target.value)}
                                />
                            </label>
                            <label>
                                Конец периода
                                <input
                                    type="datetime-local"
                                    value={reportEnd}
                                    onChange={(e) => setReportEnd(e.target.value)}
                                />
                            </label>
                            <label className="form-span">
                                Типы инцидентов
                                <div className="chip-grid">
                                    {INCIDENT_TYPES.map((type) => (
                                        <button
                                            key={type}
                                            type="button"
                                            className={`chip ${reportIncidentTypes.includes(type) ? "chip--active" : ""}`}
                                            onClick={() => toggleIncidentType(type)}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </label>
                            <label>
                                Сформировал (UUID)
                                <select
                                    value={reportGeneratedBy}
                                    onChange={(e) => setReportGeneratedBy(e.target.value)}
                                >
                                    <option value="">Выберите сотрудника</option>
                                    {employeeOptions.map((employee) => (
                                        <option key={employee.id} value={employee.id}>
                                            {formatEmployeeName(employee)}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </div>
                        <button
                            className="primary-button"
                            type="button"
                            onClick={() =>
                                runRequest({
                                    method: "POST",
                                    path: "/api/incident/reports/incidents",
                                    body: {
                                        periodStart: toIso(reportStart),
                                        periodEnd: toIso(reportEnd),
                                        incidentTypes: reportIncidentTypes.length
                                            ? reportIncidentTypes
                                            : null,
                                        generatedBy: reportGeneratedBy || undefined,
                                    },
                                    onSuccess: (data) => setIncidentReportId(extractReportId(data)),
                                })
                            }
                        >
                            Сформировать отчет
                        </button>
                        <div className="hint">
                            UUID отчета: {incidentReportId || "появится после создания"}
                        </div>
                    </div>
                    <div className="panel__section">
                        <h3>Отчет для руководства</h3>
                        <div className="form-grid">
                            <label>
                                Начало периода
                                <input
                                    type="datetime-local"
                                    value={managementReportStart}
                                    onChange={(e) => setManagementReportStart(e.target.value)}
                                />
                            </label>
                            <label>
                                Конец периода
                                <input
                                    type="datetime-local"
                                    value={managementReportEnd}
                                    onChange={(e) => setManagementReportEnd(e.target.value)}
                                />
                            </label>
                            <label>
                                Сформировал (UUID)
                                <input
                                    value={managementReportGeneratedBy}
                                    onChange={(e) => setManagementReportGeneratedBy(e.target.value)}
                                    placeholder="UUID пользователя"
                                />
                            </label>
                        </div>
                        <button
                            className="primary-button"
                            type="button"
                            onClick={() =>
                                    runRequest({
                                        method: "POST",
                                        path: "/api/incident/reports/management",
                                        body: {
                                            periodStart: toIso(managementReportStart),
                                            periodEnd: toIso(managementReportEnd),
                                            generatedBy: managementReportGeneratedBy || undefined,
                                        },
                                    onSuccess: (data) => setManagementReportId(extractReportId(data)),
                                })
                            }
                        >
                            Сформировать отчет
                        </button>
                        <div className="hint">
                            UUID отчета: {managementReportId || "появится после создания"}
                        </div>
                    </div>
                    <div className="panel__section">
                        <h3>Регуляторный отчет</h3>
                        <div className="form-grid">
                            <label>
                                Начало периода
                                <input
                                    type="datetime-local"
                                    value={regulatoryReportStart}
                                    onChange={(e) => setRegulatoryReportStart(e.target.value)}
                                />
                            </label>
                            <label>
                                Конец периода
                                <input
                                    type="datetime-local"
                                    value={regulatoryReportEnd}
                                    onChange={(e) => setRegulatoryReportEnd(e.target.value)}
                                />
                            </label>
                            <label>
                                Сформировал (UUID)
                                <input
                                    value={regulatoryReportGeneratedBy}
                                    onChange={(e) => setRegulatoryReportGeneratedBy(e.target.value)}
                                    placeholder="UUID пользователя"
                                />
                            </label>
                        </div>
                        <button
                            className="primary-button"
                            type="button"
                            onClick={() =>
                                    runRequest({
                                        method: "POST",
                                        path: "/api/incident/reports/regulatory",
                                        body: {
                                            periodStart: toIso(regulatoryReportStart),
                                            periodEnd: toIso(regulatoryReportEnd),
                                            generatedBy: regulatoryReportGeneratedBy || undefined,
                                        },
                                    onSuccess: (data) => setRegulatoryReportId(extractReportId(data)),
                                })
                            }
                        >
                            Сформировать отчет
                        </button>
                        <div className="hint">
                            UUID отчета: {regulatoryReportId || "появится после создания"}
                        </div>
                    </div>
                    <div className="panel__section">
                        <h3>Повторяющиеся нарушения</h3>
                        <div className="form-grid">
                            <label>
                                Начало периода
                                <input
                                    type="datetime-local"
                                    value={repeatedStart}
                                    onChange={(e) => setRepeatedStart(e.target.value)}
                                />
                            </label>
                            <label>
                                Конец периода
                                <input
                                    type="datetime-local"
                                    value={repeatedEnd}
                                    onChange={(e) => setRepeatedEnd(e.target.value)}
                                />
                            </label>
                            <label>
                                Порог
                                <input
                                    type="number"
                                    min="1"
                                    value={repeatedThreshold}
                                    onChange={(e) => setRepeatedThreshold(e.target.value)}
                                />
                            </label>
                        </div>
                        <button
                            className="ghost-button"
                            type="button"
                            onClick={() =>
                                    runRequest({
                                        method: "POST",
                                        path: "/api/incident/reports/repeated-violations",
                                        body: {
                                            periodStart: toIso(repeatedStart),
                                            periodEnd: toIso(repeatedEnd),
                                            threshold: Number(repeatedThreshold || 3),
                                    },
                                })
                            }
                        >
                            Получить повторяющиеся
                        </button>
                    </div>
                </div>

                <div className="panel">
                    <div className="panel__title">Экспорт</div>
                    <div className="panel__section">
                        <h3>Экспорт отчета</h3>
                        <div className="inline-row">
                            <input
                                value={exportReportId}
                                onChange={(e) => setExportReportId(e.target.value)}
                                placeholder="UUID отчета"
                            />
                            <button
                                className="ghost-button"
                                type="button"
                                onClick={() =>
                                    runRequest({
                                        method: "GET",
                                        path: `/api/incident/reports/${exportReportId}/export/pdf`,
                                        responseType: "blob",
                                        downloadName: `report-${exportReportId || "export"}.pdf`,
                                    })
                                }
                            >
                                Экспорт PDF
                            </button>
                            <button
                                className="ghost-button"
                                type="button"
                                onClick={() =>
                                    runRequest({
                                        method: "GET",
                                        path: `/api/incident/reports/${exportReportId}/export/excel`,
                                        responseType: "blob",
                                        downloadName: `report-${exportReportId || "export"}.xlsx`,
                                    })
                                }
                            >
                                Экспорт Excel
                            </button>
                        </div>
                        {download ? (
                            <a className="download-link" href={download.url} download={download.filename}>
                                Скачать {download.filename}
                            </a>
                        ) : (
                            <div className="hint">Файлы для скачивания появятся здесь.</div>
                        )}
                    </div>
                </div>
            </section>

        </div>
    );
};

export default IncidentsPage;
