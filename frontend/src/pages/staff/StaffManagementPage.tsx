import {useEffect, useMemo, useState} from "react";
import type {FormEvent} from "react";
import PageShell from "../../components/PageShell";
import {apiRequest} from "../../api/client";
import {useAuth} from "../../auth/AuthContext";
import {useEmployees} from "../../hooks/useEmployees";
import type {Employee} from "../../types";

const StaffManagementPage = () => {
    const {token, baseUrl} = useAuth();
    const {employees, refresh} = useEmployees();
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
    const [createMessage, setCreateMessage] = useState("");
    const [createError, setCreateError] = useState("");
    const [statusMessage, setStatusMessage] = useState("");
    const [statusError, setStatusError] = useState("");

    useEffect(() => {
        if (!employees.length || employeeStatusId) {
            return;
        }
        setEmployeeStatusId(employees[0].id);
    }, [employees, employeeStatusId]);

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

    const handleCreateEmployee = async (event: FormEvent) => {
        event.preventDefault();
        setCreateError("");
        setCreateMessage("");
        if (!firstName || !lastName || !position || !department) {
            setCreateError("Заполните имя, фамилию, должность и подразделение.");
            return;
        }
        try {
            await apiRequest<Employee>(baseUrl, token, "/api/staff/employees", {
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
        } catch {
            setCreateError("Не удалось добавить сотрудника.");
        }
    };

    const handleUpdateEmployeeStatus = async () => {
        setStatusError("");
        setStatusMessage("");
        if (!employeeStatusId) {
            setStatusError("Выберите сотрудника.");
            return;
        }
        try {
            await apiRequest<Employee>(
                baseUrl,
                token,
                `/api/staff/employees/${employeeStatusId}/status?status=${employeeStatusValue}`,
                {method: "PATCH"}
            );
            setStatusMessage("Статус сотрудника обновлён.");
            await refresh();
        } catch {
            setStatusError("Не удалось обновить статус.");
        }
    };

    return (
        <PageShell
            title="Управление персоналом"
            subtitle="Добавление сотрудников, просмотр и обновление статусов."
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
                        Сотрудник
                        <select value={employeeStatusId} onChange={(event) => setEmployeeStatusId(event.target.value)}>
                            <option value="">Выберите сотрудника</option>
                            {employeeOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label || option.value}
                                </option>
                            ))}
                        </select>
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
                    {statusError ? <div className="form-error">{statusError}</div> : null}
                    {statusMessage ? <div className="form-success">{statusMessage}</div> : null}
                </div>
            </section>
        </PageShell>
    );
};

export default StaffManagementPage;
