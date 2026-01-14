import {useEffect, useState} from "react";
import {useAuth} from "../../auth/AuthContext.tsx";
import "./staff-page.scss";

const EMPLOYEE_STATUSES = ["ACTIVE", "ON_LEAVE", "SICK_LEAVE", "TERMINATED"] as const;
const SHIFT_TYPES = ["DAY", "EVENING", "NIGHT"] as const;

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

type EmployeeItem = {
    id: string;
    firstName: string;
    lastName: string;
    middleName?: string;
    position: string;
    department: string;
    status: string;
    hireDate?: string;
    createdAt?: string;
    contactInfo?: string;
};

type ShiftItem = {
    id: string;
    employeeId: string;
    shiftDate: string;
    plannedStartTime: string;
    plannedEndTime: string;
    status: string;
    shiftType: string;
    location?: string;
    createdBy?: string;
    createdAt?: string;
    publishedAt?: string;
    confirmedBy?: string;
    confirmedAt?: string;
    notes?: string;
};

type ViolationHistoryRecord = {
    id: string;
    employeeId: string;
    employeeName?: string;
    violationType: string;
    description?: string;
    occurredAt?: string;
    status?: string;
    severity?: string;
};

type ViolationHistorySummary = {
    totalViolations?: number;
    byType?: Record<string, number>;
    byDepartment?: Record<string, number>;
    employeesWithViolations?: number;
};

type ViolationHistoryResponse = {
    violations?: ViolationHistoryRecord[];
    summary?: ViolationHistorySummary;
};

type EmployeeOption = {
    id: string;
    firstName: string;
    lastName: string;
    middleName?: string;
    position?: string;
    department?: string;
};

