import {useState} from "react";
import type {FormEvent} from "react";
import PageShell from "../../components/PageShell";
import {apiRequest} from "../../api/client";
import {useAuth} from "../../auth/AuthContext";
import type {FraudRecord} from "../../types";

type FraudCheckResponse = {
    matchFound?: boolean;
    matches?: Array<{
        fraudRecordName?: string;
        confidence?: string;
        similarityScore?: number;
        matchDetails?: string;
    }>;
};

const FraudCheckPage = () => {
    const {token, baseUrl} = useAuth();
    const [customerName, setCustomerName] = useState("");
    const [customerId, setCustomerId] = useState("");
    const [customerDob, setCustomerDob] = useState("");
    const [checkType, setCheckType] = useState("id");
    const [activityId, setActivityId] = useState("");
    const [result, setResult] = useState<FraudCheckResponse | null>(null);
    const [error, setError] = useState("");

    const [quickPersonId, setQuickPersonId] = useState("");
    const [quickActivityId, setQuickActivityId] = useState("");
    const [quickResult, setQuickResult] = useState<FraudCheckResponse | null>(null);

    const [records, setRecords] = useState<FraudRecord[]>([]);
    const [recordPersonId, setRecordPersonId] = useState("");
    const [recordFullName, setRecordFullName] = useState("");
    const [recordDescription, setRecordDescription] = useState("");
    const [recordPhotoUrl, setRecordPhotoUrl] = useState("");
    const [recordType, setRecordType] = useState("CHEATING");
    const [recordAddedBy, setRecordAddedBy] = useState("");
    const [recordSearchQuery, setRecordSearchQuery] = useState("");
    const [recordTypeFilter, setRecordTypeFilter] = useState("CHEATING");
    const [recordIdLookup, setRecordIdLookup] = useState("");
    const [recordDetails, setRecordDetails] = useState<FraudRecord | null>(null);
    const [recordStatusUpdates, setRecordStatusUpdates] = useState<Record<string, string>>({});

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setError("");
        if (!customerId) {
            setError("Укажите ID клиента.");
            return;
        }
        try {
            const payload: Record<string, string> = {personId: customerId};
            if (activityId) {
                payload.triggeredByActivityId = activityId;
            }
            const data = await apiRequest<FraudCheckResponse>(baseUrl, token, "/api/security/fraud-check", {
                method: "POST",
                body: JSON.stringify(payload),
            });
            setResult(data);
        } catch {
            setError("Не удалось выполнить сверку.");
        }
    };

    const handleQuickCheck = async (event: FormEvent) => {
        event.preventDefault();
        setError("");
        if (!quickPersonId) {
            setError("Укажите ID клиента для быстрой проверки.");
            return;
        }
        const params = new URLSearchParams({personId: quickPersonId});
        if (quickActivityId) {
            params.append("activityId", quickActivityId);
        }
        try {
            const data = await apiRequest<FraudCheckResponse>(
                baseUrl,
                token,
                `/api/security/fraud-check/quick?${params.toString()}`,
                {method: "POST"}
            );
            setQuickResult(data);
        } catch {
            setError("Не удалось выполнить быструю проверку.");
        }
    };

    const handleCreateRecord = async (event: FormEvent) => {
        event.preventDefault();
        setError("");
        if (!recordPersonId || !recordFullName) {
            setError("Заполните идентификатор и имя.");
            return;
        }
        try {
            const created = await apiRequest<FraudRecord>(baseUrl, token, "/api/security/fraud-database", {
                method: "POST",
                body: JSON.stringify({
                    personId: recordPersonId,
                    fullName: recordFullName,
                    description: recordDescription || null,
                    photoUrl: recordPhotoUrl || null,
                    fraudType: recordType,
                    addedBy: recordAddedBy || null,
                }),
            });
            setRecords((prev) => [created, ...prev]);
            setRecordPersonId("");
            setRecordFullName("");
            setRecordDescription("");
            setRecordPhotoUrl("");
            setRecordAddedBy("");
        } catch {
            setError("Не удалось добавить запись в базу.");
        }
    };

    const handleFetchAll = async () => {
        setError("");
        try {
            const data = await apiRequest<FraudRecord[]>(baseUrl, token, "/api/security/fraud-database");
            setRecords(data || []);
        } catch {
            setError("Не удалось получить записи.");
        }
    };

    const handleSearch = async () => {
        setError("");
        if (!recordSearchQuery) {
            setError("Введите поисковый запрос.");
            return;
        }
        try {
            const data = await apiRequest<FraudRecord[]>(
                baseUrl,
                token,
                `/api/security/fraud-database/search?q=${encodeURIComponent(recordSearchQuery)}`
            );
            setRecords(data || []);
        } catch {
            setError("Не удалось выполнить поиск.");
        }
    };

    const handleFetchByType = async () => {
        setError("");
        try {
            const data = await apiRequest<FraudRecord[]>(
                baseUrl,
                token,
                `/api/security/fraud-database/type/${recordTypeFilter}`
            );
            setRecords(data || []);
        } catch {
            setError("Не удалось получить записи по типу.");
        }
    };

    const handleFetchById = async () => {
        setError("");
        if (!recordIdLookup) {
            setError("Укажите ID записи.");
            return;
        }
        try {
            const data = await apiRequest<FraudRecord>(
                baseUrl,
                token,
                `/api/security/fraud-database/${recordIdLookup}`
            );
            setRecordDetails(data);
        } catch {
            setError("Не удалось получить запись.");
        }
    };

    const handleUpdateStatus = async (id: string, status: string) => {
        setError("");
        try {
            const updated = await apiRequest<FraudRecord>(
                baseUrl,
                token,
                `/api/security/fraud-database/${id}/status?status=${status}`,
                {method: "PATCH"}
            );
            setRecords((prev) => prev.map((item) => (item.id === id ? updated : item)));
            setRecordStatusUpdates((prev) => ({...prev, [id]: status}));
        } catch {
            setError("Не удалось обновить статус записи.");
        }
    };

    const handleDelete = async (id: string) => {
        setError("");
        try {
            await apiRequest(baseUrl, token, `/api/security/fraud-database/${id}`, {method: "DELETE"});
            setRecords((prev) => prev.filter((item) => item.id !== id));
        } catch {
            setError("Не удалось удалить запись.");
        }
    };

    return (
        <PageShell
            title="Сверка с базой мошенников"
            subtitle="Форма для сверки данных с базой мошенников для предотвращения мошенничества в казино."
            className="theme-red"
        >
            <section className="fraud-check">
                <h2>Проверьте данные клиента на совпадение с базой мошенников</h2>
                <div className="card">
                    <h3>Информация о клиенте</h3>
                    <form onSubmit={handleSubmit} className="stacked-form">
                        <label>
                            Имя клиента:
                            <input
                                value={customerName}
                                onChange={(event) => setCustomerName(event.target.value)}
                                placeholder="Имя клиента"
                            />
                        </label>
                        <label>
                            ID клиента:
                            <input
                                value={customerId}
                                onChange={(event) => setCustomerId(event.target.value)}
                                placeholder="ID клиента"
                            />
                        </label>
                        <label>
                            Дата рождения клиента:
                            <input
                                type="date"
                                value={customerDob}
                                onChange={(event) => setCustomerDob(event.target.value)}
                            />
                        </label>
                        <label>
                            Выберите тип проверки:
                            <select value={checkType} onChange={(event) => setCheckType(event.target.value)}>
                                <option value="name">По имени</option>
                                <option value="id">По ID</option>
                                <option value="dob">По дате рождения</option>
                            </select>
                        </label>
                        <label>
                            ID активности (опционально):
                            <input
                                value={activityId}
                                onChange={(event) => setActivityId(event.target.value)}
                                placeholder="UUID активности"
                            />
                        </label>
                        <button type="submit" className="primary-button">Провести сверку</button>
                    </form>
                    {error ? <div className="form-error">{error}</div> : null}
                </div>
            </section>

            <section className="page-section">
                <h2>Быстрая проверка</h2>
                <div className="card">
                    <form onSubmit={handleQuickCheck} className="stacked-form">
                        <label>
                            ID клиента
                            <input
                                value={quickPersonId}
                                onChange={(event) => setQuickPersonId(event.target.value)}
                                placeholder="ID клиента"
                            />
                        </label>
                        <label>
                            ID активности (опционально)
                            <input
                                value={quickActivityId}
                                onChange={(event) => setQuickActivityId(event.target.value)}
                                placeholder="UUID активности"
                            />
                        </label>
                        <button type="submit" className="secondary-button">Быстрая проверка</button>
                    </form>
                    {quickResult ? (
                        <div className="report-output">
                            Совпадения: {quickResult.matchFound ? "Найдены" : "Не найдены"}
                        </div>
                    ) : null}
                </div>
            </section>

            {result ? (
                <section className="page-section">
                    <h2>Результаты сверки</h2>
                    <div className="card">
                        <p>Совпадения: {result.matchFound ? "Найдены" : "Не найдены"}</p>
                        {result.matches?.length ? (
                            <ul className="plain-list">
                                {result.matches.map((match, index) => (
                                    <li key={`${match.fraudRecordName}-${index}`}>
                                        {match.fraudRecordName ?? "Запись"} — {match.confidence ?? ""} ({match.similarityScore ?? 0})
                                    </li>
                                ))}
                            </ul>
                        ) : null}
                    </div>
                </section>
            ) : null}

            <section className="page-section">
                <h2>База мошенников</h2>
                <div className="card">
                    <h3>Добавление записи</h3>
                    <form onSubmit={handleCreateRecord} className="stacked-form">
                        <label>
                            ID лица
                            <input value={recordPersonId} onChange={(event) => setRecordPersonId(event.target.value)} />
                        </label>
                        <label>
                            Полное имя
                            <input value={recordFullName} onChange={(event) => setRecordFullName(event.target.value)} />
                        </label>
                        <label>
                            Описание
                            <textarea
                                rows={3}
                                value={recordDescription}
                                onChange={(event) => setRecordDescription(event.target.value)}
                            />
                        </label>
                        <label>
                            Фото URL
                            <input value={recordPhotoUrl} onChange={(event) => setRecordPhotoUrl(event.target.value)} />
                        </label>
                        <label>
                            Тип мошенничества
                            <select value={recordType} onChange={(event) => setRecordType(event.target.value)}>
                                <option value="CHEATING">Мошенничество в играх</option>
                                <option value="THEFT">Кража</option>
                                <option value="FRAUD">Обман</option>
                                <option value="BANNED">Запрещён к допуску</option>
                                <option value="OTHER">Другое</option>
                            </select>
                        </label>
                        <label>
                            Добавил (UUID)
                            <input value={recordAddedBy} onChange={(event) => setRecordAddedBy(event.target.value)} />
                        </label>
                        <button type="submit" className="primary-button">Добавить запись</button>
                    </form>
                </div>

                <div className="card">
                    <h3>Поиск и фильтры</h3>
                    <label>
                        Поиск по имени или ID
                        <input value={recordSearchQuery} onChange={(event) => setRecordSearchQuery(event.target.value)} />
                    </label>
                    <div className="inline-actions">
                        <button type="button" className="secondary-button" onClick={handleSearch}>Поиск</button>
                        <button type="button" className="secondary-button" onClick={handleFetchAll}>Все записи</button>
                    </div>
                    <label>
                        Тип мошенничества
                        <select value={recordTypeFilter} onChange={(event) => setRecordTypeFilter(event.target.value)}>
                            <option value="CHEATING">Мошенничество в играх</option>
                            <option value="THEFT">Кража</option>
                            <option value="FRAUD">Обман</option>
                            <option value="BANNED">Запрещён к допуску</option>
                            <option value="OTHER">Другое</option>
                        </select>
                    </label>
                    <button type="button" className="secondary-button" onClick={handleFetchByType}>Получить по типу</button>
                    <label>
                        Получить по ID
                        <input value={recordIdLookup} onChange={(event) => setRecordIdLookup(event.target.value)} />
                    </label>
                    <button type="button" className="secondary-button" onClick={handleFetchById}>Найти запись</button>
                    {recordDetails ? (
                        <div className="report-output">
                            <p><strong>{recordDetails.fullName}</strong></p>
                            <p>ID: {recordDetails.id}</p>
                            <p>Тип: {recordDetails.fraudType}</p>
                            <p>Статус: {recordDetails.status}</p>
                        </div>
                    ) : null}
                </div>

                {records.length ? (
                    <div className="card-list">
                        {records.map((record) => (
                            <div key={record.id} className="card">
                                <h4>{record.fullName}</h4>
                                <p>ID лица: {record.personId}</p>
                                <p>Тип: {record.fraudType}</p>
                                <p>Статус: {record.status ?? "ACTIVE"}</p>
                                <div className="inline-actions">
                                    <select
                                        value={recordStatusUpdates[record.id] ?? record.status ?? "ACTIVE"}
                                        onChange={(event) => setRecordStatusUpdates((prev) => ({...prev, [record.id]: event.target.value}))}
                                    >
                                        <option value="ACTIVE">ACTIVE</option>
                                        <option value="ARCHIVED">ARCHIVED</option>
                                    </select>
                                    <button
                                        type="button"
                                        className="secondary-button"
                                        onClick={() => handleUpdateStatus(record.id, recordStatusUpdates[record.id] ?? record.status ?? "ACTIVE")}
                                    >
                                        Обновить статус
                                    </button>
                                    <button
                                        type="button"
                                        className="secondary-button"
                                        onClick={() => handleDelete(record.id)}
                                    >
                                        Удалить
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : null}
            </section>
        </PageShell>
    );
};

export default FraudCheckPage;
