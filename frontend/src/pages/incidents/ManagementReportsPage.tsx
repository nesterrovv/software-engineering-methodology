import {useState} from "react";
import type {FormEvent} from "react";
import PageShell from "../../components/PageShell";
import {apiRequest, buildApiUrl} from "../../api/client";
import {useAuth} from "../../auth/AuthContext";
import type {ReportResponse} from "../../types";
const ManagementReportsPage = () => {
    const {token, baseUrl} = useAuth();
    const [start, setStart] = useState("");
    const [end, setEnd] = useState("");
    const [reports, setReports] = useState<ReportResponse[]>([]);
    const [error, setError] = useState("");

    const handleGenerate = async (event: FormEvent) => {
        event.preventDefault();
        setError("");
        try {
            const data = await apiRequest<ReportResponse>(baseUrl, token, "/api/incident/reports/management", {
                method: "POST",
                body: JSON.stringify({
                    periodStart: start ? new Date(start).toISOString() : null,
                    periodEnd: end ? new Date(end).toISOString() : null,
                }),
            });
            setReports((prev) => [data, ...prev]);
        } catch {
            setError("Не удалось создать отчёт для руководства.");
        }
    };

    return (
        <PageShell
            title="Генерация отчётов для руководства"
            subtitle="Создание и экспорт отчётов для анализа и принятия решений."
            className="theme-green"
        >
            <section>
                <div className="card">
                    <h3>Параметры отчёта</h3>
                    <form onSubmit={handleGenerate} className="stacked-form">
                        <label>
                            Начало периода:
                            <input type="datetime-local" value={start} onChange={(event) => setStart(event.target.value)} />
                        </label>
                        <label>
                            Конец периода:
                            <input type="datetime-local" value={end} onChange={(event) => setEnd(event.target.value)} />
                        </label>
                        <button type="submit" className="primary-button">Сформировать отчёт</button>
                    </form>
                    {error ? <div className="form-error">{error}</div> : null}
                </div>
            </section>

            <section>
                <h2>Доступные отчёты</h2>
                <div className="card-grid">
                    {reports.map((report) => (
                        <div key={report.id} className="card">
                            <h3>Отчёт #{report.id.slice(0, 8)}</h3>
                            <p className="data">Статус: {report.status ?? "Готов"}</p>
                            <a
                                className="button"
                                href={buildApiUrl(baseUrl, `/api/incident/reports/${report.id}/export/pdf`)}
                            >
                                Скачать PDF
                            </a>
                        </div>
                    ))}
                    {reports.length === 0 ? (
                        <div className="card">
                            <h3>Отчёт по инцидентам безопасности</h3>
                            <p className="data">Сформируйте отчёт, чтобы скачать PDF.</p>
                            <button className="button" type="button" disabled>
                                Скачать PDF
                            </button>
                        </div>
                    ) : null}
                </div>
            </section>
        </PageShell>
    );
};

export default ManagementReportsPage;
