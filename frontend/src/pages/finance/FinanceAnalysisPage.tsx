import {useState} from "react";
import type {FormEvent} from "react";
import {NavLink} from "react-router-dom";
import PageShell from "../../components/PageShell";
import {apiRequest} from "../../api/client";
import {useAuth} from "../../auth/AuthContext";
import type {FinancialReport} from "../../types";
const FinanceAnalysisPage = () => {
    const {token, baseUrl} = useAuth();
    const [reportType, setReportType] = useState("transactions");
    const [period, setPeriod] = useState("daily");
    const [source, setSource] = useState("income");
    const [report, setReport] = useState<FinancialReport | null>(null);
    const [statusMessage, setStatusMessage] = useState("");
    const [error, setError] = useState("");

    const resolvePeriod = () => {
        const end = new Date();
        const start = new Date(end.getTime());
        if (period === "monthly") {
            start.setDate(end.getDate() - 30);
        } else if (period === "quarterly") {
            start.setDate(end.getDate() - 90);
        } else if (period === "yearly") {
            start.setDate(end.getDate() - 365);
        } else {
            start.setDate(end.getDate() - 1);
        }
        const format = (value: Date) => value.toISOString().slice(0, 10);
        return {start: format(start), end: format(end)};
    };

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setError("");
        setStatusMessage("");
        try {
            const {start, end} = resolvePeriod();
            const data = await apiRequest<FinancialReport>(baseUrl, token, "/api/finance/reports", {
                method: "POST",
                body: JSON.stringify({
                    periodStart: start,
                    periodEnd: end,
                }),
            });
            setReport(data);
            setStatusMessage("Отчёт сформирован.");
        } catch {
            setError("Не удалось сформировать отчёт.");
        }
    };

    return (
        <PageShell
            title="Анализ финансовых отчётов"
            subtitle="Процесс анализа финансовых данных, формирования отчётов и их экспорт."
            className="theme-bright-green"
        >
            <section className="financial-reports">
                <h2>Анализ отчетности</h2>
                <div className="card">
                    <h3>Фильтры для отчётов</h3>
                    <form onSubmit={handleSubmit} className="stacked-form">
                        <label>
                            Выберите тип отчёта:
                            <select value={reportType} onChange={(event) => setReportType(event.target.value)}>
                                <option value="transactions">Транзакции</option>
                                <option value="cash">Касса</option>
                                <option value="profit-loss">Прибыль и убытки</option>
                                <option value="assets">Активы</option>
                            </select>
                        </label>
                        <label>
                            Период отчёта:
                            <select value={period} onChange={(event) => setPeriod(event.target.value)}>
                                <option value="daily">Ежедневный</option>
                                <option value="monthly">Ежемесячный</option>
                                <option value="quarterly">Ежеквартальный</option>
                                <option value="yearly">Ежегодный</option>
                            </select>
                        </label>
                        <label>
                            Источник финансов:
                            <select value={source} onChange={(event) => setSource(event.target.value)}>
                                <option value="income">Доход</option>
                                <option value="expense">Расход</option>
                                <option value="investment">Инвестиции</option>
                            </select>
                        </label>
                        <button type="submit" className="primary-button">Сгенерировать отчёт</button>
                    </form>
                </div>

                <div className="card">
                    <h3>Результаты анализа</h3>
                    <p>После генерации отчёта система предоставит подробный анализ финансовых данных.</p>
                    {report ? (
                        <p className="muted">CSV ссылка: {report.csvUrl ?? "—"}</p>
                    ) : null}
                    <NavLink className="button" to="/reports/export">Экспорт в PDF</NavLink>
                    <NavLink className="button" to="/reports/export">Экспорт в Excel</NavLink>
                    {statusMessage ? <div className="form-success">{statusMessage}</div> : null}
                    {error ? <div className="form-error">{error}</div> : null}
                </div>
            </section>
        </PageShell>
    );
};

export default FinanceAnalysisPage;
