import {useMemo, useState} from "react";
import type {FormEvent} from "react";
import PageShell from "../../components/PageShell";
import {apiRequest} from "../../api/client";
import {useAuth} from "../../auth/AuthContext";
import {useEmployees} from "../../hooks/useEmployees";
import type {ViolationHistoryResponse} from "../../types";
const ViolationHistoryPage = () => {
    const {token, baseUrl} = useAuth();
    const {employees} = useEmployees();
    const [employeeId, setEmployeeId] = useState("");
    const [violationType, setViolationType] = useState("LATE");
    const [severity, setSeverity] = useState("LOW");
    const [date, setDate] = useState("");
    const [result, setResult] = useState<ViolationHistoryResponse | null>(null);
    const [departmentLookup, setDepartmentLookup] = useState("");

    const employeeOptions = useMemo(() => employees.map((employee) => ({
        value: employee.id,
        label: [employee.lastName, employee.firstName, employee.middleName].filter(Boolean).join(" ").trim(),
    })), [employees]);

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        try {
            const data = await apiRequest<ViolationHistoryResponse>(baseUrl, token, "/api/staff/violation-history/search", {
                method: "POST",
                body: JSON.stringify({
                    employeeId: employeeId || null,
                    violationType: violationType || null,
                    startDate: date ? new Date(date).toISOString() : null,
                }),
            });
            setResult(data);
        } catch {
            setResult(null);
        }
    };

    const handleFetchByEmployee = async () => {
        if (!employeeId) {
            return;
        }
        try {
            const data = await apiRequest<ViolationHistoryResponse>(
                baseUrl,
                token,
                `/api/staff/violation-history/employee/${employeeId}`
            );
            setResult(data);
        } catch {
            setResult(null);
        }
    };

    const handleFetchByDepartment = async () => {
        if (!departmentLookup) {
            return;
        }
        try {
            const data = await apiRequest<ViolationHistoryResponse>(
                baseUrl,
                token,
                `/api/staff/violation-history/department/${departmentLookup}`
            );
            setResult(data);
        } catch {
            setResult(null);
        }
    };

    return (
        <PageShell
            title="Просмотр истории нарушений"
            subtitle="Здесь вы можете просмотреть историю дисциплинарных нарушений сотрудников."
            className="theme-green"
        >
            <section className="form-section">
                <div className="form-card">
                    <h3>Поиск и фильтрация нарушений</h3>
                    <form onSubmit={handleSubmit}>
                        <label>
                            Выберите сотрудника
                            <select value={employeeId} onChange={(event) => setEmployeeId(event.target.value)}>
                                <option value="">Все сотрудники</option>
                                {employeeOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label || option.value}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label>
                            Тип нарушения
                            <select value={violationType} onChange={(event) => setViolationType(event.target.value)}>
                                <option value="LATE">Опоздание</option>
                                <option value="OUT_OF_ZONE">Нахождение вне зоны</option>
                                <option value="CONFLICT">Конфликт</option>
                                <option value="OTHER">Другое</option>
                            </select>
                        </label>
                        <label>
                            Степень тяжести
                            <select value={severity} onChange={(event) => setSeverity(event.target.value)}>
                                <option value="LOW">Низкая</option>
                                <option value="MEDIUM">Средняя</option>
                                <option value="HIGH">Высокая</option>
                            </select>
                        </label>
                        <label>
                            Дата
                            <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
                        </label>
                        <button type="submit" className="primary-button">Применить фильтры</button>
                    </form>
                    <div className="inline-actions">
                        <button type="button" className="secondary-button" onClick={handleFetchByEmployee}>
                            История сотрудника
                        </button>
                        <label>
                            Подразделение
                            <input value={departmentLookup} onChange={(event) => setDepartmentLookup(event.target.value)} />
                        </label>
                        <button type="button" className="secondary-button" onClick={handleFetchByDepartment}>
                            По подразделению
                        </button>
                    </div>
                </div>
            </section>

            <section className="form-section">
                <div className="form-card">
                    <h3>История нарушений</h3>
                    <table>
                        <thead>
                        <tr>
                            <th>Дата</th>
                            <th>Тип нарушения</th>
                            <th>Описание</th>
                            <th>Степень тяжести</th>
                            <th>Подтверждение</th>
                        </tr>
                        </thead>
                        <tbody>
                        {result?.violations?.map((violation) => (
                            <tr key={violation.id}>
                                <td>{violation.occurredAt ? new Date(violation.occurredAt).toLocaleDateString("ru-RU") : "—"}</td>
                                <td>{violation.violationType}</td>
                                <td>{violation.description}</td>
                                <td>{violation.severity}</td>
                                <td>{violation.status ?? "Да"}</td>
                            </tr>
                        ))}
                        {(!result || !result.violations || result.violations.length === 0) ? (
                            <tr>
                                <td colSpan={5}>История нарушений отсутствует.</td>
                            </tr>
                        ) : null}
                        </tbody>
                    </table>
                </div>
            </section>

            <div className="actions">
                <button className="action-button" type="button">Экспорт в PDF</button>
                <button className="action-button" type="button">Инициировать разбирательство</button>
            </div>
        </PageShell>
    );
};

export default ViolationHistoryPage;
