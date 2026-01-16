import {useMemo, useState} from "react";
import type {FormEvent} from "react";
import PageShell from "../../components/PageShell";
import {apiRequest} from "../../api/client";
import {useAuth} from "../../auth/AuthContext";
import {useEmployees} from "../../hooks/useEmployees";

type RepeatedViolationResponse = {
    employees?: Array<{ employeeId: string; violationCount: number }>;
};

const severityClass = (count: number) => {
    if (count >= 5) {
        return "high";
    }
    if (count >= 3) {
        return "medium";
    }
    return "low";
};

const RepeatedViolationsPage = () => {
    const {token, baseUrl} = useAuth();
    const {employees} = useEmployees();
    const [threshold, setThreshold] = useState("3");
    const [rows, setRows] = useState<Array<{employeeId: string; violationCount: number}>>([]);

    const employeeMap = useMemo(() => {
        const map = new Map<string, string>();
        employees.forEach((employee) => {
            const name = [employee.lastName, employee.firstName, employee.middleName].filter(Boolean).join(" ").trim();
            map.set(employee.id, name || employee.id);
        });
        return map;
    }, [employees]);

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        try {
            const data = await apiRequest<RepeatedViolationResponse>(
                baseUrl,
                token,
                "/api/incident/reports/repeated-violations",
                {
                    method: "POST",
                    body: JSON.stringify({
                        threshold: Number(threshold),
                    }),
                }
            );
            setRows(data.employees || []);
        } catch {
            setRows([]);
        }
    };

    return (
        <PageShell
            title="Повторяющиеся нарушения сотрудников"
            subtitle="Обнаружение систематических нарушений среди сотрудников на основе журнала дисциплины."
            className="theme-green"
        >
            <section>
                <div className="card">
                    <h3>Порог нарушений</h3>
                    <form onSubmit={handleSubmit} className="stacked-form">
                        <label>
                            Минимальное количество нарушений:
                            <input
                                type="number"
                                value={threshold}
                                onChange={(event) => setThreshold(event.target.value)}
                                min="1"
                            />
                        </label>
                        <button type="submit" className="primary-button">Показать</button>
                    </form>
                </div>
            </section>
            <section>
                <h2>Список нарушений</h2>
                <table>
                    <thead>
                    <tr>
                        <th>Сотрудник</th>
                        <th>Нарушение</th>
                        <th>Количество</th>
                        <th>Степень</th>
                    </tr>
                    </thead>
                    <tbody>
                    {rows.map((row) => (
                        <tr key={row.employeeId}>
                            <td>{employeeMap.get(row.employeeId) ?? row.employeeId}</td>
                            <td>Повторяющиеся нарушения</td>
                            <td>{row.violationCount}</td>
                            <td>
                                <span className={`severity ${severityClass(row.violationCount)}`}>
                                    {severityClass(row.violationCount)}
                                </span>
                            </td>
                        </tr>
                    ))}
                    {rows.length === 0 ? (
                        <tr>
                            <td colSpan={4}>Данные будут отображены после запроса.</td>
                        </tr>
                    ) : null}
                    </tbody>
                </table>
            </section>
        </PageShell>
    );
};

export default RepeatedViolationsPage;
