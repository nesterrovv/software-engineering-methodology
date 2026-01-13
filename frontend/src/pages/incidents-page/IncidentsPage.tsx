import {useEffect, useState} from "react";
import {useAuth} from "../../auth/AuthContext.tsx";
import "./incidents-page.scss";

const INCIDENT_TYPES = ["THEFT", "FIGHT", "DRUNKENNESS", "CHEATING", "OTHER"] as const;
const COMPLAINT_CATEGORIES = ["SERVICE_QUALITY", "STAFF_BEHAVIOR", "GAME_ISSUES", "SAFETY", "OTHER"] as const;
const COMPLAINT_SOURCES = ["VISITOR", "EMPLOYEE", "SYSTEM", "TERMINAL"] as const;
const COMPLAINT_STATUSES = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"] as const;
const VIOLATION_TYPES = ["LATE", "OUT_OF_ZONE", "CONFLICT", "OTHER"] as const;
const REPORT_TYPES = ["INCIDENTS", "MANAGEMENT", "REGULATORY"] as const;

type DownloadState = { url: string; filename: string } | null;

const parseList = (value: string) =>
    value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

const toIso = (value: string) => (value ? new Date(value).toISOString() : undefined);

const buildQuery = (params: Record<string, string | undefined>) => {
    const search = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value) {
            search.set(key, value);
        }
    });
    const query = search.toString();
    return query ? `?${query}` : "";
};

const formatBody = (data: unknown) => {
    if (typeof data === "string") {
        return data;
    }
    return JSON.stringify(data, null, 2);
};

