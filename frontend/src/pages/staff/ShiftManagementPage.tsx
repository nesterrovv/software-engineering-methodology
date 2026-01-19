import {useEffect, useMemo, useState} from "react";
import type {FormEvent} from "react";
import PageShell from "../../components/PageShell";
import {apiRequest} from "../../api/client";
import {useAuth} from "../../auth/AuthContext";
import {useEmployees} from "../../hooks/useEmployees";
import type {ShiftSchedule} from "../../types";

type AvailabilityEmployee = {
    employeeId: string;
    name?: string | null;
    department?: string | null;
    scheduledShifts?: number | null;
    violationsCount?: number | null;
    hasRecentViolations?: boolean | null;
};

type AvailabilityResponse = {
    employees?: AvailabilityEmployee[];
    totalEmployees?: number | null;
    period?: {
        start?: string | null;
        end?: string | null;
    };
};

const formatDateTime = (value?: string | null) => {
    if (!value) {
        return "—";
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return value;
    }
    return date.toLocaleString("ru-RU");
};

const combineDateTime = (date: string, time: string) => {
    if (!date || !time) {
        return null;
    }
    const iso = new Date(`${date}T${time}`);
    return iso.toISOString();
};

const formatDateInput = (date: Date) => date.toISOString().slice(0, 10);

