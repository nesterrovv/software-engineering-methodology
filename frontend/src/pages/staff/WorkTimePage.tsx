import {useEffect, useMemo, useState} from "react";
import PageShell from "../../components/PageShell";
import {apiRequest} from "../../api/client";
import {useAuth} from "../../auth/AuthContext";
import {useEmployees} from "../../hooks/useEmployees";
import type {WorkTimeRecord} from "../../types";
const WorkTimePage = () => {
    const {token, baseUrl} = useAuth();
    const {employees} = useEmployees();
    const [selectedEmployee, setSelectedEmployee] = useState("");
    const [records, setRecords] = useState<WorkTimeRecord[]>([]);
    const [now, setNow] = useState(new Date());
    const [statusMessage, setStatusMessage] = useState("");

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
                    <button type="button" onClick={() => void clock("clock-in")}>Вход</button>
                    <button type="button" onClick={() => void clock("clock-out")}>Выход</button>
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
        </PageShell>
    );
};

export default WorkTimePage;
