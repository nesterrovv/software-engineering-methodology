import {useEffect, useMemo, useState} from "react";
import type {FormEvent} from "react";
import PageShell from "../../components/PageShell";
import {apiRequest} from "../../api/client";
import {useAuth} from "../../auth/AuthContext";
import {useEmployees} from "../../hooks/useEmployees";

const DisciplinaryViolationsPage = () => {
    const {token, baseUrl} = useAuth();
    const {employees} = useEmployees();
    const [employeeId, setEmployeeId] = useState("");
    const [violationType, setViolationType] = useState("LATE");
    const [description, setDescription] = useState("");
    const [statusMessage, setStatusMessage] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        if (!employees.length || employeeId) {
            return;
        }
        setEmployeeId(employees[0].id);
    }, [employees, employeeId]);

    const employeeOptions = useMemo(() => employees.map((employee) => ({
        value: employee.id,
        label: [employee.lastName, employee.firstName, employee.middleName].filter(Boolean).join(" ").trim(),
    })), [employees]);

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setError("");
        setStatusMessage("");
        if (!employeeId) {
            setError("Выберите сотрудника.");
            return;
        }
        try {
            await apiRequest(baseUrl, token, "/api/incident/violations", {
                method: "POST",
                body: JSON.stringify({
                    employeeId,
                    type: violationType,
                    description,
                }),
            });
            setStatusMessage("Нарушение зарегистрировано.");
            setDescription("");
        } catch {
            setError("Не удалось зарегистрировать нарушение.");
        }
    };

    return (
        <PageShell
            title="Фиксация нарушений дисциплины"
            subtitle="Здесь вы можете зарегистрировать дисциплинарные нарушения сотрудников."
            className="theme-green"
        >
            <section className="form-section">
                <div className="form-card">
                    <h3>Регистрация нарушения</h3>
                    <form onSubmit={handleSubmit}>
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
                            Тип нарушения
                            <select value={violationType} onChange={(event) => setViolationType(event.target.value)}>
                                <option value="LATE">Опоздание</option>
                                <option value="OUT_OF_ZONE">Нахождение вне зоны</option>
                                <option value="CONFLICT">Конфликт</option>
                                <option value="OTHER">Другое</option>
                            </select>
                        </label>
                        <label>
                            Прикрепить доказательства (видеозапись, жалоба и т.д.)
                            <input type="file" />
                        </label>
                        <label>
                            Комментарий (по желанию)
                            <textarea
                                rows={4}
                                value={description}
                                onChange={(event) => setDescription(event.target.value)}
                                placeholder="Описание ситуации..."
                            />
                        </label>
                        <button type="submit">Зарегистрировать нарушение</button>
                    </form>
                    {statusMessage ? <div className="form-success">{statusMessage}</div> : null}
                    {error ? <div className="form-error">{error}</div> : null}
                </div>
            </section>
        </PageShell>
    );
};

export default DisciplinaryViolationsPage;
