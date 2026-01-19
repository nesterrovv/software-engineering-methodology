import {useEffect, useMemo, useState} from "react";
import PageShell from "../../components/PageShell";
import {apiRequest} from "../../api/client";
import {useAuth} from "../../auth/AuthContext";
import ReportCard from "../../components/ReportCard";
import type {ReportResponse} from "../../types";

const formatDateTime = (value?: string | null) => {
    if (!value) {
        return "—";
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return "—";
    }
    return date.toLocaleString("ru-RU");
};

const AllReportsPage = () => {
    const {token, baseUrl} = useAuth();
    const [reports, setReports] = useState<ReportResponse[]>([]);
    const [expandedReportId, setExpandedReportId] = useState<string | null>(null);
    const [, setError] = useState("");

    const handleFetchAllReports = async () => {
        setError("");
        try {
            const data = await apiRequest<ReportResponse[]>(baseUrl, token, "/api/incident/reports");
            setReports(data || []);
        } catch {
            setError("Не удалось получить список отчётов.");
        }
    };

    useEffect(() => {
        void handleFetchAllReports();
    }, [baseUrl, token]);

    const reportsPreview = useMemo(() => reports, [reports]);

    return (
        <PageShell
            title="Все отчёты"
            subtitle="Сводный список сформированных отчётов по всем направлениям."
            className="theme-blue"
        >
            {/*<section className="page-section">*/}
            {/*    <div className="card">*/}
            {/*        <h3>Список отчётов</h3>*/}
            {/*        <div className="inline-actions">*/}
            {/*            <button type="button" className="secondary-button" onClick={handleFetchAllReports}>*/}
            {/*                Обновить список*/}
            {/*            </button>*/}
            {/*        </div>*/}
            {/*        {error ? <div className="form-error">{error}</div> : null}*/}
            {/*    </div>*/}
            {/*</section>*/}

            {reportsPreview.length ? (
                <div className="card-list">
                    {reportsPreview.map((item, index) => (
                        <div key={item.id} className="card">
                            <h4>Отчёт #{index + 1}</h4>
                            <p>Тип: {item.type}</p>
                            <p className="muted">
                                Статус: {item.status ?? "—"} · Сформирован: {formatDateTime(item.generatedAt)}
                            </p>
                            <button
                                type="button"
                                className="secondary-button"
                                onClick={() => setExpandedReportId((prev) => (prev === item.id ? null : item.id))}
                            >
                                {expandedReportId === item.id ? "Скрыть" : "Открыть"}
                            </button>
                            {expandedReportId === item.id ? (
                                <div className="report-preview">
                                    <ReportCard title="Детали отчёта" report={item} showId={false} />
                                </div>
                            ) : null}
                        </div>
                    ))}
                </div>
            ) : (
                <p className="muted">Отчёты не найдены.</p>
            )}
        </PageShell>
    );
};

export default AllReportsPage;
