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
                        <button type="submit">Сохранить смену</button>
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
                        <button type="submit">Перераспределить смену</button>
                    </form>
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
