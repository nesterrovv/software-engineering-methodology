import {useEffect, useState} from "react";
import PageShell from "../../components/PageShell";
import {apiRequest} from "../../api/client";
import {useAuth} from "../../auth/AuthContext";
import type {Complaint} from "../../types";
const statusClass = (status?: string | null) => {
    if (!status) {
        return "new";
    }
    if (status === "IN_PROGRESS") {
        return "in_progress";
    }
    if (status === "RESOLVED" || status === "CLOSED") {
        return "closed";
    }
    return "new";
};

const ComplaintsPage = () => {
    const {token, baseUrl} = useAuth();
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [statusUpdates, setStatusUpdates] = useState<Record<string, string>>({});
    const [message, setMessage] = useState("");

    useEffect(() => {
        const load = async () => {
            try {
                const data = await apiRequest<Complaint[]>(baseUrl, token, "/api/incident/complaints");
                setComplaints(data || []);
            } catch {
                setComplaints([]);
            }
        };
        void load();
    }, [baseUrl, token]);

    const handleStatusChange = async (complaintId: string, status: string) => {
        setMessage("");
        try {
            const updated = await apiRequest<Complaint>(
                baseUrl,
                token,
                `/api/incident/complaints/${complaintId}/status?status=${status}`,
                {method: "PATCH"}
            );
            setComplaints((prev) => prev.map((item) => (item.id === complaintId ? updated : item)));
            setStatusUpdates((prev) => ({...prev, [complaintId]: status}));
            setMessage("Статус жалобы обновлён.");
        } catch {
            setMessage("Не удалось обновить статус.");
        }
    };

    return (
        <PageShell
            title="Централизованная база жалоб"
            subtitle="Управление, отслеживание и анализ поступивших жалоб от клиентов и сотрудников."
            className="theme-green"
        >
            <section>
                <h2>Список жалоб</h2>
                <table>
                    <thead>
                    <tr>
                        <th>Дата</th>
                        <th>Источник</th>
                        <th>Категория</th>
                        <th>Описание</th>
                        <th>Статус</th>
                        <th>Обновить</th>
                    </tr>
                    </thead>
                    <tbody>
                    {complaints.map((complaint) => (
                        <tr key={complaint.id}>
                            <td>{complaint.reportedAt ? new Date(complaint.reportedAt).toLocaleDateString("ru-RU") : "—"}</td>
                            <td>{complaint.source ?? "—"}</td>
                            <td>{complaint.category ?? "—"}</td>
                            <td>{complaint.description ?? ""}</td>
                            <td>
                                <span className={`status ${statusClass(complaint.status)}`}>{complaint.status ?? "OPEN"}</span>
                            </td>
                            <td>
                                <div className="inline-actions">
                                    <select
                                        value={statusUpdates[complaint.id] ?? complaint.status ?? "OPEN"}
                                        onChange={(event) => {
                                            const value = event.target.value;
                                            setStatusUpdates((prev) => ({...prev, [complaint.id]: value}));
                                        }}
                                    >
                                        <option value="OPEN">OPEN</option>
                                        <option value="IN_PROGRESS">IN_PROGRESS</option>
                                        <option value="RESOLVED">RESOLVED</option>
                                        <option value="CLOSED">CLOSED</option>
                                    </select>
                                    <button
                                        className="secondary-button"
                                        type="button"
                                        onClick={() => handleStatusChange(complaint.id, statusUpdates[complaint.id] ?? complaint.status ?? "OPEN")}
                                    >
                                        Сохранить
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    {complaints.length === 0 ? (
                        <tr>
                            <td colSpan={6}>Жалобы не найдены.</td>
                        </tr>
                    ) : null}
                    </tbody>
                </table>
                {message ? <div className="form-success">{message}</div> : null}
            </section>
        </PageShell>
    );
};

export default ComplaintsPage;