const ShiftManagementPage = () => {
    const {token, baseUrl} = useAuth();
    const {employees} = useEmployees();

    const [availabilityStart, setAvailabilityStart] = useState("");
    const [availabilityEnd, setAvailabilityEnd] = useState("");
    const [availability, setAvailability] = useState<AvailabilityResponse | null>(null);
    const [availabilityMessage, setAvailabilityMessage] = useState("");
    const [showAvailability, setShowAvailability] = useState(true);
    const [availabilityError, setAvailabilityError] = useState("");

    const [employeeId, setEmployeeId] = useState("");
    const [createdBy, setCreatedBy] = useState("");
    const [shiftDate, setShiftDate] = useState("");
    const [shiftStart, setShiftStart] = useState("08:00");
    const [shiftEnd, setShiftEnd] = useState("16:00");
    const [shiftType, setShiftType] = useState("DAY");
    const [location, setLocation] = useState("");
    const [notes, setNotes] = useState("");
    const [createError, setCreateError] = useState("");
    const [createMessage, setCreateMessage] = useState("");

    const [actionShiftId, setActionShiftId] = useState("");
    const [confirmById, setConfirmById] = useState("");
    const [reassignEmployeeId, setReassignEmployeeId] = useState("");
    const [actionError, setActionError] = useState("");
    const [actionMessage, setActionMessage] = useState("");

    const [shiftDetails, setShiftDetails] = useState<ShiftSchedule | null>(null);
    const [actionShiftRangeStart] = useState(() => formatDateInput(new Date()));
    const [actionShiftRangeEnd] = useState(() => {
        const date = new Date();
        date.setDate(date.getDate() + 30);
        return formatDateInput(date);
    });
    const [actionShifts, setActionShifts] = useState<ShiftSchedule[]>([]);
    const [actionShiftError, setActionShiftError] = useState("");

    useEffect(() => {
        if (!employees.length) {
            return;
        }
        if (!employeeId) {
            setEmployeeId(employees[0].id);
        }
        if (!createdBy) {
            setCreatedBy(employees[0].id);
        }
        if (!confirmById) {
            setConfirmById(employees[0].id);
        }
        if (!reassignEmployeeId) {
            setReassignEmployeeId(employees[0].id);
        }
    }, [employees, employeeId, createdBy, confirmById, reassignEmployeeId]);

    const employeeOptions = useMemo(() => employees.map((employee) => ({
        value: employee.id,
        label: [employee.lastName, employee.firstName, employee.middleName].filter(Boolean).join(" ").trim(),
    })), [employees]);

    const employeeNameById = useMemo(() => {
        const map = new Map<string, string>();
        employees.forEach((employee) => {
            const name = [employee.lastName, employee.firstName, employee.middleName].filter(Boolean).join(" ").trim();
            if (name) {
                map.set(employee.id, name);
            }
        });
        return map;
    }, [employees]);

    const actionShiftOptions = useMemo(() => actionShifts.map((shift) => {
        const employeeName = employeeNameById.get(shift.employeeId) ?? "Сотрудник";
        const dateLabel = shift.shiftDate ?? "Без даты";
        const typeLabel = shift.shiftType ?? "SHIFT";
        const statusLabel = shift.status ?? "DRAFT";
        return {
            value: shift.id,
            label: `${dateLabel} · ${employeeName} · ${typeLabel} · ${statusLabel}`,
        };
    }), [actionShifts, employeeNameById]);

    const upsertActionShift = (shift: ShiftSchedule) => {
        setActionShifts((prev) => {
            const index = prev.findIndex((item) => item.id === shift.id);
            if (index === -1) {
                return [shift, ...prev];
            }
            const next = [...prev];
            next[index] = shift;
            return next;
        });
    };

    const handleFetchAvailability = async () => {
        setAvailabilityError("");
        setAvailabilityMessage("");
        setAvailability(null);
        if (!availabilityStart || !availabilityEnd) {
            setAvailabilityError("Укажите начало и конец периода.");
            return;
        }
        try {
            const data = await apiRequest<AvailabilityResponse>(
                baseUrl,
                token,
                `/api/staff/shifts/availability?startDate=${availabilityStart}&endDate=${availabilityEnd}`
            );
            setAvailability(data || null);
            setAvailabilityMessage("Доступность загружена.");
            setShowAvailability(true);
        } catch {
            setAvailabilityError("Не удалось получить доступность сотрудников.");
        }
    };

    const handleCreateShift = async (event: FormEvent) => {
        event.preventDefault();
        setCreateError("");
        setCreateMessage("");
        const plannedStartTime = combineDateTime(shiftDate, shiftStart);
        const plannedEndTime = combineDateTime(shiftDate, shiftEnd);
        if (!employeeId || !shiftDate || !plannedStartTime || !plannedEndTime) {
            setCreateError("Заполните дату, время и сотрудника для смены.");
            return;
        }
        if (!createdBy) {
            setCreateError("Выберите автора графика.");
            return;
        }
        if (new Date(plannedEndTime) <= new Date(plannedStartTime)) {
            setCreateError("Время окончания должно быть позже начала.");
            return;
        }
        try {
            const created = await apiRequest<ShiftSchedule>(baseUrl, token, "/api/staff/shifts", {
                method: "POST",
                body: JSON.stringify({
                    employeeId,
                    shiftDate,
                    plannedStartTime,
                    plannedEndTime,
                    shiftType,
                    location,
                    createdBy,
                    notes: notes || null,
                }),
            });
            setShiftDetails(created);
            upsertActionShift(created);
            setCreateMessage("Смена создана и сохранена в черновиках.");
        } catch {
            setCreateError("Не удалось создать смену.");
        }
    };

    const handleFetchActionShifts = async () => {
        setActionShiftError("");
        try {
            const data = await apiRequest<ShiftSchedule[]>(
                baseUrl,
                token,
                `/api/staff/shifts?startDate=${actionShiftRangeStart}&endDate=${actionShiftRangeEnd}`
            );
            setActionShifts(data || []);
        } catch {
            setActionShiftError("Не удалось получить список смен.");
        }
    };

    useEffect(() => {
        void handleFetchActionShifts();
    }, [baseUrl, token, actionShiftRangeStart, actionShiftRangeEnd]);

    const handlePublishShift = async () => {
        setActionError("");
        setActionMessage("");
        if (!actionShiftId) {
            setActionError("Укажите ID смены для публикации.");
            return;
        }
        try {
            const data = await apiRequest<ShiftSchedule>(
                baseUrl,
                token,
                `/api/staff/shifts/${actionShiftId}/publish`,
                {method: "POST"}
            );
            setShiftDetails(data);
            upsertActionShift(data);
            setActionMessage("Смена опубликована.");
        } catch {
            setActionError("Не удалось опубликовать смену.");
        }
    };

    const handleConfirmShift = async () => {
        setActionError("");
        setActionMessage("");
        if (!actionShiftId || !confirmById) {
            setActionError("Укажите смену и подтверждающего сотрудника.");
            return;
        }
        try {
            const data = await apiRequest<ShiftSchedule>(
                baseUrl,
                token,
                `/api/staff/shifts/${actionShiftId}/confirm?confirmedBy=${confirmById}`,
                {method: "POST"}
            );
            setShiftDetails(data);
            upsertActionShift(data);
            setActionMessage("Смена подтверждена.");
        } catch {
            setActionError("Не удалось подтвердить смену.");
        }
    };

    const handleReassignShift = async (event: FormEvent) => {
        event.preventDefault();
        setActionError("");
        setActionMessage("");
        if (!actionShiftId || !reassignEmployeeId) {
            setActionError("Укажите смену и нового сотрудника.");
            return;
        }
        try {
            const data = await apiRequest<ShiftSchedule>(
                baseUrl,
                token,
                `/api/staff/shifts/${actionShiftId}/reassign?newEmployeeId=${reassignEmployeeId}`,
                {method: "POST"}
            );
            setShiftDetails(data);
            upsertActionShift(data);
            setActionMessage("Смена перераспределена.");
        } catch {
            setActionError("Не удалось перераспределить смену.");
        }
    };

    const availabilityEmployees = availability?.employees ?? [];

    return (
        <PageShell
            title="Управление сменами и загрузкой"
            subtitle="Планирование графиков смен с учётом загрузки, отпусков и дисциплинарных замечаний."
            className="theme-green"
        >
            <section className="form-section">
                <div className="form-card">
                    <h3>Доступность сотрудников</h3>
                    <label>
                        Начало периода
                        <input
                            type="date"
                            value={availabilityStart}
                            onChange={(event) => setAvailabilityStart(event.target.value)}
                        />
                    </label>
                    <label>
                        Конец периода
                        <input
                            type="date"
                            value={availabilityEnd}
                            onChange={(event) => setAvailabilityEnd(event.target.value)}
                        />
                    </label>
                    <div className="inline-actions">
                        <button type="button" className="secondary-button" onClick={handleFetchAvailability}>
                            Получить доступность
                        </button>
                        {availability ? (
                            <button
                                type="button"
                                className="secondary-button"
                                onClick={() => setShowAvailability((prev) => !prev)}
                            >
                                {showAvailability ? "Скрыть список" : "Показать список"}
                            </button>
                        ) : null}
                    </div>
                    {availabilityError ? <div className="form-error">{availabilityError}</div> : null}
                    {availabilityMessage ? <div className="form-success">{availabilityMessage}</div> : null}
                    {availability ? (
                        <div className="report-output">
                            <div className="data-row">
                                <span>Период</span>
                                <span className="value">
                                    {availability.period?.start ?? "—"} — {availability.period?.end ?? "—"}
                                </span>
                            </div>
                            <div className="data-row">
                                <span>Всего сотрудников</span>
                                <span className="value">{availability.totalEmployees ?? 0}</span>
                            </div>
                        </div>
                    ) : null}
                </div>
            </section>

            {showAvailability && availabilityEmployees.length ? (
                <section className="page-section">
                    <h3>Распределение и нарушения</h3>
                    <div className="card-list">
                        {availabilityEmployees.map((employee) => (
                            <div key={employee.employeeId} className="card">
                                <p><strong>{employee.name || employeeNameById.get(employee.employeeId) || "—"}</strong></p>
                                <p className="muted">Подразделение: {employee.department ?? "—"}</p>
                                <p className="muted">Запланировано смен: {employee.scheduledShifts ?? 0}</p>
                                <p className="muted">Нарушений: {employee.violationsCount ?? 0}</p>
                                <p className="muted">
                                    Рекомендация: {employee.hasRecentViolations ? "Снизить нагрузку" : "Можно назначать"}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>
            ) : null}

            <section className="form-section">
                <div className="form-card">
                    <h3>Создать расписание смены</h3>
                    <form onSubmit={handleCreateShift} className="stacked-form">
                        <label>
                            Сотрудник
                            <select value={employeeId} onChange={(event) => setEmployeeId(event.target.value)}>
                                <option value="">Выберите сотрудника</option>
                                {employeeOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label || option.value}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label>
                            Дата смены
                            <input type="date" value={shiftDate} onChange={(event) => setShiftDate(event.target.value)} />
                        </label>
                        <label>
                            Время начала
                            <input type="time" value={shiftStart} onChange={(event) => setShiftStart(event.target.value)} />
                        </label>
                        <label>
                            Время окончания
                            <input type="time" value={shiftEnd} onChange={(event) => setShiftEnd(event.target.value)} />
                        </label>
                        <label>
                            Тип смены
                            <select value={shiftType} onChange={(event) => setShiftType(event.target.value)}>
                                <option value="DAY">Дневная</option>
                                <option value="EVENING">Вечерняя</option>
                                <option value="NIGHT">Ночная</option>
                            </select>
                        </label>
                        <label>
                            Локация
                            <input value={location} onChange={(event) => setLocation(event.target.value)} />
                        </label>
                        <label>
                            Автор графика
                            <select value={createdBy} onChange={(event) => setCreatedBy(event.target.value)}>
                                <option value="">Выберите сотрудника</option>
                                {employeeOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label || option.value}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label>
                            Примечание
                            <textarea
                                rows={3}
                                value={notes}
                                onChange={(event) => setNotes(event.target.value)}
                                placeholder="Комментарий или причина назначения"
                            />
                        </label>
                        <button type="submit" className="primary-button">Создать смену</button>
                    </form>
                    {createError ? <div className="form-error">{createError}</div> : null}
                    {createMessage ? <div className="form-success">{createMessage}</div> : null}
                </div>
            </section>

            <section className="form-section">
                <div className="form-card">
                    <h3>Действия со сменой</h3>
                    <label>
                        Смена
                        <select
                            value={actionShiftId}
                            onChange={(event) => setActionShiftId(event.target.value)}
                        >
                            <option value="">Выберите смену</option>
                            {actionShiftOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </label>
                    <div className="inline-actions">
                        <button type="button" className="secondary-button" onClick={handlePublishShift}>
                            Опубликовать
                        </button>
                        <button type="button" className="secondary-button" onClick={handleFetchActionShifts}>
                            Обновить список смен
                        </button>
                    </div>
                    <label>
                        Подтверждающий
                        <select value={confirmById} onChange={(event) => setConfirmById(event.target.value)}>
                            <option value="">Выберите сотрудника</option>
                            {employeeOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label || option.value}
                                </option>
                            ))}
                        </select>
                    </label>
                    <button type="button" className="secondary-button" onClick={handleConfirmShift}>
                        Подтвердить смену
                    </button>
                    <form onSubmit={handleReassignShift} className="stacked-form">
                        <label>
                            Новый сотрудник
                            <select
                                value={reassignEmployeeId}
                                onChange={(event) => setReassignEmployeeId(event.target.value)}
                            >
                                <option value="">Выберите сотрудника</option>
                                {employeeOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label || option.value}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <button type="submit" className="secondary-button">Перераспределить смену</button>
                    </form>
                    {actionShiftError ? <div className="form-error">{actionShiftError}</div> : null}
                    {actionError ? <div className="form-error">{actionError}</div> : null}
                    {actionMessage ? <div className="form-success">{actionMessage}</div> : null}
                </div>
            </section>

            {shiftDetails ? (
                <section className="page-section">
                    <h3>Детали последней операции</h3>
                    <div className="report-output">
                        <div className="data-row">
                            <span>Сотрудник</span>
                            <span className="value">
                                {employeeNameById.get(shiftDetails.employeeId) ?? shiftDetails.employeeId}
                            </span>
                        </div>
                        <div className="data-row">
                            <span>Дата</span>
                            <span className="value">{shiftDetails.shiftDate ?? "—"}</span>
                        </div>
                        <div className="data-row">
                            <span>Время</span>
                            <span className="value">
                                {formatDateTime(shiftDetails.plannedStartTime)} — {formatDateTime(shiftDetails.plannedEndTime)}
                            </span>
                        </div>
                        <div className="data-row">
                            <span>Тип</span>
                            <span className="value">{shiftDetails.shiftType ?? "—"}</span>
                        </div>
                        <div className="data-row">
                            <span>Статус</span>
                            <span className="value">{shiftDetails.status ?? "DRAFT"}</span>
                        </div>
                        <div className="data-row">
                            <span>Локация</span>
                            <span className="value">{shiftDetails.location ?? "—"}</span>
                        </div>
                        <div className="data-row">
                            <span>Автор</span>
                            <span className="value">
                                {shiftDetails.createdBy
                                    ? employeeNameById.get(shiftDetails.createdBy) ?? shiftDetails.createdBy
                                    : "—"}
                            </span>
                        </div>
                    </div>
                </section>
            ) : null}
        </PageShell>
    );
};

export default ShiftManagementPage;
