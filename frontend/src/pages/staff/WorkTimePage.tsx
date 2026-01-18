import {useEffect, useMemo, useState} from "react";
import type {FormEvent} from "react";
import PageShell from "../../components/PageShell";
import {apiRequest} from "../../api/client";
import {useAuth} from "../../auth/AuthContext";
import {useEmployees} from "../../hooks/useEmployees";
import type {Employee, WorkTimeRecord} from "../../types";
const WorkTimePage = () => {
    const {token, baseUrl} = useAuth();
    const {employees, refresh} = useEmployees();
    const [selectedEmployee, setSelectedEmployee] = useState("");
    const [records, setRecords] = useState<WorkTimeRecord[]>([]);
    const [now, setNow] = useState(new Date());
    const [statusMessage, setStatusMessage] = useState("");
    const [createMessage, setCreateMessage] = useState("");
    const [createError, setCreateError] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [middleName, setMiddleName] = useState("");
    const [position, setPosition] = useState("");
    const [department, setDepartment] = useState("");
    const [status, setStatus] = useState("ACTIVE");
    const [contactInfo, setContactInfo] = useState("");
    const [departmentFilter, setDepartmentFilter] = useState("ALL");
    const [showEmployees, setShowEmployees] = useState(false);
    const [employeeStatusId, setEmployeeStatusId] = useState("");
    const [employeeStatusValue, setEmployeeStatusValue] = useState("ACTIVE");
    const [workTimeIdLookup, setWorkTimeIdLookup] = useState("");
    const [workTimeDetails, setWorkTimeDetails] = useState<WorkTimeRecord | null>(null);
    const [missingClockOutMessage, setMissingClockOutMessage] = useState("");

    useEffect(() => {
        const interval = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (!employees.length || selectedEmployee) {
            return;
        }
        setSelectedEmployee(employees[0].id);
    }, [employees, selectedEmployee]);

    const employeeOptions = useMemo(() => employees.map((employee) => ({
        value: employee.id,
        label: [employee.lastName, employee.firstName, employee.middleName].filter(Boolean).join(" ").trim(),
    })), [employees]);

    const departments = useMemo(() => {
        const values = employees
            .map((employee) => employee.department)
            .filter((value): value is string => Boolean(value && value.trim()));
        return Array.from(new Set(values)).sort();
    }, [employees]);

    const filteredEmployees = useMemo(() => {
        if (departmentFilter === "ALL") {
            return employees;
        }
        return employees.filter((employee) => employee.department === departmentFilter);
    }, [employees, departmentFilter]);

    const fetchRecords = async (employeeId: string) => {
        if (!employeeId) {
            return;
        }
        try {
            const data = await apiRequest<WorkTimeRecord[]>(
                baseUrl,
                token,
                `/api/staff/work-time/employee/${employeeId}`
            );
            setRecords(data || []);
        } catch {
            setRecords([]);
        }
    };

    const handleCreateEmployee = async (event: FormEvent) => {
        event.preventDefault();
        setCreateError("");
        setCreateMessage("");
        if (!firstName || !lastName || !position || !department) {
            setCreateError("Заполните имя, фамилию, должность и подразделение.");
            return;
        }
        try {
            const created = await apiRequest<Employee>(baseUrl, token, "/api/staff/employees", {
                method: "POST",
                body: JSON.stringify({
                    firstName,
                    lastName,
                    middleName: middleName || null,
                    position,
                    department,
                    status,
                    contactInfo: contactInfo || null,
                }),
            });
            setCreateMessage("Сотрудник добавлен.");
            setFirstName("");
            setLastName("");
            setMiddleName("");
            setPosition("");
            setDepartment("");
            setContactInfo("");
            await refresh();
            if (created?.id) {
                setSelectedEmployee(created.id);
                await fetchRecords(created.id);
            }
        } catch {
            setCreateError("Не удалось добавить сотрудника.");
        }
    };

    const handleUpdateEmployeeStatus = async () => {
        setCreateError("");
        if (!employeeStatusId) {
            setCreateError("Укажите ID сотрудника.");
            return;
        }
        try {
            const data = await apiRequest<Employee>(
                baseUrl,
                token,
                `/api/staff/employees/${employeeStatusId}/status?status=${employeeStatusValue}`,
                {method: "PATCH"}
            );
            if (data) {
                setCreateMessage("Статус сотрудника обновлён.");
            }
            await refresh();
        } catch {
            setCreateError("Не удалось обновить статус.");
        }
    };

    const handleFetchWorkTimeById = async () => {
        if (!workTimeIdLookup) {
            return;
        }
        try {
            const data = await apiRequest<WorkTimeRecord>(
                baseUrl,
                token,
                `/api/staff/work-time/${workTimeIdLookup}`
            );
            setWorkTimeDetails(data);
        } catch {
            setWorkTimeDetails(null);
        }
    };

    const handleCheckMissingClockOuts = async () => {
        setMissingClockOutMessage("");
        try {
            await apiRequest(baseUrl, token, "/api/staff/work-time/check-missing-clock-outs", {method: "POST"});
            setMissingClockOutMessage("Проверка выполнена. При необходимости уведомления отправлены.");
        } catch {
            setMissingClockOutMessage("Не удалось запустить проверку.");
        }
    };

    const clock = async (type: "clock-in" | "clock-out") => {
        if (!selectedEmployee) {
            return;
        }
        try {
            await apiRequest(baseUrl, token, `/api/staff/work-time/${type}`, {
                method: "POST",
                body: JSON.stringify({
                    employeeId: selectedEmployee,
                    deviceId: "web",
                }),
            });
            setStatusMessage(type === "clock-in" ? "Вход зафиксирован." : "Выход зафиксирован.");
            await fetchRecords(selectedEmployee);
        } catch {
            setStatusMessage("Не удалось выполнить операцию.");
        }
    };

    return (
        <PageShell
            title="Учёт времени работы сотрудников"
            subtitle="Фиксация начала и конца смен, расчёт фактических часов работы."
            className="theme-green"
        >
            <section className="form-section">
                <div className="form-card">
                    <h3>Добавление сотрудника</h3>
                    <form onSubmit={handleCreateEmployee} className="stacked-form">
                        <label>
                            Имя
                            <input value={firstName} onChange={(event) => setFirstName(event.target.value)} />
                        </label>
                        <label>
                            Фамилия
                            <input value={lastName} onChange={(event) => setLastName(event.target.value)} />
                        </label>
                        <label>
                            Отчество
                            <input value={middleName} onChange={(event) => setMiddleName(event.target.value)} />
                        </label>
                        <label>
                            Должность
                            <input value={position} onChange={(event) => setPosition(event.target.value)} />
                        </label>
                        <label>
                            Подразделение
                            <input value={department} onChange={(event) => setDepartment(event.target.value)} />
                        </label>
                        <label>
                            Статус
                            <select value={status} onChange={(event) => setStatus(event.target.value)}>
                                <option value="ACTIVE">Активен</option>
                                <option value="ON_LEAVE">В отпуске</option>
                                <option value="SICK_LEAVE">Больничный</option>
                                <option value="TERMINATED">Уволен</option>
                            </select>
                        </label>
                        <label>
                            Контактная информация
                            <input value={contactInfo} onChange={(event) => setContactInfo(event.target.value)} />
                        </label>
                        <button type="submit" className="primary-button">Добавить сотрудника</button>
                    </form>
                    {createError ? <div className="form-error">{createError}</div> : null}
                    {createMessage ? <div className="form-success">{createMessage}</div> : null}
                </div>
            </section>

            <section className="form-section">
                <div className="form-card">
                    <h3>Список сотрудников</h3>
                    <label>
                        Подразделение
                        <select
                            value={departmentFilter}
                            onChange={(event) => setDepartmentFilter(event.target.value)}
                        >
                            <option value="ALL">Все подразделения</option>
                            {departments.map((department) => (
                                <option key={department} value={department}>
                                    {department}
                                </option>
                            ))}
                        </select>
                    </label>
                    <button
                        type="button"
                        className="secondary-button"
                        onClick={() => setShowEmployees((prev) => !prev)}
                    >
                        {showEmployees ? "Скрыть список" : "Показать список"}
                    </button>
                    {showEmployees ? (
                        <div className="card-list">
                            {filteredEmployees.map((employee) => (
                                <div key={employee.id} className="card">
                                    <p><strong>{employee.lastName} {employee.firstName}</strong></p>
                                    <p className="muted">
                                        {employee.position ?? "—"} · {employee.department ?? "—"} · {employee.status ?? "ACTIVE"}
                                    </p>
                                </div>
                            ))}
                            {filteredEmployees.length === 0 ? (
                                <div className="card">
                                    <p>Сотрудники не найдены.</p>
                                </div>
                            ) : null}
                        </div>
                    ) : null}
                </div>
            </section>

            <section className="form-section">
                <div className="form-card">
                    <h3>Обновление статуса сотрудника</h3>
                    <label>
                        ID сотрудника
                        <input value={employeeStatusId} onChange={(event) => setEmployeeStatusId(event.target.value)} />
                    </label>
                    <label>
                        Новый статус
                        <select value={employeeStatusValue} onChange={(event) => setEmployeeStatusValue(event.target.value)}>
                            <option value="ACTIVE">ACTIVE</option>
                            <option value="ON_LEAVE">ON_LEAVE</option>
                            <option value="SICK_LEAVE">SICK_LEAVE</option>
                            <option value="TERMINATED">TERMINATED</option>
                        </select>
                    </label>
                    <button type="button" className="secondary-button" onClick={handleUpdateEmployeeStatus}>
                        Обновить статус
                    </button>
                </div>
            </section>
            <section className="time-tracking">
                <div className="card">
                    <h3>Текущее время</h3>
                    <p className="data">{now.toLocaleTimeString("ru-RU")}</p>
                </div>

                <label>
                    Сотрудник
                    <select value={selectedEmployee} onChange={(event) => {
                        setSelectedEmployee(event.target.value);
                        void fetchRecords(event.target.value);
                    }}>
                        <option value="">Выберите сотрудника</option>
                        {employeeOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label || option.value}
                            </option>
                        ))}
                    </select>
                </label>

                <div className="clock-buttons">
                    <button type="button" className="primary-button" onClick={() => void clock("clock-in")}>Вход</button>
                    <button type="button" className="primary-button" onClick={() => void clock("clock-out")}>Выход</button>
                </div>
                {statusMessage ? <div className="form-success">{statusMessage}</div> : null}
            </section>

            <section className="history">
                <h2>История смен</h2>
                <table>
                    <thead>
                    <tr>
                        <th>Дата</th>
                        <th>Время входа</th>
                        <th>Время выхода</th>
                        <th>Отработано</th>
                    </tr>
                    </thead>
                    <tbody>
                    {records.map((record) => (
                        <tr key={record.id}>
                            <td>{record.clockInTime ? new Date(record.clockInTime).toLocaleDateString("ru-RU") : "—"}</td>
                            <td>{record.clockInTime ? new Date(record.clockInTime).toLocaleTimeString("ru-RU") : "—"}</td>
                            <td>{record.clockOutTime ? new Date(record.clockOutTime).toLocaleTimeString("ru-RU") : "—"}</td>
                            <td>{record.workedMinutes ? `${Math.round(record.workedMinutes / 60)} часов` : "—"}</td>
                        </tr>
                    ))}
                    {records.length === 0 ? (
                        <tr>
                            <td colSpan={4}>История смен отсутствует.</td>
                        </tr>
                    ) : null}
                    </tbody>
                </table>
            </section>

            <section className="form-section">
                <div className="form-card">
                    <h3>Контроль отметок</h3>
                    <label>
                        Найти запись по ID
                        <input value={workTimeIdLookup} onChange={(event) => setWorkTimeIdLookup(event.target.value)} />
                    </label>
                    <button type="button" className="secondary-button" onClick={handleFetchWorkTimeById}>
                        Найти запись
                    </button>
                    {workTimeDetails ? (
                        <div className="report-output">
                            <p><strong>ID:</strong> {workTimeDetails.id}</p>
                            <p><strong>Сотрудник:</strong> {workTimeDetails.employeeId}</p>
                            <p><strong>Статус:</strong> {workTimeDetails.status ?? "—"}</p>
                        </div>
                    ) : null}
                    <button type="button" className="secondary-button" onClick={handleCheckMissingClockOuts}>
                        Проверить отсутствующие выходы
                    </button>
                    {missingClockOutMessage ? <div className="form-success">{missingClockOutMessage}</div> : null}
                </div>
            </section>
        </PageShell>
    );
};

export default WorkTimePage;
