import {useEffect, useState} from "react";
import PageShell from "../../components/PageShell";
import {apiRequest} from "../../api/client";
import {useAuth} from "../../auth/AuthContext";
import type {HallStatus, Incident} from "../../types";
const statusToClass = (status?: string | null) => {
    if (!status) {
        return "warning";
    }
    if (status === "RESOLVED" || status === "CLOSED") {
        return "resolved";
    }
    if (status === "UNDER_INVESTIGATION") {
        return "warning";
    }
    return "unresolved";
};

const statusLabel = (status?: string | null) => {
    if (status === "RESOLVED") {
        return "Решено";
    }
    if (status === "CLOSED") {
        return "Закрыто";
    }
    if (status === "UNDER_INVESTIGATION") {
        return "Ожидает проверки";
    }
    return "Не решено";
};

const HallMonitoringPage = () => {
    const {token, baseUrl} = useAuth();
    const [status, setStatus] = useState<HallStatus | null>(null);
    const [incidents, setIncidents] = useState<Incident[]>([]);

    useEffect(() => {
        const load = async () => {
            try {
                const hall = await apiRequest<HallStatus>(baseUrl, token, "/api/security/monitoring/status");
                setStatus(hall);
            } catch {
                setStatus(null);
            }
            try {
                const list = await apiRequest<Incident[]>(baseUrl, token, "/api/incident/incidents");
                setIncidents(list || []);
            } catch {
                setIncidents([]);
            }
        };
        void load();
    }, [baseUrl, token]);

    return (
        <PageShell
            title="Мониторинг зала"
            subtitle="Просмотр текущего состояния зала, мониторинг активности и безопасности."
            className="theme-green"
        >
            <section className="overview">
                <h2>Обзор состояния зала</h2>
                <div className="card-grid">
                    <div className="card">
                        <h3>Количество игроков:</h3>
                        <p className="data">{status?.totalVisitors ?? 0}</p>
                    </div>
                    <div className="card">
                        <h3>Подозрительная активность:</h3>
                        <p className="data">{status?.anomaliesCount ?? 0} инцидентов</p>
                    </div>
                    <div className="card">
                        <h3>Активные столы:</h3>
                        <p className="data">{status?.activeTables ?? 0}</p>
                    </div>
                </div>
            </section>

            <section className="incident-list">
                <h2>Недавние инциденты</h2>
                <table>
                    <thead>
                    <tr>
                        <th>Дата и время</th>
                        <th>Тип инцидента</th>
                        <th>Статус</th>
                    </tr>
                    </thead>
                    <tbody>
                    {incidents.slice(0, 5).map((incident) => (
                        <tr key={incident.id}>
                            <td>{incident.occurredAt ? new Date(incident.occurredAt).toLocaleString("ru-RU") : "—"}</td>
                            <td>{incident.type}</td>
                            <td>
                                <span className={`status ${statusToClass(incident.status)}`}>
                                    {statusLabel(incident.status)}
                                </span>
                            </td>
                        </tr>
                    ))}
                    {incidents.length === 0 ? (
                        <tr>
                            <td colSpan={3}>Инциденты не найдены.</td>
                        </tr>
                    ) : null}
                    </tbody>
                </table>
            </section>
        </PageShell>
    );
};

export default HallMonitoringPage;
