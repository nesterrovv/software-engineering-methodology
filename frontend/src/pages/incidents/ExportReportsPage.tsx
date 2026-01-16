import {useMemo, useState} from "react";
import PageShell from "../../components/PageShell";
import {buildApiUrl} from "../../api/client";
import {useAuth} from "../../auth/AuthContext";

const ExportReportsPage = () => {
    const {baseUrl} = useAuth();
    const [reportId, setReportId] = useState("");

    const pdfUrl = useMemo(() => {
        if (!reportId) {
            return "";
        }
        return buildApiUrl(baseUrl, `/api/incident/reports/${reportId}/export/pdf`);
    }, [baseUrl, reportId]);

    const excelUrl = useMemo(() => {
        if (!reportId) {
            return "";
        }
        return buildApiUrl(baseUrl, `/api/incident/reports/${reportId}/export/excel`);
    }, [baseUrl, reportId]);

    return (
        <PageShell
            title="Экспорт в PDF / Excel"
            subtitle="Выберите формат для экспорта данных."
            className="theme-green"
        >
            <section>
                <div className="card">
                    <h3>ID отчёта</h3>
                    <label>
                        Укажите ID отчёта
                        <input
                            value={reportId}
                            onChange={(event) => setReportId(event.target.value)}
                            placeholder="UUID отчёта"
                        />
                    </label>
                </div>
            </section>

            <section>
                <h2>Доступные экспорты</h2>
                <div className="card">
                    <h3>Отчёт по инцидентам</h3>
                    <p className="data">Экспортировать инциденты за выбранный период</p>
                    <a className={`button ${reportId ? "" : "disabled"}`} href={pdfUrl}>
                        Экспорт в PDF
                    </a>
                    <a className={`button ${reportId ? "" : "disabled"}`} href={excelUrl}>
                        Экспорт в Excel
                    </a>
                </div>
            </section>
        </PageShell>
    );
};

export default ExportReportsPage;
