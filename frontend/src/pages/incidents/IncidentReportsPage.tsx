import {useState} from "react";
import type {FormEvent} from "react";
import PageShell from "../../components/PageShell";
import {apiRequest} from "../../api/client";
import {useAuth} from "../../auth/AuthContext";
import type {ReportResponse} from "../../types";
const IncidentReportsPage = () => {
    const {token, baseUrl} = useAuth();
    const [period, setPeriod] = useState("week");
    const [incidentType, setIncidentType] = useState("ALL");
    const [report, setReport] = useState<ReportResponse | null>(null);
    const [reports, setReports] = useState<ReportResponse[]>([]);
    const [reportIdLookup, setReportIdLookup] = useState("");
    const [reportDetails, setReportDetails] = useState<ReportResponse | null>(null);
    const [error, setError] = useState("");

    const mapPeriod = () => {
        const end = new Date();
        const start = new Date(end.getTime());
        if (period === "month") {
            start.setDate(end.getDate() - 30);
        } else if (period === "quarter") {
            start.setDate(end.getDate() - 90);
        } else {
            start.setDate(end.getDate() - 7);
        }
        return {start: start.toISOString(), end: end.toISOString()};
    };

    const mapIncidentType = () => {
        if (incidentType === "ALL") {
            return null;
        }
        if (incidentType === "SUSPICIOUS") {
            return ["CHEATING"];
        }
        if (incidentType === "STAFF") {
            return ["FIGHT"];
        }
        if (incidentType === "COMPLAINT") {
            return ["OTHER"];
        }
        return ["OTHER"];
    };

    const handleGenerate = async (event: FormEvent) => {
        event.preventDefault();
        setError("");
        try {
            const {start, end} = mapPeriod();
            const data = await apiRequest<ReportResponse>(baseUrl, token, "/api/incident/reports/incidents", {
                method: "POST",
                body: JSON.stringify({
                    periodStart: start,
                    periodEnd: end,
                    incidentTypes: mapIncidentType(),
                }),
            });
            setReport(data);
        } catch {
            setError("Не удалось сформировать отчёт.");
        }
    };

    const handleFetchAllReports = async () => {
        setError("");
        try {
            const data = await apiRequest<ReportResponse[]>(baseUrl, token, "/api/incident/reports");
            setReports(data || []);
        } catch {
            setError("Не удалось получить список отчётов.");
        }
    };

    const handleFetchReportById = async () => {
        setError("");
        if (!reportIdLookup) {
            setError("Укажите ID отчёта.");
            return;
        }
        try {
            const data = await apiRequest<ReportResponse>(
                baseUrl,
                token,
                `/api/incident/reports/${reportIdLookup}`
            );
            setReportDetails(data);
        } catch {
            setError("Не удалось получить отчёт по ID.");
        }
    };

    return (
        <PageShell
            title="Формирование отчётов по инцидентам"
            subtitle="Выберите параметры для генерации аналитического отчёта."
            className="theme-blue"
        >
            <section>
                <div className="card">
                    <form onSubmit={handleGenerate} className="stacked-form">
                        <label>
                            Период отчёта:
                            <select value={period} onChange={(event) => setPeriod(event.target.value)}>
                                <option value="week">Последняя неделя</option>
                                <option value="month">Последний месяц</option>
                                <option value="quarter">Последний квартал</option>
                            </select>
                        </label>
                        <label>
                            Тип инцидентов:
                            <select value={incidentType} onChange={(event) => setIncidentType(event.target.value)}>
                                <option value="ALL">Все</option>
                                <option value="SUSPICIOUS">Подозрительная активность</option>
                                <option value="STAFF">Нарушения сотрудниками</option>
                                <option value="COMPLAINT">Жалобы клиентов</option>
                            </select>
                        </label>
                        <button type="submit" className="primary-button">Сформировать отчёт</button>
                    </form>
                </div>

                <div className="report-preview">
                    <h3>Предпросмотр отчёта:</h3>
                    {report ? (
                        <div className="report-card">
                            <p><strong>ID отчёта:</strong> {report.id}</p>
                            <p><strong>Тип:</strong> {report.type}</p>
                            <p><strong>Статус:</strong> {report.status}</p>
                            <p>{report.reportData || "Отчёт готов и доступен для экспорта."}</p>
                        </div>
                    ) : (
                        <p>Отчёт будет отображён здесь после генерации.</p>
                    )}
                    {error ? <div className="form-error">{error}</div> : null}
                </div>

                <div className="card">
                    <h3>Список отчётов</h3>
                    <div className="inline-actions">
                        <button type="button" className="secondary-button" onClick={handleFetchAllReports}>
                            Получить все отчёты
                        </button>
                    </div>
                    <label>
                        Найти по ID
                        <input
                            value={reportIdLookup}
                            onChange={(event) => setReportIdLookup(event.target.value)}
                            placeholder="UUID отчёта"
                        />
                    </label>
                    <button type="button" className="secondary-button" onClick={handleFetchReportById}>
                        Найти отчёт
                    </button>
                    {reportDetails ? (
                        <div className="report-output">
                            <p><strong>ID:</strong> {reportDetails.id}</p>
                            <p><strong>Тип:</strong> {reportDetails.type}</p>
                            <p><strong>Статус:</strong> {reportDetails.status}</p>
                        </div>
                    ) : null}
                </div>

                {reports.length ? (
                    <div className="card-list">
                        {reports.map((item) => (
                            <div key={item.id} className="card">
                                <h4>Отчёт #{item.id.slice(0, 8)}</h4>
                                <p>Тип: {item.type}</p>
                                <p className="muted">Статус: {item.status}</p>
                            </div>
                        ))}
                    </div>
                ) : null}
            </section>
        </PageShell>
    );
};

export default IncidentReportsPage;
