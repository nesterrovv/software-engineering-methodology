import {useState} from "react";
import {useAuth} from "../../auth/AuthContext.tsx";
import "./security-page.scss";

const FRAUD_TYPES = ["CHEATING", "THEFT", "FRAUD", "BANNED", "OTHER"] as const;
const FRAUD_STATUSES = ["ACTIVE", "ARCHIVED"] as const;
const NOTIFICATION_TYPES = [
    "SUSPICIOUS_ACTIVITY",
    "FRAUD_MATCH",
    "LONG_CONTACT",
    "FREQUENT_INTERACTION",
    "SYSTEM_ALERT",
    "OTHER",
] as const;
const NOTIFICATION_PRIORITIES = ["LOW", "NORMAL", "HIGH", "CRITICAL"] as const;

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

const SecurityPage = () => {
    const {token, baseUrl} = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [lastRequest, setLastRequest] = useState("");
    const [lastStatus, setLastStatus] = useState("");
    const [lastDuration, setLastDuration] = useState("");
    const [lastBody, setLastBody] = useState("");

    const [monitorOfficerId, setMonitorOfficerId] = useState("");
    const [monitorSessionId, setMonitorSessionId] = useState("");

    const [contactPerson1, setContactPerson1] = useState("");
    const [contactPerson2, setContactPerson2] = useState("");
    const [contactStart, setContactStart] = useState("");
    const [contactEnd, setContactEnd] = useState("");
    const [contactLocation, setContactLocation] = useState("");
    const [contactCheckPerson1, setContactCheckPerson1] = useState("");
    const [contactCheckPerson2, setContactCheckPerson2] = useState("");
    const [contactMockCount, setContactMockCount] = useState("10");

    const [fraudPersonId, setFraudPersonId] = useState("");
    const [fraudFullName, setFraudFullName] = useState("");
    const [fraudDescription, setFraudDescription] = useState("");
    const [fraudPhotoUrl, setFraudPhotoUrl] = useState("");
    const [fraudType, setFraudType] = useState("CHEATING");
    const [fraudAddedBy, setFraudAddedBy] = useState("");
    const [fraudRecordId, setFraudRecordId] = useState("");
    const [fraudSearchQuery, setFraudSearchQuery] = useState("");
    const [fraudTypeFilter, setFraudTypeFilter] = useState("");
    const [fraudStatusId, setFraudStatusId] = useState("");
    const [fraudStatus, setFraudStatus] = useState("ACTIVE");
    const [fraudDeleteId, setFraudDeleteId] = useState("");

    const [fraudCheckPersonId, setFraudCheckPersonId] = useState("");
    const [fraudCheckPhotoUrl, setFraudCheckPhotoUrl] = useState("");
    const [fraudCheckActivityId, setFraudCheckActivityId] = useState("");
    const [fraudQuickPersonId, setFraudQuickPersonId] = useState("");
    const [fraudQuickActivityId, setFraudQuickActivityId] = useState("");

    const [notificationRecipientId, setNotificationRecipientId] = useState("");
    const [notificationRecipientUnreadId, setNotificationRecipientUnreadId] = useState("");
    const [notificationRecipientUnreadCountId, setNotificationRecipientUnreadCountId] = useState("");
    const [notificationReadId, setNotificationReadId] = useState("");
    const [notificationCreateRecipientId, setNotificationCreateRecipientId] = useState("");
    const [notificationType, setNotificationType] = useState("SYSTEM_ALERT");
    const [notificationTitle, setNotificationTitle] = useState("");
    const [notificationMessage, setNotificationMessage] = useState("");
    const [notificationPriority, setNotificationPriority] = useState("NORMAL");
    const [notificationRelatedType, setNotificationRelatedType] = useState("");
    const [notificationRelatedId, setNotificationRelatedId] = useState("");

    const runRequest = async (options: {
        method: string;
        path: string;
        query?: Record<string, string | undefined>;
        body?: unknown;
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
        try {
            const response = await fetch(url, {
                method: options.method,
                headers,
                body: options.body ? JSON.stringify(options.body) : undefined,
            });
            const duration = `${Math.round(performance.now() - started)} ms`;
            const text = await response.text();
            try {
                setLastBody(formatBody(JSON.parse(text)));
            } catch {
                setLastBody(text || "Empty response.");
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

    return (
        <div className="security-page">
            <section className="security-page__hero">
                <div className="security-page__hero-text">
                    <div className="hero-eyebrow">Security service console</div>
                    <h1>Visibility, alerts, response.</h1>
                    <p>
                        Monitor halls, track contacts, run fraud checks, and manage notifications
                        in a single pink command center.
                    </p>
                    <div className="hero-note">
                        API base: <strong>{baseUrl || "proxy"}</strong>
                    </div>
                </div>
                <div className="security-page__hero-stats">
                    <div className="hero-pill">Hall monitoring</div>
                    <div className="hero-pill">Contacts</div>
                    <div className="hero-pill">Fraud DB</div>
                    <div className="hero-pill">Notifications</div>
                    <div className="hero-pill hero-pill--dark">
                        {isLoading ? "Running request..." : "Ready for action"}
                    </div>
                </div>
            </section>

            <section className="security-page__grid">
                <div className="panel">
                    <div className="panel__title">Hall monitoring</div>
                    <div className="panel__section">
                        <h3>Start monitoring</h3>
                        <div className="inline-row">
                            <input
                                value={monitorOfficerId}
                                onChange={(e) => setMonitorOfficerId(e.target.value)}
                                placeholder="Security officer UUID"
                            />
                            <button
                                className="primary-button"
                                type="button"
                                onClick={() =>
                                    runRequest({
                                        method: "POST",
                                        path: "/api/security/monitoring/start",
                                        query: {securityOfficerId: monitorOfficerId},
                                    })
                                }
                            >
                                Start session
                            </button>
                        </div>
                        <div className="inline-row">
                            <input
                                value={monitorSessionId}
                                onChange={(e) => setMonitorSessionId(e.target.value)}
                                placeholder="Session UUID"
                            />
                            <button
                                className="ghost-button"
                                type="button"
                                onClick={() =>
                                    runRequest({
                                        method: "POST",
                                        path: `/api/security/monitoring/${monitorSessionId}/end`,
                                    })
                                }
                            >
                                End session
                            </button>
                            <button
                                className="ghost-button"
                                type="button"
                                onClick={() =>
                                    runRequest({
                                        method: "GET",
                                        path: `/api/security/monitoring/${monitorSessionId}`,
                                    })
                                }
                            >
                                Get session
                            </button>
                        </div>
                        <button
                            className="ghost-button"
                            type="button"
                            onClick={() =>
                                runRequest({
                                    method: "GET",
                                    path: "/api/security/monitoring/status",
                                })
                            }
                        >
                            Current hall status
                        </button>
                    </div>
                </div>

                <div className="panel">
                    <div className="panel__title">Contact monitoring</div>
                    <div className="panel__section">
                        <h3>Register contact</h3>
                        <div className="form-grid">
                            <label>
                                Person ID 1
                                <input
                                    value={contactPerson1}
                                    onChange={(e) => setContactPerson1(e.target.value)}
                                    placeholder="Person ID"
                                />
                            </label>
                            <label>
                                Person ID 2
                                <input
                                    value={contactPerson2}
                                    onChange={(e) => setContactPerson2(e.target.value)}
                                    placeholder="Person ID"
                                />
                            </label>
                            <label>
                                Contact start
                                <input
                                    type="datetime-local"
                                    value={contactStart}
                                    onChange={(e) => setContactStart(e.target.value)}
                                />
                            </label>
                            <label>
                                Contact end
                                <input
                                    type="datetime-local"
                                    value={contactEnd}
                                    onChange={(e) => setContactEnd(e.target.value)}
                                />
                            </label>
                            <label className="form-span">
                                Location
                                <input
                                    value={contactLocation}
                                    onChange={(e) => setContactLocation(e.target.value)}
                                    placeholder="Location"
                                />
                            </label>
                        </div>
                        <button
                            className="primary-button"
                            type="button"
                            onClick={() =>
                                runRequest({
                                    method: "POST",
                                    path: "/api/security/contacts",
                                    body: {
                                        personId1: contactPerson1,
                                        personId2: contactPerson2,
                                        contactStartTime: toIso(contactStart),
                                        contactEndTime: toIso(contactEnd),
                                        location: contactLocation || undefined,
                                    },
                                })
                            }
                        >
                            Register contact
                        </button>
                    </div>
                    <div className="panel__section">
                        <h3>Contact checks</h3>
                        <div className="inline-row">
                            <input
                                value={contactCheckPerson1}
                                onChange={(e) => setContactCheckPerson1(e.target.value)}
                                placeholder="Person ID 1"
                            />
                            <input
                                value={contactCheckPerson2}
                                onChange={(e) => setContactCheckPerson2(e.target.value)}
                                placeholder="Person ID 2"
                            />
                            <button
                                className="ghost-button"
                                type="button"
                                onClick={() =>
                                    runRequest({
                                        method: "POST",
                                        path: "/api/security/contacts/check-frequency",
                                        query: {
                                            personId1: contactCheckPerson1,
                                            personId2: contactCheckPerson2,
                                        },
                                    })
                                }
                            >
                                Check frequency
                            </button>
                        </div>
                        <div className="inline-row">
                            <input
                                type="number"
                                min="1"
                                value={contactMockCount}
                                onChange={(e) => setContactMockCount(e.target.value)}
                            />
                            <button
                                className="ghost-button"
                                type="button"
                                onClick={() =>
                                    runRequest({
                                        method: "POST",
                                        path: "/api/security/contacts/generate-mocks",
                                        query: {count: contactMockCount || undefined},
                                    })
                                }
                            >
                                Generate mock contacts
                            </button>
                        </div>
                        <button
                            className="ghost-button"
                            type="button"
                            onClick={() =>
                                runRequest({
                                    method: "GET",
                                    path: "/api/security/contacts/suspicious",
                                })
                            }
                        >
                            Suspicious contacts
                        </button>
                    </div>
                </div>

                <div className="panel">
                    <div className="panel__title">Fraud database</div>
                    <div className="panel__section">
                        <h3>Create record</h3>
                        <div className="form-grid">
                            <label>
                                Person ID
                                <input
                                    value={fraudPersonId}
                                    onChange={(e) => setFraudPersonId(e.target.value)}
                                    placeholder="Person ID"
                                />
                            </label>
                            <label>
                                Full name
                                <input
                                    value={fraudFullName}
                                    onChange={(e) => setFraudFullName(e.target.value)}
                                    placeholder="Full name"
                                />
                            </label>
                            <label>
                                Fraud type
                                <select value={fraudType} onChange={(e) => setFraudType(e.target.value)}>
                                    {FRAUD_TYPES.map((type) => (
                                        <option key={type} value={type}>
                                            {type}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <label>
                                Added by (UUID)
                                <input
                                    value={fraudAddedBy}
                                    onChange={(e) => setFraudAddedBy(e.target.value)}
                                    placeholder="Security officer UUID"
                                />
                            </label>
                            <label className="form-span">
                                Description
                                <textarea
                                    value={fraudDescription}
                                    onChange={(e) => setFraudDescription(e.target.value)}
                                    placeholder="Details"
                                />
                            </label>
                            <label className="form-span">
                                Photo URL
                                <input
                                    value={fraudPhotoUrl}
                                    onChange={(e) => setFraudPhotoUrl(e.target.value)}
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
                                    path: "/api/security/fraud-database",
                                    body: {
                                        personId: fraudPersonId,
                                        fullName: fraudFullName,
                                        description: fraudDescription || undefined,
                                        photoUrl: fraudPhotoUrl || undefined,
                                        fraudType,
                                        addedBy: fraudAddedBy || undefined,
                                    },
                                })
                            }
                        >
                            Add record
                        </button>
                    </div>
                    <div className="panel__section">
                        <h3>Lookup records</h3>
                        <div className="inline-row">
                            <button
                                className="ghost-button"
                                type="button"
                                onClick={() =>
                                    runRequest({
                                        method: "GET",
                                        path: "/api/security/fraud-database",
                                    })
                                }
                            >
                                Fetch all
                            </button>
                            <input
                                value={fraudRecordId}
                                onChange={(e) => setFraudRecordId(e.target.value)}
                                placeholder="Record UUID"
                            />
                            <button
                                className="ghost-button"
                                type="button"
                                onClick={() =>
                                    runRequest({
                                        method: "GET",
                                        path: `/api/security/fraud-database/${fraudRecordId}`,
                                    })
                                }
                            >
                                Get by ID
                            </button>
                        </div>
                        <div className="inline-row">
                            <input
                                value={fraudSearchQuery}
                                onChange={(e) => setFraudSearchQuery(e.target.value)}
                                placeholder="Search query"
                            />
                            <button
                                className="ghost-button"
                                type="button"
                                onClick={() =>
                                    runRequest({
                                        method: "GET",
                                        path: "/api/security/fraud-database/search",
                                        query: {q: fraudSearchQuery},
                                    })
                                }
                            >
                                Search
                            </button>
                        </div>
                        <div className="inline-row">
                            <select
                                value={fraudTypeFilter}
                                onChange={(e) => setFraudTypeFilter(e.target.value)}
                            >
                                <option value="">Select type</option>
                                {FRAUD_TYPES.map((type) => (
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
                                        path: `/api/security/fraud-database/type/${fraudTypeFilter}`,
                                    })
                                }
                            >
                                Filter by type
                            </button>
                        </div>
                    </div>
                    <div className="panel__section">
                        <h3>Update status / delete</h3>
                        <div className="inline-row">
                            <input
                                value={fraudStatusId}
                                onChange={(e) => setFraudStatusId(e.target.value)}
                                placeholder="Record UUID"
                            />
                            <select value={fraudStatus} onChange={(e) => setFraudStatus(e.target.value)}>
                                {FRAUD_STATUSES.map((status) => (
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
                                        path: `/api/security/fraud-database/${fraudStatusId}/status`,
                                        query: {status: fraudStatus},
                                    })
                                }
                            >
                                Update status
                            </button>
                        </div>
                        <div className="inline-row">
                            <input
                                value={fraudDeleteId}
                                onChange={(e) => setFraudDeleteId(e.target.value)}
                                placeholder="Record UUID"
                            />
                            <button
                                className="ghost-button"
                                type="button"
                                onClick={() =>
                                    runRequest({
                                        method: "DELETE",
                                        path: `/api/security/fraud-database/${fraudDeleteId}`,
                                    })
                                }
                            >
                                Delete record
                            </button>
                        </div>
                    </div>
                </div>

                <div className="panel">
                    <div className="panel__title">Fraud checks</div>
                    <div className="panel__section">
                        <h3>Run fraud check</h3>
                        <div className="form-grid">
                            <label>
                                Person ID
                                <input
                                    value={fraudCheckPersonId}
                                    onChange={(e) => setFraudCheckPersonId(e.target.value)}
                                    placeholder="Person ID"
                                />
                            </label>
                            <label>
                                Photo URL
                                <input
                                    value={fraudCheckPhotoUrl}
                                    onChange={(e) => setFraudCheckPhotoUrl(e.target.value)}
                                    placeholder="https://..."
                                />
                            </label>
                            <label>
                                Activity ID
                                <input
                                    value={fraudCheckActivityId}
                                    onChange={(e) => setFraudCheckActivityId(e.target.value)}
                                    placeholder="Activity UUID"
                                />
                            </label>
                        </div>
                        <button
                            className="primary-button"
                            type="button"
                            onClick={() =>
                                runRequest({
                                    method: "POST",
                                    path: "/api/security/fraud-check",
                                    body: {
                                        personId: fraudCheckPersonId,
                                        photoUrl: fraudCheckPhotoUrl || undefined,
                                        triggeredByActivityId: fraudCheckActivityId || undefined,
                                    },
                                })
                            }
                        >
                            Run check
                        </button>
                    </div>
                    <div className="panel__section">
                        <h3>Quick check</h3>
                        <div className="inline-row">
                            <input
                                value={fraudQuickPersonId}
                                onChange={(e) => setFraudQuickPersonId(e.target.value)}
                                placeholder="Person ID"
                            />
                            <input
                                value={fraudQuickActivityId}
                                onChange={(e) => setFraudQuickActivityId(e.target.value)}
                                placeholder="Activity UUID"
                            />
                            <button
                                className="ghost-button"
                                type="button"
                                onClick={() =>
                                    runRequest({
                                        method: "POST",
                                        path: "/api/security/fraud-check/quick",
                                        query: {
                                            personId: fraudQuickPersonId,
                                            activityId: fraudQuickActivityId || undefined,
                                        },
                                    })
                                }
                            >
                                Quick check
                            </button>
                        </div>
                    </div>
                </div>

                <div className="panel">
                    <div className="panel__title">Notifications</div>
                    <div className="panel__section">
                        <h3>Fetch notifications</h3>
                        <div className="inline-row">
                            <input
                                value={notificationRecipientId}
                                onChange={(e) => setNotificationRecipientId(e.target.value)}
                                placeholder="Recipient UUID"
                            />
                            <button
                                className="ghost-button"
                                type="button"
                                onClick={() =>
                                    runRequest({
                                        method: "GET",
                                        path: `/api/security/notifications/recipient/${notificationRecipientId}`,
                                    })
                                }
                            >
                                Fetch notifications
                            </button>
                        </div>
                        <div className="inline-row">
                            <input
                                value={notificationRecipientUnreadId}
                                onChange={(e) => setNotificationRecipientUnreadId(e.target.value)}
                                placeholder="Recipient UUID"
                            />
                            <button
                                className="ghost-button"
                                type="button"
                                onClick={() =>
                                    runRequest({
                                        method: "GET",
                                        path: `/api/security/notifications/recipient/${notificationRecipientUnreadId}/unread`,
                                    })
                                }
                            >
                                Unread notifications
                            </button>
                        </div>
                        <div className="inline-row">
                            <input
                                value={notificationRecipientUnreadCountId}
                                onChange={(e) => setNotificationRecipientUnreadCountId(e.target.value)}
                                placeholder="Recipient UUID"
                            />
                            <button
                                className="ghost-button"
                                type="button"
                                onClick={() =>
                                    runRequest({
                                        method: "GET",
                                        path: `/api/security/notifications/recipient/${notificationRecipientUnreadCountId}/unread-count`,
                                    })
                                }
                            >
                                Unread count
                            </button>
                        </div>
                        <div className="inline-row">
                            <input
                                value={notificationReadId}
                                onChange={(e) => setNotificationReadId(e.target.value)}
                                placeholder="Notification UUID"
                            />
                            <button
                                className="ghost-button"
                                type="button"
                                onClick={() =>
                                    runRequest({
                                        method: "POST",
                                        path: `/api/security/notifications/${notificationReadId}/read`,
                                    })
                                }
                            >
                                Mark as read
                            </button>
                        </div>
                    </div>
                    <div className="panel__section">
                        <h3>Create notification</h3>
                        <div className="form-grid">
                            <label>
                                Recipient UUID
                                <input
                                    value={notificationCreateRecipientId}
                                    onChange={(e) => setNotificationCreateRecipientId(e.target.value)}
                                    placeholder="Recipient UUID"
                                />
                            </label>
                            <label>
                                Type
                                <select
                                    value={notificationType}
                                    onChange={(e) => setNotificationType(e.target.value)}
                                >
                                    {NOTIFICATION_TYPES.map((type) => (
                                        <option key={type} value={type}>
                                            {type}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <label>
                                Priority
                                <select
                                    value={notificationPriority}
                                    onChange={(e) => setNotificationPriority(e.target.value)}
                                >
                                    {NOTIFICATION_PRIORITIES.map((priority) => (
                                        <option key={priority} value={priority}>
                                            {priority}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <label className="form-span">
                                Title
                                <input
                                    value={notificationTitle}
                                    onChange={(e) => setNotificationTitle(e.target.value)}
                                    placeholder="Title"
                                />
                            </label>
                            <label className="form-span">
                                Message
                                <textarea
                                    value={notificationMessage}
                                    onChange={(e) => setNotificationMessage(e.target.value)}
                                    placeholder="Message"
                                />
                            </label>
                            <label>
                                Related entity type
                                <input
                                    value={notificationRelatedType}
                                    onChange={(e) => setNotificationRelatedType(e.target.value)}
                                    placeholder="Optional"
                                />
                            </label>
                            <label>
                                Related entity UUID
                                <input
                                    value={notificationRelatedId}
                                    onChange={(e) => setNotificationRelatedId(e.target.value)}
                                    placeholder="Optional"
                                />
                            </label>
                        </div>
                        <button
                            className="primary-button"
                            type="button"
                            onClick={() =>
                                runRequest({
                                    method: "POST",
                                    path: "/api/security/notifications",
                                    body: {
                                        recipientId: notificationCreateRecipientId,
                                        type: notificationType,
                                        title: notificationTitle,
                                        message: notificationMessage,
                                        priority: notificationPriority,
                                        relatedEntityType: notificationRelatedType || undefined,
                                        relatedEntityId: notificationRelatedId || undefined,
                                    },
                                })
                            }
                        >
                            Create notification
                        </button>
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

export default SecurityPage;
