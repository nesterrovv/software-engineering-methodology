import {useEffect, useState} from "react";
import type {FormEvent} from "react";
import PageShell from "../../components/PageShell";
import {apiRequest} from "../../api/client";
import {useAuth} from "../../auth/AuthContext";
import type {CashOperation} from "../../types";
type GameAnalysis = {
    id: string;
    totalWins?: string | number;
    totalBets?: string | number;
    rtp?: string | number;
    expectedRtp?: string | number;
    status?: string | null;
};

const GameAnalysisPage = () => {
    const {token, baseUrl} = useAuth();
    const [periodStart, setPeriodStart] = useState("");
    const [periodEnd, setPeriodEnd] = useState("");
    const [gameTableId, setGameTableId] = useState("");
    const [expectedRtp, setExpectedRtp] = useState("95");
    const [largeWin, setLargeWin] = useState("1000");
    const [analysis, setAnalysis] = useState<GameAnalysis | null>(null);
    const [operations, setOperations] = useState<CashOperation[]>([]);

    useEffect(() => {
        const loadOps = async () => {
            try {
                const data = await apiRequest<CashOperation[]>(baseUrl, token, "/api/finance/operations");
                setOperations(data || []);
            } catch {
                setOperations([]);
            }
        };
        void loadOps();
    }, [baseUrl, token]);

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        try {
            const data = await apiRequest<GameAnalysis>(baseUrl, token, "/api/finance/game-analysis", {
                method: "POST",
                body: JSON.stringify({
                    periodStart: periodStart ? new Date(periodStart).toISOString() : null,
                    periodEnd: periodEnd ? new Date(periodEnd).toISOString() : null,
                    gameTableId: gameTableId || null,
                    expectedRtp,
                    largeWinThreshold: largeWin,
                }),
            });
            setAnalysis(data);
        } catch {
            setAnalysis(null);
        }
    };

    const totalWins = Number(analysis?.totalWins ?? 0);
    const totalBets = Number(analysis?.totalBets ?? 0);
    const net = totalWins - totalBets;

    return (
        <PageShell
            title="Анализ выигрышей и проигрышей"
            subtitle="Детальный финансовый отчёт по результатам игровых сессий."
            className="theme-green"
        >
            <section>
                <div className="card">
                    <form onSubmit={handleSubmit} className="stacked-form">
                        <label>
                            Начало периода
                            <input type="datetime-local" value={periodStart} onChange={(event) => setPeriodStart(event.target.value)} />
                        </label>
                        <label>
                            Конец периода
                            <input type="datetime-local" value={periodEnd} onChange={(event) => setPeriodEnd(event.target.value)} />
                        </label>
                        <label>
                            Стол/автомат
                            <input value={gameTableId} onChange={(event) => setGameTableId(event.target.value)} placeholder="ID стола" />
                        </label>
                        <label>
                            Ожидаемый RTP
                            <input type="number" value={expectedRtp} onChange={(event) => setExpectedRtp(event.target.value)} />
                        </label>
                        <label>
                            Порог крупного выигрыша
                            <input type="number" value={largeWin} onChange={(event) => setLargeWin(event.target.value)} />
                        </label>
                        <button type="submit" className="primary-button">Запустить анализ</button>
                    </form>
                </div>
            </section>

            <section>
                <h2>Общая статистика</h2>
                <div className="card">
                    <div className="data-row">
                        <span>Общий выигрыш:</span>
                        <span className="value profit">+{totalWins.toLocaleString("ru-RU")}</span>
                    </div>
                    <div className="data-row">
                        <span>Общий проигрыш:</span>
                        <span className="value loss">-{totalBets.toLocaleString("ru-RU")}</span>
                    </div>
                    <div className="data-row">
                        <span>Чистая прибыль:</span>
                        <span className="value">{net.toLocaleString("ru-RU")}</span>
                    </div>
                </div>
            </section>

            <section>
                <h2>Последние транзакции</h2>
                <div className="card">
                    <table>
                        <thead>
                        <tr>
                            <th>Дата</th>
                            <th>Игрок</th>
                            <th>Сумма</th>
                            <th>Тип</th>
                        </tr>
                        </thead>
                        <tbody>
                        {operations.slice(0, 3).map((operation) => (
                            <tr key={operation.id}>
                                <td>{operation.operatedAt ? new Date(operation.operatedAt).toLocaleDateString("ru-RU") : "—"}</td>
                                <td>Игрок #{operation.cashDeskId?.slice(0, 4)}</td>
                                <td className={operation.type === "DEPOSIT" ? "profit" : "loss"}>
                                    {operation.type === "DEPOSIT" ? "+" : "-"}{operation.amount}
                                </td>
                                <td>{operation.type === "DEPOSIT" ? "Выигрыш" : "Проигрыш"}</td>
                            </tr>
                        ))}
                        {operations.length === 0 ? (
                            <tr>
                                <td colSpan={4}>Нет данных для отображения.</td>
                            </tr>
                        ) : null}
                        </tbody>
                    </table>
                </div>
            </section>
        </PageShell>
    );
};

export default GameAnalysisPage;