const toEmployeeList = (data: unknown): EmployeeItem[] => {
    if (Array.isArray(data)) {
        return data as EmployeeItem[];
    }
    if (data && typeof data === "object") {
        return [data as EmployeeItem];
    }
    return [];
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

const formatEmployeeMeta = (employee?: EmployeeOption) => {
    if (!employee) {
        return "";
    }
    return [employee.department, employee.position].filter(Boolean).join(" · ");
};

const toShiftList = (data: unknown): ShiftItem[] => {
    if (Array.isArray(data)) {
        return data as ShiftItem[];
    }
    if (data && typeof data === "object") {
        return [data as ShiftItem];
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

const toViolationHistory = (data: unknown): ViolationHistoryResponse | null => {
    if (!data || typeof data !== "object") {
        return null;
    }
    return data as ViolationHistoryResponse;
};

const StaffPage = () => {
    const {token, baseUrl} = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [lastRequest, setLastRequest] = useState("");
    const [lastStatus, setLastStatus] = useState("");
    const [lastDuration, setLastDuration] = useState("");
    const [lastBody, setLastBody] = useState("");
    const [employeeResults, setEmployeeResults] = useState<EmployeeItem[]>([]);
    const [employeeOptions, setEmployeeOptions] = useState<EmployeeOption[]>([]);
    const [shiftResults, setShiftResults] = useState<ShiftItem[]>([]);
    const [violationHistory, setViolationHistory] = useState<ViolationHistoryResponse | null>(null);

    const [employeeFirstName, setEmployeeFirstName] = useState("");
    const [employeeLastName, setEmployeeLastName] = useState("");
    const [employeeMiddleName, setEmployeeMiddleName] = useState("");
    const [employeePosition, setEmployeePosition] = useState("");
    const [employeeDepartment, setEmployeeDepartment] = useState("");
    const [employeeStatus, setEmployeeStatus] = useState("ACTIVE");
    const [employeeContact, setEmployeeContact] = useState("");
    const [employeeId, setEmployeeId] = useState("");
    const [employeeDepartmentFilter, setEmployeeDepartmentFilter] = useState("");
    const [employeeStatusId, setEmployeeStatusId] = useState("");
    const [employeeStatusUpdate, setEmployeeStatusUpdate] = useState("ACTIVE");

    const [shiftEmployeeId, setShiftEmployeeId] = useState("");
    const [shiftDate, setShiftDate] = useState("");
    const [shiftStart, setShiftStart] = useState("");
    const [shiftEnd, setShiftEnd] = useState("");
    const [shiftType, setShiftType] = useState("DAY");
    const [shiftLocation, setShiftLocation] = useState("");
    const [shiftCreatedBy, setShiftCreatedBy] = useState("");
    const [shiftNotes, setShiftNotes] = useState("");
    const [shiftId, setShiftId] = useState("");
    const [shiftPublishId, setShiftPublishId] = useState("");
    const [shiftConfirmId, setShiftConfirmId] = useState("");
    const [shiftConfirmedBy, setShiftConfirmedBy] = useState("");
    const [shiftReassignId, setShiftReassignId] = useState("");
    const [shiftReassignEmployeeId, setShiftReassignEmployeeId] = useState("");
    const [availabilityStart, setAvailabilityStart] = useState("");
    const [availabilityEnd, setAvailabilityEnd] = useState("");
    const [shiftEmployeeFilterId, setShiftEmployeeFilterId] = useState("");
    const [shiftRangeStart, setShiftRangeStart] = useState("");
    const [shiftRangeEnd, setShiftRangeEnd] = useState("");

    const [workTimeEmployeeId, setWorkTimeEmployeeId] = useState("");
    const [workTimeDeviceId, setWorkTimeDeviceId] = useState("");
    const [workTimeClockOutEmployeeId, setWorkTimeClockOutEmployeeId] = useState("");
    const [workTimeClockOutDeviceId, setWorkTimeClockOutDeviceId] = useState("");
    const [workTimeRecordId, setWorkTimeRecordId] = useState("");
    const [workTimeHistoryEmployeeId, setWorkTimeHistoryEmployeeId] = useState("");
    const [workTimeHistoryStart, setWorkTimeHistoryStart] = useState("");
    const [workTimeHistoryEnd, setWorkTimeHistoryEnd] = useState("");

    const [violationEmployeeId, setViolationEmployeeId] = useState("");
    const [violationDepartment, setViolationDepartment] = useState("");
    const [violationStart, setViolationStart] = useState("");
    const [violationEnd, setViolationEnd] = useState("");
    const [violationType, setViolationType] = useState("");
    const [violationHistoryEmployeeId, setViolationHistoryEmployeeId] = useState("");

    useEffect(() => {
        runRequest({
            method: "GET",
            path: "/api/staff/employees",
            onSuccess: (data) => {
                setEmployeeResults(toEmployeeList(data));
                setEmployeeOptions(toEmployeeOptions(data));
            },
        });
    }, []);
    const [violationHistoryDepartment, setViolationHistoryDepartment] = useState("");

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

    return (
        <div className="staff-page">
            <section className="staff-page__hero">
                <div className="staff-page__hero-text">
                    <div className="hero-eyebrow">Консоль персонала</div>
                    <h1>Персонал под полным контролем.</h1>
                    <p>
                        Управляйте сотрудниками, сменами, учетом времени и историей нарушений.
                        Каждая ручка подключена для быстрых рабочих операций.
                    </p>
                    <div className="hero-note">
                        База API: <strong>{baseUrl || "прокси"}</strong>
                    </div>
                </div>
                <div className="staff-page__hero-stats">
                    <div className="hero-pill">Сотрудники</div>
                    <div className="hero-pill">Смены</div>
                    <div className="hero-pill">Учет времени</div>
                    <div className="hero-pill">Нарушения</div>
                    <div className="hero-pill hero-pill--dark">
                        {isLoading ? "Выполняю запрос..." : "Готово к работе"}
                    </div>
                </div>
            </section>

            <section className="staff-page__grid">
                <div className="panel">
                    <div className="panel__title">Сотрудники</div>
                    <div className="panel__section">
                        <h3>Создать сотрудника</h3>
                        <div className="form-grid">
                            <label>
                                Имя
                                <input
                                    value={employeeFirstName}
                                    onChange={(e) => setEmployeeFirstName(e.target.value)}
                                    placeholder="Имя"
                                />
                            </label>
                            <label>
                                Фамилия
                                <input
                                    value={employeeLastName}
                                    onChange={(e) => setEmployeeLastName(e.target.value)}
                                    placeholder="Фамилия"
                                />
                            </label>
                            <label>
                                Отчество
                                <input
                                    value={employeeMiddleName}
                                    onChange={(e) => setEmployeeMiddleName(e.target.value)}
                                    placeholder="Отчество"
                                />
                            </label>
                            <label>
                                Должность
                                <input
                                    value={employeePosition}
                                    onChange={(e) => setEmployeePosition(e.target.value)}
                                    placeholder="Дилер, менеджер и т.д."
                                />
                            </label>
                            <label>
                                Подразделение
                                <input
                                    value={employeeDepartment}
                                    onChange={(e) => setEmployeeDepartment(e.target.value)}
                                    placeholder="Подразделение"
                                />
                            </label>
                            <label>
                                Статус
                                <select
                                    value={employeeStatus}
                                    onChange={(e) => setEmployeeStatus(e.target.value)}
                                >
                                    {EMPLOYEE_STATUSES.map((status) => (
                                        <option key={status} value={status}>
                                            {status}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <label className="form-span">
                                Контакты
                                <textarea
                                    value={employeeContact}
                                    onChange={(e) => setEmployeeContact(e.target.value)}
                                    placeholder="Телефон, email или заметки"
                                />
                            </label>
                        </div>
                        <button
                            className="primary-button"
                            type="button"
                            onClick={() =>
                                runRequest({
                                    method: "POST",
                                    path: "/api/staff/employees",
                                    body: {
                                        firstName: employeeFirstName,
                                        lastName: employeeLastName,
                                        middleName: employeeMiddleName || undefined,
                                        position: employeePosition,
                                        department: employeeDepartment,
                                        status: employeeStatus,
                                        contactInfo: employeeContact || undefined,
                                    },
                                })
                            }
                        >
                            Создать сотрудника
                        </button>
                    </div>
                    <div className="panel__section">
                        <h3>Поиск сотрудников</h3>
                        <div className="inline-row">
                            <button
                                className="ghost-button"
                                type="button"
                                onClick={() =>
                                    runRequest({
                                        method: "GET",
                                        path: "/api/staff/employees",
                                        onSuccess: (data) => {
                                            setEmployeeResults(toEmployeeList(data));
                                            setEmployeeOptions(toEmployeeOptions(data));
                                        },
                                    })
                                }
                            >
                                Получить всех сотрудников
                            </button>
                            <label className="employee-select">
                                Сотрудник
                                <select
                                    value={employeeId}
                                    onChange={(e) => setEmployeeId(e.target.value)}
                                >
                                    <option value="">Выберите сотрудника</option>
                                    {employeeOptions.map((employee) => (
                                        <option key={employee.id} value={employee.id}>
                                            {formatEmployeeName(employee)}
                                        </option>
                                    ))}
                                </select>
                                <span className="employee-select__value">
                                    {formatEmployeeName(
                                        employeeOptions.find((employee) => employee.id === employeeId)
                                    ) || "Выбранное ФИО появится здесь"}
                                </span>
                                <span className="employee-select__meta">
                                    {formatEmployeeMeta(
                                        employeeOptions.find((employee) => employee.id === employeeId)
                                    ) || "Подразделение и роль появятся здесь"}
                                </span>
                            </label>
                            <button
                                className="ghost-button"
                                type="button"
                                onClick={() =>
                                    runRequest({
                                        method: "GET",
                                        path: `/api/staff/employees/${employeeId}`,
                                        onSuccess: (data) => setEmployeeResults(toEmployeeList(data)),
                                    })
                                }
                            >
                                Получить по ID
                            </button>
                        </div>
                        <div className="inline-row">
                            <input
                                value={employeeDepartmentFilter}
                                onChange={(e) => setEmployeeDepartmentFilter(e.target.value)}
                                placeholder="Подразделение"
                            />
                            <button
                                className="ghost-button"
                                type="button"
                                onClick={() =>
                                    runRequest({
                                        method: "GET",
                                        path: `/api/staff/employees/department/${employeeDepartmentFilter}`,
                                        onSuccess: (data) => {
                                            setEmployeeResults(toEmployeeList(data));
                                            setEmployeeOptions(toEmployeeOptions(data));
                                        },
                                    })
                                }
                            >
                                По подразделению
                            </button>
                        </div>
                    </div>
                    <div className="panel__section">
                        <h3>Результаты</h3>
                        {employeeResults.length ? (
                            <div className="employee-list">
                                {employeeResults.map((employee) => (
                                    <div className="employee-card" key={employee.id}>
                                        <div className="employee-card__name">
                                            {employee.lastName} {employee.firstName} {employee.middleName ?? ""}
                                        </div>
                                        <div className="employee-card__meta">
                                            <span>{employee.position}</span>
                                            <span>{employee.department}</span>
                                            <span>{employee.status}</span>
                                        </div>
                                        <div className="employee-card__id">{employee.id}</div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="hint">Выполните поиск, чтобы показать карточки.</div>
                        )}
                    </div>
                    <div className="panel__section">
                        <h3>Обновить статус</h3>
                        <div className="inline-row">
                            <label className="employee-select">
                                Сотрудник
                                <select
                                    value={employeeStatusId}
                                    onChange={(e) => setEmployeeStatusId(e.target.value)}
                                >
                                    <option value="">Выберите сотрудника</option>
                                    {employeeOptions.map((employee) => (
                                        <option key={employee.id} value={employee.id}>
                                            {formatEmployeeName(employee)}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <select
                                value={employeeStatusUpdate}
                                onChange={(e) => setEmployeeStatusUpdate(e.target.value)}
                            >
                                {EMPLOYEE_STATUSES.map((status) => (
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
                                        path: `/api/staff/employees/${employeeStatusId}/status`,
                                        query: {status: employeeStatusUpdate},
                                    })
                                }
                            >
                                Обновить статус
                            </button>
                        </div>
                    </div>
                </div>

                <div className="panel">
                    <div className="panel__title">Управление сменами</div>
                    <div className="panel__section">
                        <h3>Создать расписание смены</h3>
                        <div className="form-grid">
                            <label className="employee-select">
                                Сотрудник
                                <select
                                    value={shiftEmployeeId}
                                    onChange={(e) => setShiftEmployeeId(e.target.value)}
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
                                Дата смены
                                <input
                                    type="date"
                                    value={shiftDate}
                                    onChange={(e) => setShiftDate(e.target.value)}
                                />
                            </label>
                            <label>
                                Начало смены
                                <input
                                    type="datetime-local"
                                    value={shiftStart}
                                    onChange={(e) => setShiftStart(e.target.value)}
                                />
                            </label>
                            <label>
                                Конец смены
                                <input
                                    type="datetime-local"
                                    value={shiftEnd}
                                    onChange={(e) => setShiftEnd(e.target.value)}
                                />
                            </label>
                            <label>
                                Тип смены
                                <select value={shiftType} onChange={(e) => setShiftType(e.target.value)}>
                                    {SHIFT_TYPES.map((type) => (
                                        <option key={type} value={type}>
                                            {type}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <label>
                                Локация
                                <input
                                    value={shiftLocation}
                                    onChange={(e) => setShiftLocation(e.target.value)}
                                    placeholder="Игровой зал"
                                />
                            </label>
                            <label className="employee-select">
                                Создал
                                <select
                                    value={shiftCreatedBy}
                                    onChange={(e) => setShiftCreatedBy(e.target.value)}
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
                                Примечания
                                <textarea
                                    value={shiftNotes}
                                    onChange={(e) => setShiftNotes(e.target.value)}
                                    placeholder="Дополнительные заметки"
                                />
                            </label>
                        </div>
                        <button
                            className="primary-button"
                            type="button"
                            onClick={() =>
                                runRequest({
                                    method: "POST",
                                    path: "/api/staff/shifts",
                                    body: {
                                        employeeId: shiftEmployeeId,
                                        shiftDate,
                                        plannedStartTime: toIso(shiftStart),
                                        plannedEndTime: toIso(shiftEnd),
                                        shiftType,
                                        location: shiftLocation || undefined,
                                        createdBy: shiftCreatedBy || undefined,
                                        notes: shiftNotes || undefined,
                                    },
                                })
                            }
                        >
                            Создать расписание
                        </button>
                    </div>
                    <div className="panel__section">
                        <h3>Действия со сменой</h3>
                        <div className="inline-row">
                            <input
                                value={shiftPublishId}
                                onChange={(e) => setShiftPublishId(e.target.value)}
                                placeholder="UUID смены"
                            />
                            <button
                                className="ghost-button"
                                type="button"
                                onClick={() =>
                                    runRequest({
                                        method: "POST",
                                        path: `/api/staff/shifts/${shiftPublishId}/publish`,
                                    })
                                }
                            >
                                Опубликовать
                            </button>
                        </div>
                        <div className="inline-row">
                            <input
                                value={shiftConfirmId}
                                onChange={(e) => setShiftConfirmId(e.target.value)}
                                placeholder="UUID смены"
                            />
                            <label className="employee-select">
                                Подтвердил
                                <select
                                    value={shiftConfirmedBy}
                                    onChange={(e) => setShiftConfirmedBy(e.target.value)}
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
                                        method: "POST",
                                        path: `/api/staff/shifts/${shiftConfirmId}/confirm`,
                                        query: {confirmedBy: shiftConfirmedBy},
                                    })
                                }
                            >
                                Подтвердить
                            </button>
                        </div>
                        <div className="inline-row">
                            <input
                                value={shiftReassignId}
                                onChange={(e) => setShiftReassignId(e.target.value)}
                                placeholder="UUID смены"
                            />
                            <label className="employee-select">
                                Новый сотрудник
                                <select
                                    value={shiftReassignEmployeeId}
                                    onChange={(e) => setShiftReassignEmployeeId(e.target.value)}
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
                                        method: "POST",
                                        path: `/api/staff/shifts/${shiftReassignId}/reassign`,
                                        query: {newEmployeeId: shiftReassignEmployeeId},
                                    })
                                }
                            >
                                Переназначить
                            </button>
                        </div>
                    </div>
                    <div className="panel__section">
                        <h3>Доступность и поиск</h3>
                        <div className="inline-row">
                            <input
                                type="date"
                                value={availabilityStart}
                                onChange={(e) => setAvailabilityStart(e.target.value)}
                            />
                            <input
                                type="date"
                                value={availabilityEnd}
                                onChange={(e) => setAvailabilityEnd(e.target.value)}
                            />
                            <button
                                className="ghost-button"
                                type="button"
                                onClick={() =>
                                    runRequest({
                                        method: "GET",
                                        path: "/api/staff/shifts/availability",
                                        query: {startDate: availabilityStart, endDate: availabilityEnd},
                                    })
                                }
                            >
                                Получить доступность
                            </button>
                        </div>
                        <div className="inline-row">
                            <label className="employee-select">
                                Сотрудник
                                <select
                                    value={shiftEmployeeFilterId}
                                    onChange={(e) => setShiftEmployeeFilterId(e.target.value)}
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
                                        path: `/api/staff/shifts/employee/${shiftEmployeeFilterId}`,
                                        onSuccess: (data) => setShiftResults(toShiftList(data)),
                                    })
                                }
                            >
                                Смены сотрудника
                            </button>
                        </div>
                        <div className="inline-row">
                            <input
                                type="date"
                                value={shiftRangeStart}
                                onChange={(e) => setShiftRangeStart(e.target.value)}
                            />
                            <input
                                type="date"
                                value={shiftRangeEnd}
                                onChange={(e) => setShiftRangeEnd(e.target.value)}
                            />
                            <button
                                className="ghost-button"
                                type="button"
                                onClick={() =>
                                    runRequest({
                                        method: "GET",
                                        path: "/api/staff/shifts",
                                        query: {startDate: shiftRangeStart, endDate: shiftRangeEnd},
                                        onSuccess: (data) => setShiftResults(toShiftList(data)),
                                    })
                                }
                            >
                                Смены по периоду
                            </button>
                        </div>
                        <div className="inline-row">
                            <input
                                value={shiftId}
                                onChange={(e) => setShiftId(e.target.value)}
                                placeholder="UUID смены"
                            />
                            <button
                                className="ghost-button"
                                type="button"
                                onClick={() =>
                                    runRequest({
                                        method: "GET",
                                        path: `/api/staff/shifts/${shiftId}`,
                                        onSuccess: (data) => setShiftResults(toShiftList(data)),
                                    })
                                }
                            >
                                Смена по ID
                            </button>
                        </div>
                    </div>
                    <div className="panel__section">
                        <h3>Список смен</h3>
                        {shiftResults.length ? (
                            <div className="shift-list">
                                {shiftResults.map((shift) => (
                                    <div className="shift-card" key={shift.id}>
                                        <div className="shift-card__title">
                                            {shift.shiftType} · {shift.status}
                                        </div>
                                        <div className="shift-card__meta">
                                            <span>Дата: {shift.shiftDate || "-"}</span>
                                            <span>Начало: {formatDateTime(shift.plannedStartTime)}</span>
                                            <span>Конец: {formatDateTime(shift.plannedEndTime)}</span>
                                            <span>Сотрудник: {shift.employeeId}</span>
                                            {shift.location ? <span>Локация: {shift.location}</span> : null}
                                        </div>
                                        <div className="shift-card__id">{shift.id}</div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="hint">Смены появятся после запроса.</div>
                        )}
                    </div>
                </div>

                <div className="panel">
                    <div className="panel__title">Учет времени</div>
                    <div className="panel__section">
                        <h3>Отметка входа</h3>
                        <div className="inline-row">
                            <label className="employee-select">
                                Сотрудник
                                <select
                                    value={workTimeEmployeeId}
                                    onChange={(e) => setWorkTimeEmployeeId(e.target.value)}
                                >
                                    <option value="">Выберите сотрудника</option>
                                    {employeeOptions.map((employee) => (
                                        <option key={employee.id} value={employee.id}>
                                            {formatEmployeeName(employee)}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <input
                                value={workTimeDeviceId}
                                onChange={(e) => setWorkTimeDeviceId(e.target.value)}
                                placeholder="ID устройства"
                            />
                            <button
                                className="primary-button"
                                type="button"
                                onClick={() =>
                                    runRequest({
                                        method: "POST",
                                        path: "/api/staff/work-time/clock-in",
                                        body: {
                                            employeeId: workTimeEmployeeId,
                                            deviceId: workTimeDeviceId || undefined,
                                        },
                                    })
                                }
                            >
                                Отметить вход
                            </button>
                        </div>
                    </div>
                    <div className="panel__section">
                        <h3>Отметка выхода</h3>
                        <div className="inline-row">
                            <label className="employee-select">
                                Сотрудник
                                <select
                                    value={workTimeClockOutEmployeeId}
                                    onChange={(e) => setWorkTimeClockOutEmployeeId(e.target.value)}
                                >
                                    <option value="">Выберите сотрудника</option>
                                    {employeeOptions.map((employee) => (
                                        <option key={employee.id} value={employee.id}>
                                            {formatEmployeeName(employee)}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <input
                                value={workTimeClockOutDeviceId}
                                onChange={(e) => setWorkTimeClockOutDeviceId(e.target.value)}
                                placeholder="ID устройства"
                            />
                            <button
                                className="primary-button"
                                type="button"
                                onClick={() =>
                                    runRequest({
                                        method: "POST",
                                        path: "/api/staff/work-time/clock-out",
                                        body: {
                                            employeeId: workTimeClockOutEmployeeId,
                                            deviceId: workTimeClockOutDeviceId || undefined,
                                        },
                                    })
                                }
                            >
                                Отметить выход
                            </button>
                        </div>
                    </div>
                    <div className="panel__section">
                        <h3>Записи учета времени</h3>
                        <div className="inline-row">
                            <label className="employee-select">
                                Сотрудник
                                <select
                                    value={workTimeHistoryEmployeeId}
                                    onChange={(e) => setWorkTimeHistoryEmployeeId(e.target.value)}
                                >
                                    <option value="">Выберите сотрудника</option>
                                    {employeeOptions.map((employee) => (
                                        <option key={employee.id} value={employee.id}>
                                            {formatEmployeeName(employee)}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <input
                                type="datetime-local"
                                value={workTimeHistoryStart}
                                onChange={(e) => setWorkTimeHistoryStart(e.target.value)}
                            />
                            <input
                                type="datetime-local"
                                value={workTimeHistoryEnd}
                                onChange={(e) => setWorkTimeHistoryEnd(e.target.value)}
                            />
                            <button
                                className="ghost-button"
                                type="button"
                                onClick={() =>
                                    runRequest({
                                        method: "GET",
                                        path: `/api/staff/work-time/employee/${workTimeHistoryEmployeeId}`,
                                        query: {
                                            startDate: toIso(workTimeHistoryStart),
                                            endDate: toIso(workTimeHistoryEnd),
                                        },
                                    })
                                }
                            >
                                Получить записи
                            </button>
                        </div>
                        <div className="inline-row">
                            <input
                                value={workTimeRecordId}
                                onChange={(e) => setWorkTimeRecordId(e.target.value)}
                                placeholder="UUID записи"
                            />
                            <button
                                className="ghost-button"
                                type="button"
                                onClick={() =>
                                    runRequest({
                                        method: "GET",
                                        path: `/api/staff/work-time/${workTimeRecordId}`,
                                    })
                                }
                            >
                                Запись по ID
                            </button>
                        </div>
                        <button
                            className="ghost-button"
                            type="button"
                            onClick={() =>
                                runRequest({
                                    method: "POST",
                                    path: "/api/staff/work-time/check-missing-clock-outs",
                                })
                            }
                        >
                            Проверить пропущенные выходы
                        </button>
                    </div>
                </div>

                <div className="panel">
                    <div className="panel__title">История нарушений</div>
                    <div className="panel__section">
                        <h3>Поиск нарушений</h3>
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
                                Подразделение
                                <input
                                    value={violationDepartment}
                                    onChange={(e) => setViolationDepartment(e.target.value)}
                                    placeholder="Подразделение"
                                />
                            </label>
                            <label>
                                Начало
                                <input
                                    type="datetime-local"
                                    value={violationStart}
                                    onChange={(e) => setViolationStart(e.target.value)}
                                />
                            </label>
                            <label>
                                Конец
                                <input
                                    type="datetime-local"
                                    value={violationEnd}
                                    onChange={(e) => setViolationEnd(e.target.value)}
                                />
                            </label>
                            <label className="form-span">
                                Тип нарушения (необязательно)
                                <input
                                    value={violationType}
                                    onChange={(e) => setViolationType(e.target.value)}
                                    placeholder="Название типа"
                                />
                            </label>
                        </div>
                        <button
                            className="primary-button"
                            type="button"
                            onClick={() =>
                                runRequest({
                                    method: "POST",
                                    path: "/api/staff/violation-history/search",
                                    body: {
                                        employeeId: violationEmployeeId || undefined,
                                        department: violationDepartment || undefined,
                                        startDate: toIso(violationStart),
                                        endDate: toIso(violationEnd),
                                        violationType: violationType || undefined,
                                    },
                                    onSuccess: (data) => setViolationHistory(toViolationHistory(data)),
                                })
                            }
                        >
                            Найти нарушения
                        </button>
                    </div>
                    <div className="panel__section">
                        <h3>Быстрые фильтры</h3>
                        <div className="inline-row">
                            <label className="employee-select">
                                Сотрудник
                                <select
                                    value={violationHistoryEmployeeId}
                                    onChange={(e) => setViolationHistoryEmployeeId(e.target.value)}
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
                                        path: `/api/staff/violation-history/employee/${violationHistoryEmployeeId}`,
                                        onSuccess: (data) => setViolationHistory(toViolationHistory(data)),
                                    })
                                }
                            >
                                По сотруднику
                            </button>
                        </div>
                        <div className="inline-row">
                            <input
                                value={violationHistoryDepartment}
                                onChange={(e) => setViolationHistoryDepartment(e.target.value)}
                                placeholder="Подразделение"
                            />
                            <button
                                className="ghost-button"
                                type="button"
                                onClick={() =>
                                    runRequest({
                                        method: "GET",
                                        path: `/api/staff/violation-history/department/${violationHistoryDepartment}`,
                                        onSuccess: (data) => setViolationHistory(toViolationHistory(data)),
                                    })
                                }
                            >
                                По подразделению
                            </button>
                        </div>
                    </div>
                    <div className="panel__section">
                        <h3>Результаты истории</h3>
                        {violationHistory?.violations?.length ? (
                            <div className="violation-list">
                                {violationHistory.violations.map((violation) => (
                                    <div className="violation-card" key={violation.id}>
                                        <div className="violation-card__title">
                                            {violation.violationType}
                                            {violation.severity ? ` · ${violation.severity}` : ""}
                                        </div>
                                        <div className="violation-card__meta">
                                            <span>Сотрудник: {violation.employeeName || violation.employeeId}</span>
                                            <span>Дата: {formatDateTime(violation.occurredAt)}</span>
                                            {violation.status ? <span>Статус: {violation.status}</span> : null}
                                        </div>
                                        {violation.description ? (
                                            <div className="violation-card__desc">{violation.description}</div>
                                        ) : null}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="hint">Результаты появятся после запроса.</div>
                        )}
                        {violationHistory?.summary ? (
                            <div className="violation-summary">
                                <div className="violation-summary__item">
                                    Всего: {violationHistory.summary.totalViolations ?? 0}
                                </div>
                                <div className="violation-summary__item">
                                    Сотрудников с нарушениями: {violationHistory.summary.employeesWithViolations ?? 0}
                                </div>
                                {violationHistory.summary.byType ? (
                                    <div className="violation-summary__item">
                                        По типам:{" "}
                                        {Object.entries(violationHistory.summary.byType)
                                            .map(([key, value]) => `${key}: ${value}`)
                                            .join(", ")}
                                    </div>
                                ) : null}
                                {violationHistory.summary.byDepartment ? (
                                    <div className="violation-summary__item">
                                        По подразделениям:{" "}
                                        {Object.entries(violationHistory.summary.byDepartment)
                                            .map(([key, value]) => `${key}: ${value}`)
                                            .join(", ")}
                                    </div>
                                ) : null}
                            </div>
                        ) : null}
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

export default StaffPage;
