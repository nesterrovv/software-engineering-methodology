import {useEffect, useMemo, useState} from "react";
import type {FormEvent} from "react";
import PageShell from "../../components/PageShell";
import {apiRequest} from "../../api/client";
import {useAuth} from "../../auth/AuthContext";
import {useEmployees} from "../../hooks/useEmployees";
import type {Complaint, Incident, Violation} from "../../types";
const IncidentsPage = () => {
    const {token, baseUrl} = useAuth();
    const {employees, refresh: refreshEmployees} = useEmployees();

    const [incidentType, setIncidentType] = useState("THEFT");
    const [incidentLocation, setIncidentLocation] = useState("");
    const [incidentDescription, setIncidentDescription] = useState("");
    const [incidents, setIncidents] = useState<Incident[]>([]);

    const [complaintCategory, setComplaintCategory] = useState("SERVICE_QUALITY");
    const [complaintSource, setComplaintSource] = useState("VISITOR");
    const [complaintDescription, setComplaintDescription] = useState("");
    const [complaints, setComplaints] = useState<Complaint[]>([]);

    const [violationEmployeeId, setViolationEmployeeId] = useState("");
    const [violationType, setViolationType] = useState("LATE");
    const [violationDescription, setViolationDescription] = useState("");
    const [violations, setViolations] = useState<Violation[]>([]);

    const [error, setError] = useState("");
    const [statusMessage, setStatusMessage] = useState("");

    useEffect(() => {
        if (!employees.length || violationEmployeeId) {
            return;
        }
        setViolationEmployeeId(employees[0].id);
    }, [employees, violationEmployeeId]);

    const employeeOptions = useMemo(() => employees.map((employee) => ({
        value: employee.id,
        label: [employee.lastName, employee.firstName, employee.middleName].filter(Boolean).join(" ").trim(),
    })), [employees]);

    const handleCreateIncident = async (event: FormEvent) => {
        event.preventDefault();
        setError("");
        setStatusMessage("");
        if (!incidentDescription) {
            setError("Добавьте описание инцидента.");
            return;
        }
        try {
            await apiRequest<Incident>(baseUrl, token, "/api/incident/incidents", {
                method: "POST",
                body: JSON.stringify({
                    type: incidentType,
                    location: incidentLocation,
                    description: incidentDescription,
                }),
            });
            setIncidentDescription("");
            setIncidentLocation("");
            setStatusMessage("Инцидент зарегистрирован.");
        } catch {
            setError("Не удалось создать инцидент.");
        }
    };

    const handleFetchIncidents = async () => {
        setError("");
        setStatusMessage("");
        try {
            const data = await apiRequest<Incident[]>(baseUrl, token, "/api/incident/incidents");
            setIncidents(data || []);
        } catch {
            setError("Не удалось получить список инцидентов.");
        }
    };

    const handleCreateComplaint = async (event: FormEvent) => {
        event.preventDefault();
        setError("");
        setStatusMessage("");
        if (!complaintDescription) {
            setError("Добавьте описание жалобы.");
            return;
        }
        try {
            await apiRequest<Complaint>(baseUrl, token, "/api/incident/complaints", {
                method: "POST",
                body: JSON.stringify({
                    category: complaintCategory,
                    description: complaintDescription,
                    source: complaintSource,
                }),
            });
            setComplaintDescription("");
            setStatusMessage("Жалоба зарегистрирована.");
        } catch {
            setError("Не удалось создать жалобу.");
        }
    };

    const handleFetchComplaints = async () => {
        setError("");
        setStatusMessage("");
        try {
            const data = await apiRequest<Complaint[]>(baseUrl, token, "/api/incident/complaints");
            setComplaints(data || []);
        } catch {
            setError("Не удалось получить список жалоб.");
        }
    };

    const handleCreateViolation = async (event: FormEvent) => {
        event.preventDefault();
        setError("");
        setStatusMessage("");
        if (!violationEmployeeId) {
            setError("Выберите сотрудника.");
            return;
        }
        try {
            await apiRequest<Violation>(baseUrl, token, "/api/incident/violations", {
                method: "POST",
                body: JSON.stringify({
                    employeeId: violationEmployeeId,
                    type: violationType,
                    description: violationDescription,
                }),
            });
            setViolationDescription("");
            setStatusMessage("Нарушение зарегистрировано.");
        } catch {
            setError("Не удалось создать нарушение.");
        }
    };

    const handleFetchViolations = async () => {
        setError("");
        setStatusMessage("");
        try {
            const data = await apiRequest<Violation[]>(baseUrl, token, "/api/incident/violations");
            setViolations(data || []);
        } catch {
            setError("Не удалось получить список нарушений.");
        }
    };

    return (
        <PageShell
            title="Инциденты и дисциплина"
            subtitle="Регистрация инцидентов, жалоб и нарушений сотрудников."
            className="theme-green"
        >
            <section className="panel">
                <div className="panel__title">Инциденты</div>
                <div className="panel__section">
                    <h3>Регистрация инцидента</h3>
                    <form onSubmit={handleCreateIncident} className="panel__form">
                        <label>
                            Тип инцидента
                            <select value={incidentType} onChange={(event) => setIncidentType(event.target.value)}>
                                <option value="THEFT">Кража</option>
                                <option value="FIGHT">Драка</option>
                                <option value="DRUNKENNESS">Опьянение</option>
                                <option value="CHEATING">Жульничество</option>
                                <option value="OTHER">Другое</option>
                            </select>
                        </label>
                        <label>
                            Локация
                            <input
                                value={incidentLocation}
                                onChange={(event) => setIncidentLocation(event.target.value)}
                                placeholder="Зал, стол, зона"
                            />
                        </label>
                        <label>
                            Описание
                            <textarea
                                rows={3}
                                value={incidentDescription}
                                onChange={(event) => setIncidentDescription(event.target.value)}
                                placeholder="Описание инцидента"
                            />
                        </label>
                        <button type="submit" className="primary-button">Создать инцидент</button>
                    </form>
                </div>
                <div className="panel__section">
                    <h3>Список инцидентов</h3>
                    <button type="button" className="secondary-button" onClick={handleFetchIncidents}>
                        Получить инциденты
                    </button>
                    {incidents.length ? (
                        <div className="card-list">
                            {incidents.map((incident) => (
                                <div key={incident.id} className="incident-card">
                                    <h4>{incident.type}</h4>
                                    <p>{incident.description}</p>
                                    <p className="muted">Локация: {incident.location || "—"}</p>
                                </div>
                            ))}
                        </div>
                    ) : null}
                </div>
            </section>

            <section className="panel">
                <div className="panel__title">Жалобы</div>
                <div className="panel__section">
                    <h3>Регистрация жалобы</h3>
                    <form onSubmit={handleCreateComplaint} className="panel__form">
                        <label>
                            Категория
                            <select value={complaintCategory} onChange={(event) => setComplaintCategory(event.target.value)}>
                                <option value="SERVICE_QUALITY">Качество сервиса</option>
                                <option value="STAFF_BEHAVIOR">Поведение персонала</option>
                                <option value="GAME_ISSUES">Игровые процессы</option>
                                <option value="SAFETY">Безопасность</option>
                                <option value="OTHER">Другое</option>
                            </select>
                        </label>
                        <label>
                            Источник
                            <select value={complaintSource} onChange={(event) => setComplaintSource(event.target.value)}>
                                <option value="VISITOR">Посетитель</option>
                                <option value="EMPLOYEE">Сотрудник</option>
                                <option value="SYSTEM">Система</option>
                                <option value="TERMINAL">Терминал</option>
                            </select>
                        </label>
                        <label>
                            Описание
                            <textarea
                                rows={3}
                                value={complaintDescription}
                                onChange={(event) => setComplaintDescription(event.target.value)}
                                placeholder="Описание жалобы"
                            />
                        </label>
                        <button type="submit" className="primary-button">Создать жалобу</button>
                    </form>
                </div>
                <div className="panel__section">
                    <h3>Список жалоб</h3>
                    <button type="button" className="secondary-button" onClick={handleFetchComplaints}>
                        Получить жалобы
                    </button>
                    {complaints.length ? (
                        <div className="card-list">
                            {complaints.map((complaint) => (
                                <div key={complaint.id} className="complaint-card">
                                    <h4>{complaint.category}</h4>
                                    <p>{complaint.description}</p>
                                    <p className="muted">Статус: {complaint.status ?? "NEW"}</p>
                                </div>
                            ))}
                        </div>
                    ) : null}
                </div>
            </section>

            <section className="panel">
                <div className="panel__title">Нарушения</div>
                <div className="panel__section">
                    <h3>Регистрация нарушения</h3>
                    <form onSubmit={handleCreateViolation} className="panel__form">
                        <label>
                            Сотрудник
                            <select
                                value={violationEmployeeId}
                                onChange={(event) => setViolationEmployeeId(event.target.value)}
                            >
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
                                <option value="OUT_OF_ZONE">Вне зоны</option>
                                <option value="CONFLICT">Конфликт</option>
                                <option value="OTHER">Другое</option>
                            </select>
                        </label>
                        <label>
                            Описание
                            <textarea
                                rows={3}
                                value={violationDescription}
                                onChange={(event) => setViolationDescription(event.target.value)}
                                placeholder="Описание нарушения"
                            />
                        </label>
                        <button type="submit" className="primary-button">Создать нарушение</button>
                    </form>
                </div>
                <div className="panel__section">
                    <h3>Список нарушений</h3>
                    <button type="button" className="secondary-button" onClick={handleFetchViolations}>
                        Получить нарушения
                    </button>
                    {violations.length ? (
                        <div className="card-list">
                            {violations.map((violation) => (
                                <div key={violation.id} className="violation-card">
                                    <h4>{violation.type}</h4>
                                    <p>{violation.description}</p>
                                    <p className="muted">Сотрудник: {violation.employeeId}</p>
                                </div>
                            ))}
                        </div>
                    ) : null}
                </div>
                <div className="panel__section">
                    <button type="button" className="secondary-button" onClick={refreshEmployees}>
                        Обновить список сотрудников
                    </button>
                </div>
            </section>

            {error ? <div className="form-error">{error}</div> : null}
            {statusMessage ? <div className="form-success">{statusMessage}</div> : null}
        </PageShell>
    );
};

export default IncidentsPage;