const IncidentsPage = () => {
    const {token, baseUrl} = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [lastRequest, setLastRequest] = useState("");
    const [lastStatus, setLastStatus] = useState("");
    const [lastDuration, setLastDuration] = useState("");
    const [lastBody, setLastBody] = useState("");
    const [download, setDownload] = useState<DownloadState>(null);

    const [incidentType, setIncidentType] = useState("THEFT");
    const [incidentLocation, setIncidentLocation] = useState("");
    const [incidentDescription, setIncidentDescription] = useState("");
    const [incidentParticipants, setIncidentParticipants] = useState("");
    const [incidentAttachments, setIncidentAttachments] = useState("");
    const [incidentReportedBy, setIncidentReportedBy] = useState("");
    const [incidentStart, setIncidentStart] = useState("");
    const [incidentEnd, setIncidentEnd] = useState("");
    const [incidentFilterType, setIncidentFilterType] = useState("");
    const [incidentId, setIncidentId] = useState("");

    const [complaintCategory, setComplaintCategory] = useState("SERVICE_QUALITY");
    const [complaintDescription, setComplaintDescription] = useState("");
    const [complaintSource, setComplaintSource] = useState("VISITOR");
    const [complaintReporter, setComplaintReporter] = useState("");
    const [complaintRelatedIncidentId, setComplaintRelatedIncidentId] = useState("");
    const [complaintStart, setComplaintStart] = useState("");
    const [complaintEnd, setComplaintEnd] = useState("");
    const [complaintFilterCategory, setComplaintFilterCategory] = useState("");
    const [complaintFilterSource, setComplaintFilterSource] = useState("");
    const [complaintId, setComplaintId] = useState("");
    const [complaintStatusId, setComplaintStatusId] = useState("");
    const [complaintStatus, setComplaintStatus] = useState("OPEN");

    const [violationEmployeeId, setViolationEmployeeId] = useState("");
    const [violationType, setViolationType] = useState("LATE");
    const [violationDescription, setViolationDescription] = useState("");
    const [violationAttachments, setViolationAttachments] = useState("");
    const [violationId, setViolationId] = useState("");

    const [reportStart, setReportStart] = useState("");
    const [reportEnd, setReportEnd] = useState("");
    const [reportIncidentTypes, setReportIncidentTypes] = useState<string[]>([]);
    const [reportGeneratedBy, setReportGeneratedBy] = useState("");
    const [managementReportStart, setManagementReportStart] = useState("");
    const [managementReportEnd, setManagementReportEnd] = useState("");
    const [managementReportGeneratedBy, setManagementReportGeneratedBy] = useState("");
    const [regulatoryReportStart, setRegulatoryReportStart] = useState("");
    const [regulatoryReportEnd, setRegulatoryReportEnd] = useState("");
    const [regulatoryReportGeneratedBy, setRegulatoryReportGeneratedBy] = useState("");
    const [repeatedStart, setRepeatedStart] = useState("");
    const [repeatedEnd, setRepeatedEnd] = useState("");
    const [repeatedThreshold, setRepeatedThreshold] = useState("3");
    const [reportFilterType, setReportFilterType] = useState("");
    const [reportId, setReportId] = useState("");
    const [exportReportId, setExportReportId] = useState("");

    useEffect(() => {
        return () => {
            if (download) {
                URL.revokeObjectURL(download.url);
            }
        };
    }, [download]);

    const runRequest = async (options: {
        method: string;
        path: string;
        query?: Record<string, string | undefined>;
        body?: unknown;
        responseType?: "json" | "blob";
        downloadName?: string;
    }) => {
        const base = baseUrl.replace(/\/+$/, "");
        const query = options.query ? buildQuery(options.query) : "";
        const url = `${base}${options.path}${query}`;
        const started = performance.now();
        const headers: Record<string, string> = {
            Accept: "application/json",
        };
        if (options.body) {
            headers["Content-Type"] = "application/json";
        }
        if (token) {
            headers.Authorization = token;
        }
        setIsLoading(true);
        setLastRequest(`${options.method} ${url}`);
        setLastStatus("");
        setLastDuration("");
        setLastBody("");
        setDownload(null);
        try {
            const response = await fetch(url, {
                method: options.method,
                headers,
                body: options.body ? JSON.stringify(options.body) : undefined,
            });
            const duration = `${Math.round(performance.now() - started)} ms`;
            if (options.responseType === "blob") {
                const blob = await response.blob();
                const safeName = options.downloadName ?? "report.bin";
                const downloadUrl = URL.createObjectURL(blob);
                setDownload({url: downloadUrl, filename: safeName});
                setLastBody(`Binary response (${blob.type || "unknown"}) ready for download.`);
            } else {
                const text = await response.text();
                try {
                    setLastBody(formatBody(JSON.parse(text)));
                } catch {
                    setLastBody(text || "Empty response.");
                }
            }
            setLastStatus(`${response.status} ${response.ok ? "OK" : "ERROR"}`);
            setLastDuration(duration);
        } catch (error) {
            const message = error instanceof Error ? error.message : "Unknown error";
            setLastStatus("NETWORK ERROR");
            setLastDuration("");
            setLastBody(message);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleIncidentType = (value: string) => {
        setReportIncidentTypes((prev) =>
            prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
        );
    };

    return (
        <div className="incidents-page">
            <section className="incidents-page__hero">
                <div className="incidents-page__hero-text">
                    <div className="hero-eyebrow">Incident service console</div>
                    <h1>All endpoints, one place.</h1>
                    <p>
                        Full control over incidents, complaints, violations, and reporting. Each
                        block below maps directly to a backend endpoint with instant response
                        previews.
                    </p>
                    <div className="hero-note">
                        API base: <strong>{baseUrl || "proxy"}</strong>
                    </div>
                </div>
                <div className="incidents-page__hero-stats">
                    <div className="hero-pill">Incidents</div>
                    <div className="hero-pill">Complaints</div>
                    <div className="hero-pill">Violations</div>
                    <div className="hero-pill">Reports</div>
                    <div className="hero-pill hero-pill--dark">
                        {isLoading ? "Running request..." : "Ready for action"}
                    </div>
                </div>
            </section>

            <section className="incidents-page__grid">
                <div className="panel">
                    <div className="panel__title">Incidents</div>
                    <div className="panel__section">
                        <h3>Create incident</h3>
                        <div className="form-grid">
                            <label>
                                Type
                                <select value={incidentType} onChange={(e) => setIncidentType(e.target.value)}>
                                    {INCIDENT_TYPES.map((type) => (
                                        <option key={type} value={type}>
                                            {type}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <label>
                                Location
                                <input
                                    value={incidentLocation}
                                    onChange={(e) => setIncidentLocation(e.target.value)}
                                    placeholder="Floor, table, zone"
                                />
                            </label>
                            <label className="form-span">
                                Description
                                <textarea
                                    value={incidentDescription}
                                    onChange={(e) => setIncidentDescription(e.target.value)}
                                    placeholder="What happened?"
                                />
                            </label>
                            <label>
                                Participants (comma separated)
                                <input
                                    value={incidentParticipants}
                                    onChange={(e) => setIncidentParticipants(e.target.value)}
                                    placeholder="uuid1, uuid2"
                                />
                            </label>
                            <label>
                                Attachment URLs
                                <input
                                    value={incidentAttachments}
                                    onChange={(e) => setIncidentAttachments(e.target.value)}
                                    placeholder="https://..."
                                />
                            </label>
                            <label>
                                Reported by (UUID)
                                <input
                                    value={incidentReportedBy}
                                    onChange={(e) => setIncidentReportedBy(e.target.value)}
                                    placeholder="reporter uuid"
                                />
                            </label>
                        </div>
                        <button
                            className="primary-button"
                            type="button"
                            onClick={() =>
                                runRequest({
                                    method: "POST",
                                    path: "/incidents",
                                    body: {
                                        type: incidentType,
                                        location: incidentLocation || undefined,
                                        description: incidentDescription || undefined,
                                        participants: parseList(incidentParticipants) || undefined,
                                        attachmentUrls: parseList(incidentAttachments) || undefined,
                                        reportedBy: incidentReportedBy || undefined,
                                    },
                                })
                            }
                        >
                            Create incident
                        </button>
                    </div>
                    <div className="panel__section">
                        <h3>Filter incidents</h3>
                        <div className="form-grid">
                            <label>
                                Period start
                                <input
                                    type="datetime-local"
                                    value={incidentStart}
                                    onChange={(e) => setIncidentStart(e.target.value)}
                                />
                            </label>
                            <label>
                                Period end
                                <input
                                    type="datetime-local"
                                    value={incidentEnd}
                                    onChange={(e) => setIncidentEnd(e.target.value)}
                                />
                            </label>
                            <label>
                                Type (optional)
                                <select
                                    value={incidentFilterType}
                                    onChange={(e) => setIncidentFilterType(e.target.value)}
                                >
                                    <option value="">All</option>
                                    {INCIDENT_TYPES.map((type) => (
                                        <option key={type} value={type}>
                                            {type}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </div>
                        <button
                            className="ghost-button"
                            type="button"
                            onClick={() =>
                                runRequest({
                                    method: "GET",
                                    path: "/incidents",
                                    query: {
                                        start: toIso(incidentStart),
                                        end: toIso(incidentEnd),
                                        type: incidentFilterType || undefined,
                                    },
                                })
                            }
                        >
                            Fetch incidents
                        </button>
                    </div>
                    <div className="panel__section">
                        <h3>Get incident by ID</h3>
                        <div className="inline-row">
                            <input
                                value={incidentId}
                                onChange={(e) => setIncidentId(e.target.value)}
                                placeholder="Incident UUID"
                            />
                            <button
                                className="ghost-button"
                                type="button"
                                onClick={() =>
                                    runRequest({
                                        method: "GET",
                                        path: `/incidents/${incidentId}`,
                                    })
                                }
                            >
                                Get incident
                            </button>
                        </div>
                    </div>
                </div>

                <div className="panel">
                    <div className="panel__title">Complaints</div>
                    <div className="panel__section">
                        <h3>Create complaint</h3>
                        <div className="form-grid">
                            <label>
                                Category
                                <select
                                    value={complaintCategory}
                                    onChange={(e) => setComplaintCategory(e.target.value)}
                                >
                                    {COMPLAINT_CATEGORIES.map((category) => (
                                        <option key={category} value={category}>
                                            {category}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <label>
                                Source
                                <select
                                    value={complaintSource}
                                    onChange={(e) => setComplaintSource(e.target.value)}
                                >
                                    {COMPLAINT_SOURCES.map((source) => (
                                        <option key={source} value={source}>
                                            {source}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <label className="form-span">
                                Description
                                <textarea
                                    value={complaintDescription}
                                    onChange={(e) => setComplaintDescription(e.target.value)}
                                    placeholder="Complaint details"
                                />
                            </label>
                            <label>
                                Reporter name
                                <input
                                    value={complaintReporter}
                                    onChange={(e) => setComplaintReporter(e.target.value)}
                                    placeholder="Name or alias"
                                />
                            </label>
                            <label>
                                Related incident UUID
                                <input
                                    value={complaintRelatedIncidentId}
                                    onChange={(e) => setComplaintRelatedIncidentId(e.target.value)}
                                    placeholder="Incident UUID"
                                />
                            </label>
                        </div>
                        <button
                            className="primary-button"
                            type="button"
                            onClick={() =>
                                runRequest({
                                    method: "POST",
                                    path: "/complaints",
                                    body: {
                                        category: complaintCategory,
                                        description: complaintDescription,
                                        source: complaintSource,
                                        reporterName: complaintReporter || undefined,
                                        relatedIncidentId: complaintRelatedIncidentId || undefined,
                                    },
                                })
                            }
                        >
                            Create complaint
                        </button>
                    </div>
                    <div className="panel__section">
                        <h3>Filter complaints</h3>
                        <div className="form-grid">
                            <label>
                                Period start
                                <input
                                    type="datetime-local"
                                    value={complaintStart}
                                    onChange={(e) => setComplaintStart(e.target.value)}
                                />
                            </label>
                            <label>
                                Period end
                                <input
                                    type="datetime-local"
                                    value={complaintEnd}
                                    onChange={(e) => setComplaintEnd(e.target.value)}
                                />
                            </label>
                            <label>
                                Category
                                <select
                                    value={complaintFilterCategory}
                                    onChange={(e) => setComplaintFilterCategory(e.target.value)}
                                >
                                    <option value="">All</option>
                                    {COMPLAINT_CATEGORIES.map((category) => (
                                        <option key={category} value={category}>
                                            {category}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <label>
                                Source
                                <select
                                    value={complaintFilterSource}
                                    onChange={(e) => setComplaintFilterSource(e.target.value)}
                                >
                                    <option value="">All</option>
                                    {COMPLAINT_SOURCES.map((source) => (
                                        <option key={source} value={source}>
                                            {source}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </div>
                        <button
                            className="ghost-button"
                            type="button"
                            onClick={() =>
                                runRequest({
                                    method: "GET",
                                    path: "/complaints",
                                    query: {
                                        start: toIso(complaintStart),
                                        end: toIso(complaintEnd),
                                        category: complaintFilterCategory || undefined,
                                        source: complaintFilterSource || undefined,
                                    },
                                })
                            }
                        >
                            Fetch complaints
                        </button>
                    </div>
                    <div className="panel__section">
                        <h3>Get complaint by ID</h3>
                        <div className="inline-row">
                            <input
                                value={complaintId}
                                onChange={(e) => setComplaintId(e.target.value)}
                                placeholder="Complaint UUID"
                            />
                            <button
                                className="ghost-button"
                                type="button"
                                onClick={() =>
                                    runRequest({
                                        method: "GET",
                                        path: `/complaints/${complaintId}`,
                                    })
                                }
                            >
                                Get complaint
                            </button>
                        </div>
                    </div>
                    <div className="panel__section">
                        <h3>Update complaint status</h3>
                        <div className="inline-row">
                            <input
                                value={complaintStatusId}
                                onChange={(e) => setComplaintStatusId(e.target.value)}
                                placeholder="Complaint UUID"
                            />
                            <select
                                value={complaintStatus}
                                onChange={(e) => setComplaintStatus(e.target.value)}
                            >
                                {COMPLAINT_STATUSES.map((status) => (
                                    <option key={status} value={status}>
                                        {status}
                                    </option>
                                ))}
                            </select>
                            <button
                                className="ghost-button"
                                type="button"
                                onClick={() =>
                                    runRequest({
                                        method: "PATCH",
                                        path: `/complaints/${complaintStatusId}/status`,
                                        query: {status: complaintStatus},
                                    })
                                }
                            >
                                Update status
                            </button>
                        </div>
                    </div>
                </div>

                <div className="panel">
                    <div className="panel__title">Violations</div>
                    <div className="panel__section">
                        <h3>Create violation</h3>
                        <div className="form-grid">
                            <label>
                                Employee UUID
                                <input
                                    value={violationEmployeeId}
                                    onChange={(e) => setViolationEmployeeId(e.target.value)}
                                    placeholder="Employee UUID"
                                />
                            </label>
                            <label>
                                Type
                                <select
                                    value={violationType}
                                    onChange={(e) => setViolationType(e.target.value)}
                                >
                                    {VIOLATION_TYPES.map((type) => (
                                        <option key={type} value={type}>
                                            {type}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <label className="form-span">
                                Description
                                <textarea
                                    value={violationDescription}
                                    onChange={(e) => setViolationDescription(e.target.value)}
                                    placeholder="Violation context"
                                />
                            </label>
                            <label className="form-span">
                                Attachment URLs
                                <input
                                    value={violationAttachments}
                                    onChange={(e) => setViolationAttachments(e.target.value)}
                                    placeholder="https://..."
                                />
                            </label>
                        </div>
                        <button
                            className="primary-button"
                            type="button"
                            onClick={() =>
                                runRequest({
                                    method: "POST",
                                    path: "/violations",
                                    body: {
                                        employeeId: violationEmployeeId,
                                        type: violationType,
                                        description: violationDescription || undefined,
                                        attachmentUrls: parseList(violationAttachments) || undefined,
                                    },
                                })
                            }
                        >
                            Create violation
                        </button>
                    </div>
                    <div className="panel__section">
                        <h3>List violations</h3>
                        <button
                            className="ghost-button"
                            type="button"
                            onClick={() =>
                                runRequest({
                                    method: "GET",
                                    path: "/violations",
                                })
                            }
                        >
                            Fetch violations
                        </button>
                    </div>
                    <div className="panel__section">
                        <h3>Get violation by ID</h3>
                        <div className="inline-row">
                            <input
                                value={violationId}
                                onChange={(e) => setViolationId(e.target.value)}
                                placeholder="Violation UUID"
                            />
                            <button
                                className="ghost-button"
                                type="button"
                                onClick={() =>
                                    runRequest({
                                        method: "GET",
                                        path: `/violations/${violationId}`,
                                    })
                                }
                            >
                                Get violation
                            </button>
                        </div>
                    </div>
                </div>

                <div className="panel">
                    <div className="panel__title">Reports</div>
                    <div className="panel__section">
                        <h3>Incident report</h3>
                        <div className="form-grid">
                            <label>
                                Period start
                                <input
                                    type="datetime-local"
                                    value={reportStart}
                                    onChange={(e) => setReportStart(e.target.value)}
                                />
                            </label>
                            <label>
                                Period end
                                <input
                                    type="datetime-local"
                                    value={reportEnd}
                                    onChange={(e) => setReportEnd(e.target.value)}
                                />
                            </label>
                            <label className="form-span">
                                Incident types
                                <div className="chip-grid">
                                    {INCIDENT_TYPES.map((type) => (
                                        <button
                                            key={type}
                                            type="button"
                                            className={`chip ${reportIncidentTypes.includes(type) ? "chip--active" : ""}`}
                                            onClick={() => toggleIncidentType(type)}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </label>
                            <label>
                                Generated by (UUID)
                                <input
                                    value={reportGeneratedBy}
                                    onChange={(e) => setReportGeneratedBy(e.target.value)}
                                    placeholder="User UUID"
                                />
                            </label>
                        </div>
                        <button
                            className="primary-button"
                            type="button"
                            onClick={() =>
                                runRequest({
                                    method: "POST",
                                    path: "/reports/incidents",
                                    body: {
                                        periodStart: toIso(reportStart),
                                        periodEnd: toIso(reportEnd),
                                        incidentTypes: reportIncidentTypes.length
                                            ? reportIncidentTypes
                                            : null,
                                        generatedBy: reportGeneratedBy || undefined,
                                    },
                                })
                            }
                        >
                            Generate incident report
                        </button>
                    </div>
                    <div className="panel__section">
                        <h3>Management report</h3>
                        <div className="form-grid">
                            <label>
                                Period start
                                <input
                                    type="datetime-local"
                                    value={managementReportStart}
                                    onChange={(e) => setManagementReportStart(e.target.value)}
                                />
                            </label>
                            <label>
                                Period end
                                <input
                                    type="datetime-local"
                                    value={managementReportEnd}
                                    onChange={(e) => setManagementReportEnd(e.target.value)}
                                />
                            </label>
                            <label>
                                Generated by (UUID)
                                <input
                                    value={managementReportGeneratedBy}
                                    onChange={(e) => setManagementReportGeneratedBy(e.target.value)}
                                    placeholder="User UUID"
                                />
                            </label>
                        </div>
                        <button
                            className="primary-button"
                            type="button"
                            onClick={() =>
                                runRequest({
                                    method: "POST",
                                    path: "/reports/management",
                                    body: {
                                        periodStart: toIso(managementReportStart),
                                        periodEnd: toIso(managementReportEnd),
                                        generatedBy: managementReportGeneratedBy || undefined,
                                    },
                                })
                            }
                        >
                            Generate management report
                        </button>
                    </div>
                    <div className="panel__section">
                        <h3>Regulatory report</h3>
                        <div className="form-grid">
                            <label>
                                Period start
                                <input
                                    type="datetime-local"
                                    value={regulatoryReportStart}
                                    onChange={(e) => setRegulatoryReportStart(e.target.value)}
                                />
                            </label>
                            <label>
                                Period end
                                <input
                                    type="datetime-local"
                                    value={regulatoryReportEnd}
                                    onChange={(e) => setRegulatoryReportEnd(e.target.value)}
                                />
                            </label>
                            <label>
                                Generated by (UUID)
                                <input
                                    value={regulatoryReportGeneratedBy}
                                    onChange={(e) => setRegulatoryReportGeneratedBy(e.target.value)}
                                    placeholder="User UUID"
                                />
                            </label>
                        </div>
                        <button
                            className="primary-button"
                            type="button"
                            onClick={() =>
                                runRequest({
                                    method: "POST",
                                    path: "/reports/regulatory",
                                    body: {
                                        periodStart: toIso(regulatoryReportStart),
                                        periodEnd: toIso(regulatoryReportEnd),
                                        generatedBy: regulatoryReportGeneratedBy || undefined,
                                    },
                                })
                            }
                        >
                            Generate regulatory report
                        </button>
                    </div>
                    <div className="panel__section">
                        <h3>Repeated violations</h3>
                        <div className="form-grid">
                            <label>
                                Period start
                                <input
                                    type="datetime-local"
                                    value={repeatedStart}
                                    onChange={(e) => setRepeatedStart(e.target.value)}
                                />
                            </label>
                            <label>
                                Period end
                                <input
                                    type="datetime-local"
                                    value={repeatedEnd}
                                    onChange={(e) => setRepeatedEnd(e.target.value)}
                                />
                            </label>
                            <label>
                                Threshold
                                <input
                                    type="number"
                                    min="1"
                                    value={repeatedThreshold}
                                    onChange={(e) => setRepeatedThreshold(e.target.value)}
                                />
                            </label>
                        </div>
                        <button
                            className="ghost-button"
                            type="button"
                            onClick={() =>
                                runRequest({
                                    method: "POST",
                                    path: "/reports/repeated-violations",
                                    body: {
                                        periodStart: toIso(repeatedStart),
                                        periodEnd: toIso(repeatedEnd),
                                        threshold: Number(repeatedThreshold || 3),
                                    },
                                })
                            }
                        >
                            Get repeated violations
                        </button>
                    </div>
                    <div className="panel__section">
                        <h3>Report registry</h3>
                        <div className="inline-row">
                            <select
                                value={reportFilterType}
                                onChange={(e) => setReportFilterType(e.target.value)}
                            >
                                <option value="">All types</option>
                                {REPORT_TYPES.map((type) => (
                                    <option key={type} value={type}>
                                        {type}
                                    </option>
                                ))}
                            </select>
                            <button
                                className="ghost-button"
                                type="button"
                                onClick={() =>
                                    runRequest({
                                        method: "GET",
                                        path: "/reports",
                                        query: {type: reportFilterType || undefined},
                                    })
                                }
                            >
                                Fetch reports
                            </button>
                        </div>
                        <div className="inline-row">
                            <input
                                value={reportId}
                                onChange={(e) => setReportId(e.target.value)}
                                placeholder="Report UUID"
                            />
                            <button
                                className="ghost-button"
                                type="button"
                                onClick={() =>
                                    runRequest({
                                        method: "GET",
                                        path: `/reports/${reportId}`,
                                    })
                                }
                            >
                                Get report
                            </button>
                        </div>
                    </div>
                </div>

                <div className="panel">
                    <div className="panel__title">Exports</div>
                    <div className="panel__section">
                        <h3>Export report</h3>
                        <div className="inline-row">
                            <input
                                value={exportReportId}
                                onChange={(e) => setExportReportId(e.target.value)}
                                placeholder="Report UUID"
                            />
                            <button
                                className="ghost-button"
                                type="button"
                                onClick={() =>
                                    runRequest({
                                        method: "GET",
                                        path: `/reports/${exportReportId}/export/pdf`,
                                        responseType: "blob",
                                        downloadName: `report-${exportReportId || "export"}.pdf`,
                                    })
                                }
                            >
                                Export PDF
                            </button>
                            <button
                                className="ghost-button"
                                type="button"
                                onClick={() =>
                                    runRequest({
                                        method: "GET",
                                        path: `/reports/${exportReportId}/export/excel`,
                                        responseType: "blob",
                                        downloadName: `report-${exportReportId || "export"}.xlsx`,
                                    })
                                }
                            >
                                Export Excel
                            </button>
                        </div>
                        {download ? (
                            <a className="download-link" href={download.url} download={download.filename}>
                                Download {download.filename}
                            </a>
                        ) : (
                            <div className="hint">Exports appear as downloadable files here.</div>
                        )}
                    </div>
                </div>
            </section>

            <section className="panel panel--wide">
                <div className="panel__title">Last response</div>
                <div className="response-meta">
                    <span>{lastRequest || "Run a request to see details."}</span>
                    <span>{lastStatus}</span>
                    <span>{lastDuration}</span>
                </div>
                <pre className="response-body">{lastBody || "Response payloads show up here."}</pre>
            </section>
        </div>
    );
};

export default IncidentsPage;
