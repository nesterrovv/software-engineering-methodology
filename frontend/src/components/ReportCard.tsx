import type {ReportResponse} from "../types";

type ReportCardProps = {
    report: ReportResponse;
    title?: string;
    showId?: boolean;
};

const formatLabel = (value: string) => {
    const withSpaces = value
        .replace(/_/g, " ")
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .trim();
    return withSpaces ? withSpaces[0].toUpperCase() + withSpaces.slice(1) : value;
};

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

const parseReportData = (value?: string | null) => {
    if (!value) {
        return null;
    }
    try {
        return JSON.parse(value) as unknown;
    } catch {
        return null;
    }
};

const formatValue = (value: unknown) => {
    if (value === null || value === undefined || value === "") {
        return "—";
    }
    if (typeof value === "string") {
        return value;
    }
    if (typeof value === "number" || typeof value === "boolean") {
        return String(value);
    }
    return JSON.stringify(value, null, 2);
};

const renderReportData = (reportData?: string | null) => {
    if (!reportData) {
        return <p className="muted">Данные отчёта отсутствуют.</p>;
    }
    const parsed = parseReportData(reportData);
    if (!parsed) {
        return <pre>{reportData}</pre>;
    }
    if (Array.isArray(parsed)) {
        return (
            <ul className="plain-list">
                {parsed.map((item, index) => (
                    <li key={String(index)}>{formatValue(item)}</li>
                ))}
            </ul>
        );
    }
    if (typeof parsed === "object") {
        return (
            <>
                {Object.entries(parsed).map(([key, value]) => (
                    <div key={key} className="data-row">
                        <span>{formatLabel(key)}</span>
                        <span className="value">{formatValue(value)}</span>
                    </div>
                ))}
            </>
        );
    }
    return <p>{String(parsed)}</p>;
};

const ReportCard = ({report, title, showId = true}: ReportCardProps) => {
    const periodLabel = report.periodStart || report.periodEnd
        ? `${formatDateTime(report.periodStart)} — ${formatDateTime(report.periodEnd)}`
        : "—";

    return (
        <div className="report-card">
            {title ? <h4>{title}</h4> : null}
            {showId ? (
                <div className="data-row">
                    <span>ID отчёта</span>
                    <span className="value">{report.id}</span>
                </div>
            ) : null}
            <div className="data-row">
                <span>Тип</span>
                <span className="value">{report.type}</span>
            </div>
            <div className="data-row">
                <span>Статус</span>
                <span className="value">{report.status ?? "—"}</span>
            </div>
            <div className="data-row">
                <span>Период</span>
                <span className="value">{periodLabel}</span>
            </div>
            <div className="data-row">
                <span>Сформирован</span>
                <span className="value">{formatDateTime(report.generatedAt)}</span>
            </div>
            <div className="report-output">
                <h5>Данные отчёта</h5>
                {renderReportData(report.reportData)}
            </div>
        </div>
    );
};

export default ReportCard;
