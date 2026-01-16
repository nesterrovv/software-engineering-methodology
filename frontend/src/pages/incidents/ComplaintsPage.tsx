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
                        </tr>
                    ))}
                    {complaints.length === 0 ? (
                        <tr>
                            <td colSpan={5}>Жалобы не найдены.</td>
                        </tr>
                    ) : null}
                    </tbody>
                </table>
            </section>
        </PageShell>
    );
};

export default ComplaintsPage;
