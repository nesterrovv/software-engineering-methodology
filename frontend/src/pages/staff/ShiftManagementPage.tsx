import {useEffect, useMemo, useState} from "react";
import type {FormEvent} from "react";
import PageShell from "../../components/PageShell";
import {apiRequest} from "../../api/client";
import {useAuth} from "../../auth/AuthContext";
import {useEmployees} from "../../hooks/useEmployees";
import type {ShiftSchedule} from "../../types";
const combineDateTime = (date: string, time: string) => {
    if (!date || !time) {
        return null;
    }
    const iso = new Date(`${date}T${time}`);
    return iso.toISOString();
};

const ShiftManagementPage = () => {
    const {token, baseUrl} = useAuth();
    const {employees} = useEmployees();
    const [employeeId, setEmployeeId] = useState("");
    const [shiftDate, setShiftDate] = useState("");
    const [shiftType, setShiftType] = useState("DAY");
    const [shiftStart, setShiftStart] = useState("08:00");
    const [shiftEnd, setShiftEnd] = useState("16:00");
    const [location, setLocation] = useState("");
    const [notes, setNotes] = useState("");

    const [reassignShiftId, setReassignShiftId] = useState("");
    const [reassignEmployeeId, setReassignEmployeeId] = useState("");

    const [schedules, setSchedules] = useState<ShiftSchedule[]>([]);
    const [statusMessage, setStatusMessage] = useState("");
    const [shiftIdLookup, setShiftIdLookup] = useState("");
    const [shiftDetails, setShiftDetails] = useState<ShiftSchedule | null>(null);
    const [availabilityStart, setAvailabilityStart] = useState("");
    const [availabilityEnd, setAvailabilityEnd] = useState("");
    const [availabilityData, setAvailabilityData] = useState<Record<string, unknown> | null>(null);
    const [employeeShiftLookup, setEmployeeShiftLookup] = useState("");
    const [employeeShifts, setEmployeeShifts] = useState<ShiftSchedule[]>([]);
    const [rangeStart, setRangeStart] = useState("");
    const [rangeEnd, setRangeEnd] = useState("");
    const [rangeShifts, setRangeShifts] = useState<ShiftSchedule[]>([]);
    const [confirmShiftId, setConfirmShiftId] = useState("");
    const [confirmById, setConfirmById] = useState("");

    useEffect(() => {
        if (!employees.length || employeeId) {
            return;
        }
        setEmployeeId(employees[0].id);
        setReassignEmployeeId(employees[0].id);
    }, [employees, employeeId]);

    const employeeOptions = useMemo(() => employees.map((employee) => ({
        value: employee.id,
        label: [employee.lastName, employee.firstName, employee.middleName].filter(Boolean).join(" ").trim(),
    })), [employees]);

    const handleCreate = async (event: FormEvent) => {
        event.preventDefault();
        const plannedStartTime = combineDateTime(shiftDate, shiftStart);
        const plannedEndTime = combineDateTime(shiftDate, shiftEnd);
        if (!employeeId || !shiftDate || !plannedStartTime || !plannedEndTime) {
            setStatusMessage("Заполните дату и время смены.");
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
                    notes,
                }),
            });
            setSchedules((prev) => [created, ...prev]);
            setStatusMessage("Смена сохранена.");
        } catch {
            setStatusMessage("Не удалось сохранить смену.");
        }
    };

    const handleReassign = async (event: FormEvent) => {
        event.preventDefault();
        if (!reassignShiftId || !reassignEmployeeId) {
            setStatusMessage("Укажите смену и нового сотрудника.");
            return;
        }
        try {
            const updated = await apiRequest<ShiftSchedule>(
                baseUrl,
                token,
                `/api/staff/shifts/${reassignShiftId}/reassign?newEmployeeId=${reassignEmployeeId}`,
                {method: "POST"}
            );
            setSchedules((prev) => [updated, ...prev]);
            setStatusMessage("Смена перераспределена.");
        } catch {
            setStatusMessage("Не удалось перераспределить смену.");
        }
    };

    const handleFetchShiftById = async () => {
        if (!shiftIdLookup) {
            setStatusMessage("Укажите ID смены.");
            return;
        }
        try {
            const data = await apiRequest<ShiftSchedule>(
                baseUrl,
                token,
                `/api/staff/shifts/${shiftIdLookup}`
            );
            setShiftDetails(data);
        } catch {
            setStatusMessage("Не удалось получить смену.");
        }
    };

    const handleFetchAvailability = async () => {
        if (!availabilityStart || !availabilityEnd) {
            setStatusMessage("Укажите даты периода.");
            return;
        }
        try {
            const data = await apiRequest<Record<string, unknown>>(
                baseUrl,
                token,
                `/api/staff/shifts/availability?startDate=${availabilityStart}&endDate=${availabilityEnd}`
            );
            setAvailabilityData(data || {});
        } catch {
            setStatusMessage("Не удалось получить доступность.");
        }
    };

    const handleFetchByEmployee = async () => {
        if (!employeeShiftLookup) {
            setStatusMessage("Укажите ID сотрудника.");
            return;
        }
        try {
            const data = await apiRequest<ShiftSchedule[]>(
                baseUrl,
                token,
                `/api/staff/shifts/employee/${employeeShiftLookup}`
            );
            setEmployeeShifts(data || []);
        } catch {
            setStatusMessage("Не удалось получить смены сотрудника.");
        }
    };

    const handleFetchByRange = async () => {
        if (!rangeStart || !rangeEnd) {
            setStatusMessage("Укажите период.");
            return;
        }
        try {
            const data = await apiRequest<ShiftSchedule[]>(
                baseUrl,
                token,
                `/api/staff/shifts?startDate=${rangeStart}&endDate=${rangeEnd}`
            );
            setRangeShifts(data || []);
        } catch {
            setStatusMessage("Не удалось получить смены по периоду.");
        }
    };

    const handlePublishShift = async () => {
        if (!shiftIdLookup) {
            setStatusMessage("Укажите ID смены.");
            return;
        }
        try {
            const data = await apiRequest<ShiftSchedule>(
                baseUrl,
                token,
                `/api/staff/shifts/${shiftIdLookup}/publish`,
                {method: "POST"}
            );
            setShiftDetails(data);
            setStatusMessage("Смена опубликована.");
        } catch {
            setStatusMessage("Не удалось опубликовать смену.");
        }
    };

    const handleConfirmShift = async () => {
        if (!confirmShiftId || !confirmById) {
            setStatusMessage("Укажите ID смены и подтверждающего.");
            return;
        }
        try {
            const data = await apiRequest<ShiftSchedule>(
                baseUrl,
                token,
                `/api/staff/shifts/${confirmShiftId}/confirm?confirmedBy=${confirmById}`,
                {method: "POST"}
            );
            setShiftDetails(data);
            setStatusMessage("Смена подтверждена.");
        } catch {
            setStatusMessage("Не удалось подтвердить смену.");
        }
    };

    return (
        <PageShell
            title="Управление сменами и загрузкой"
            subtitle="Планирование и корректировка графиков смен сотрудников с учетом их загрузки и отпуска."
            className="theme-green"
        >
            <section className="form-section">
                <div className="form-card">
                    <h3>Планирование смен</h3>
                    <form onSubmit={handleCreate}>
                        <label>
                            Выберите период для планирования
                            <div className="calendar">
                                <span className="date-range">{shiftDate ? `Дата ${shiftDate}` : "Выберите дату"}</span>
                            </div>
                        </label>
                        <label>
                            Выберите сотрудника
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
                            Выберите смену
                            <select value={shiftType} onChange={(event) => setShiftType(event.target.value)}>
                                <option value="DAY">Утро (8:00 - 16:00)</option>
                                <option value="EVENING">Вечер (16:00 - 00:00)</option>
                                <option value="NIGHT">Ночь (00:00 - 8:00)</option>
                            </select>
                        </label>
                        <label>
                            Локация
                            <input value={location} onChange={(event) => setLocation(event.target.value)} />
                        </label>
                        <label>
                            Комментарий или примечание
                            <textarea
                                rows={4}
                                value={notes}
                                onChange={(event) => setNotes(event.target.value)}
                                placeholder="Комментарий, причина корректировки или другие важные детали..."
                            />
                        </label>
                        <button type="submit" className="primary-button">Сохранить смену</button>
                    </form>
                </div>
            </section>

            <section className="form-section">
                <div className="form-card">
                    <h3>Экстренное перераспределение смен</h3>
                    <form onSubmit={handleReassign}>
                        <label>
                            ID смены для перераспределения
                            <input value={reassignShiftId} onChange={(event) => setReassignShiftId(event.target.value)} />
                        </label>
                        <label>
                            Выберите сотрудника для перераспределения
                            <select value={reassignEmployeeId} onChange={(event) => setReassignEmployeeId(event.target.value)}>
                                <option value="">Выберите сотрудника</option>
                                {employeeOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label || option.value}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <button type="submit" className="primary-button">Перераспределить смену</button>
                    </form>
                </div>
            </section>

            <section className="form-section">
                <div className="form-card">
                    <h3>Управление сменами</h3>
                    <label>
                        ID смены
                        <input value={shiftIdLookup} onChange={(event) => setShiftIdLookup(event.target.value)} />
                    </label>
                    <div className="inline-actions">
                        <button type="button" className="secondary-button" onClick={handleFetchShiftById}>
                            Найти смену
                        </button>
                        <button type="button" className="secondary-button" onClick={handlePublishShift}>
                            Опубликовать
                        </button>
                    </div>
                    <label>
                        Подтверждающий (UUID)
                        <input value={confirmById} onChange={(event) => setConfirmById(event.target.value)} />
                    </label>
                    <label>
                        ID смены для подтверждения
                        <input value={confirmShiftId} onChange={(event) => setConfirmShiftId(event.target.value)} />
                    </label>
                    <button type="button" className="secondary-button" onClick={handleConfirmShift}>
                        Подтвердить смену
                    </button>
                    {shiftDetails ? (
                        <div className="report-output">
                            <p><strong>ID:</strong> {shiftDetails.id}</p>
                            <p><strong>Статус:</strong> {shiftDetails.status ?? "DRAFT"}</p>
                            <p><strong>Дата:</strong> {shiftDetails.shiftDate ?? "—"}</p>
                            <p><strong>Тип:</strong> {shiftDetails.shiftType ?? "—"}</p>
                        </div>
                    ) : null}
                </div>
            </section>

            <section className="form-section">
                <div className="form-card">
                    <h3>Доступность сотрудников</h3>
                    <label>
                        Начало периода
                        <input type="date" value={availabilityStart} onChange={(event) => setAvailabilityStart(event.target.value)} />
                    </label>
                    <label>
                        Конец периода
                        <input type="date" value={availabilityEnd} onChange={(event) => setAvailabilityEnd(event.target.value)} />
                    </label>
                    <button type="button" className="secondary-button" onClick={handleFetchAvailability}>
                        Получить доступность
                    </button>
                    {availabilityData ? (
                        <div className="report-output">
                            <pre>{JSON.stringify(availabilityData, null, 2)}</pre>
                        </div>
                    ) : null}
                </div>
            </section>

            <section className="form-section">
                <div className="form-card">
                    <h3>Поиск смен</h3>
                    <label>
                        ID сотрудника
                        <input value={employeeShiftLookup} onChange={(event) => setEmployeeShiftLookup(event.target.value)} />
                    </label>
                    <button type="button" className="secondary-button" onClick={handleFetchByEmployee}>
                        Смены сотрудника
                    </button>
                    <label>
                        Период начала
                        <input type="date" value={rangeStart} onChange={(event) => setRangeStart(event.target.value)} />
                    </label>
                    <label>
                        Период окончания
                        <input type="date" value={rangeEnd} onChange={(event) => setRangeEnd(event.target.value)} />
                    </label>
                    <button type="button" className="secondary-button" onClick={handleFetchByRange}>
                        Смены по периоду
                    </button>
                    {employeeShifts.length ? (
                        <div className="card-list">
                            {employeeShifts.map((shift) => (
                                <div key={shift.id} className="card">
                                    <p><strong>ID:</strong> {shift.id}</p>
                                    <p>Дата: {shift.shiftDate ?? "—"}</p>
                                    <p>Статус: {shift.status ?? "DRAFT"}</p>
                                </div>
                            ))}
                        </div>
                    ) : null}
                    {rangeShifts.length ? (
                        <div className="card-list">
                            {rangeShifts.map((shift) => (
                                <div key={shift.id} className="card">
                                    <p><strong>ID:</strong> {shift.id}</p>
                                    <p>Дата: {shift.shiftDate ?? "—"}</p>
                                    <p>Статус: {shift.status ?? "DRAFT"}</p>
                                </div>
                            ))}
                        </div>
                    ) : null}
                </div>
            </section>

            {statusMessage ? <div className="form-success">{statusMessage}</div> : null}

            {schedules.length ? (
                <section className="page-section">
                    <h2>Созданные смены</h2>
                    <div className="card-list">
                        {schedules.map((schedule) => (
                            <div key={schedule.id} className="card">
                                <h4>Смена #{schedule.id.slice(0, 8)}</h4>
                                <p>Дата: {schedule.shiftDate}</p>
                                <p>Тип: {schedule.shiftType}</p>
                                <p>Локация: {schedule.location ?? "—"}</p>
                            </div>
                        ))}
                    </div>
                </section>
            ) : null}
        </PageShell>
    );
};

export default ShiftManagementPage;
