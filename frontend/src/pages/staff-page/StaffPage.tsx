import {useState} from "react";
import {useAuth} from "../../auth/AuthContext.tsx";
import "./staff-page.scss";

const EMPLOYEE_STATUSES = ["ACTIVE", "ON_LEAVE", "SICK_LEAVE", "TERMINATED"] as const;
const SHIFT_TYPES = ["DAY", "EVENING", "NIGHT"] as const;

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

type EmployeeItem = {
    id: string;
    firstName: string;
    lastName: string;
    middleName?: string;
    position: string;
    department: string;
    status: string;
    hireDate?: string;
    createdAt?: string;
    contactInfo?: string;
};

const toEmployeeList = (data: unknown): EmployeeItem[] => {
    if (Array.isArray(data)) {
        return data as EmployeeItem[];
    }
    if (data && typeof data === "object") {
        return [data as EmployeeItem];
    }
    return [];
};

const StaffPage = () => {
    const {token, baseUrl} = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [lastRequest, setLastRequest] = useState("");
    const [lastStatus, setLastStatus] = useState("");
    const [lastDuration, setLastDuration] = useState("");
    const [lastBody, setLastBody] = useState("");
    const [employeeResults, setEmployeeResults] = useState<EmployeeItem[]>([]);

    const [employeeFirstName, setEmployeeFirstName] = useState("");
    const [employeeLastName, setEmployeeLastName] = useState("");
    const [employeeMiddleName, setEmployeeMiddleName] = useState("");
    const [employeePosition, setEmployeePosition] = useState("");
    const [employeeDepartment, setEmployeeDepartment] = useState("");
    const [employeeStatus, setEmployeeStatus] = useState("ACTIVE");
    const [employeeContact, setEmployeeContact] = useState("");
    const [employeeId, setEmployeeId] = useState("");
    const [employeeDepartmentFilter, setEmployeeDepartmentFilter] = useState("");
    const [employeeStatusId, setEmployeeStatusId] = useState("");
    const [employeeStatusUpdate, setEmployeeStatusUpdate] = useState("ACTIVE");

    const [shiftEmployeeId, setShiftEmployeeId] = useState("");
    const [shiftDate, setShiftDate] = useState("");
    const [shiftStart, setShiftStart] = useState("");
    const [shiftEnd, setShiftEnd] = useState("");
    const [shiftType, setShiftType] = useState("DAY");
    const [shiftLocation, setShiftLocation] = useState("");
    const [shiftCreatedBy, setShiftCreatedBy] = useState("");
    const [shiftNotes, setShiftNotes] = useState("");
    const [shiftId, setShiftId] = useState("");
    const [shiftPublishId, setShiftPublishId] = useState("");
    const [shiftConfirmId, setShiftConfirmId] = useState("");
    const [shiftConfirmedBy, setShiftConfirmedBy] = useState("");
    const [shiftReassignId, setShiftReassignId] = useState("");
    const [shiftReassignEmployeeId, setShiftReassignEmployeeId] = useState("");
    const [availabilityStart, setAvailabilityStart] = useState("");
    const [availabilityEnd, setAvailabilityEnd] = useState("");
    const [shiftEmployeeFilterId, setShiftEmployeeFilterId] = useState("");
    const [shiftRangeStart, setShiftRangeStart] = useState("");
    const [shiftRangeEnd, setShiftRangeEnd] = useState("");

    const [workTimeEmployeeId, setWorkTimeEmployeeId] = useState("");
    const [workTimeDeviceId, setWorkTimeDeviceId] = useState("");
    const [workTimeClockOutEmployeeId, setWorkTimeClockOutEmployeeId] = useState("");
    const [workTimeClockOutDeviceId, setWorkTimeClockOutDeviceId] = useState("");
    const [workTimeRecordId, setWorkTimeRecordId] = useState("");
    const [workTimeHistoryEmployeeId, setWorkTimeHistoryEmployeeId] = useState("");
    const [workTimeHistoryStart, setWorkTimeHistoryStart] = useState("");
    const [workTimeHistoryEnd, setWorkTimeHistoryEnd] = useState("");

    const [violationEmployeeId, setViolationEmployeeId] = useState("");
    const [violationDepartment, setViolationDepartment] = useState("");
    const [violationStart, setViolationStart] = useState("");
    const [violationEnd, setViolationEnd] = useState("");
    const [violationType, setViolationType] = useState("");
    const [violationHistoryEmployeeId, setViolationHistoryEmployeeId] = useState("");
    const [violationHistoryDepartment, setViolationHistoryDepartment] = useState("");

    const runRequest = async (options: {
        method: string;
        path: string;
        query?: Record<string, string | undefined>;
        body?: unknown;
        onSuccess?: (data: unknown) => void;
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
            let parsed: unknown = text || "Empty response.";
            try {
                parsed = JSON.parse(text);
            } catch {
                parsed = text || "Empty response.";
            }
            setLastBody(formatBody(parsed));
            if (response.ok && options.onSuccess) {
                options.onSuccess(parsed);
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
        <div className="staff-page">
            <section className="staff-page__hero">
                <div className="staff-page__hero-text">
                    <div className="hero-eyebrow">Staff service console</div>
                    <h1>Staff ops, end to end.</h1>
                    <p>
                        Manage employees, shifts, work time, and violation history. Every staff
                        endpoint is wired for quick, practical workflows.
                    </p>
                    <div className="hero-note">
                        API base: <strong>{baseUrl || "proxy"}</strong>
                    </div>
                </div>
                <div className="staff-page__hero-stats">
                    <div className="hero-pill">Employees</div>
                    <div className="hero-pill">Shifts</div>
                    <div className="hero-pill">Work time</div>
                    <div className="hero-pill">Violations</div>
                    <div className="hero-pill hero-pill--dark">
                        {isLoading ? "Running request..." : "Ready for action"}
                    </div>
                </div>
            </section>

            <section className="staff-page__grid">
                <div className="panel">
                    <div className="panel__title">Employees</div>
                    <div className="panel__section">
                        <h3>Create employee</h3>
                        <div className="form-grid">
                            <label>
                                First name
                                <input
                                    value={employeeFirstName}
                                    onChange={(e) => setEmployeeFirstName(e.target.value)}
                                    placeholder="First name"
                                />
                            </label>
                            <label>
                                Last name
                                <input
                                    value={employeeLastName}
                                    onChange={(e) => setEmployeeLastName(e.target.value)}
                                    placeholder="Last name"
                                />
                            </label>
                            <label>
                                Middle name
                                <input
                                    value={employeeMiddleName}
                                    onChange={(e) => setEmployeeMiddleName(e.target.value)}
                                    placeholder="Middle name"
                                />
                            </label>
                            <label>
                                Position
                                <input
                                    value={employeePosition}
                                    onChange={(e) => setEmployeePosition(e.target.value)}
                                    placeholder="Dealer, manager, etc."
                                />
                            </label>
                            <label>
                                Department
                                <input
                                    value={employeeDepartment}
                                    onChange={(e) => setEmployeeDepartment(e.target.value)}
                                    placeholder="Department"
                                />
                            </label>
                            <label>
                                Status
                                <select
                                    value={employeeStatus}
                                    onChange={(e) => setEmployeeStatus(e.target.value)}
                                >
                                    {EMPLOYEE_STATUSES.map((status) => (
                                        <option key={status} value={status}>
                                            {status}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <label className="form-span">
                                Contact info
                                <textarea
                                    value={employeeContact}
                                    onChange={(e) => setEmployeeContact(e.target.value)}
                                    placeholder="Phone, email, or notes"
                                />
                            </label>
                        </div>
                        <button
                            className="primary-button"
                            type="button"
                            onClick={() =>
                                runRequest({
                                    method: "POST",
                                    path: "/api/staff/employees",
                                    body: {
                                        firstName: employeeFirstName,
                                        lastName: employeeLastName,
                                        middleName: employeeMiddleName || undefined,
                                        position: employeePosition,
                                        department: employeeDepartment,
                                        status: employeeStatus,
                                        contactInfo: employeeContact || undefined,
                                    },
                                })
                            }
                        >
                            Create employee
                        </button>
                    </div>
                    <div className="panel__section">
                        <h3>Lookup employees</h3>
                        <div className="inline-row">
                            <button
                                className="ghost-button"
                                type="button"
                                onClick={() =>
                                    runRequest({
                                        method: "GET",
                                        path: "/api/staff/employees",
                                        onSuccess: (data) => setEmployeeResults(toEmployeeList(data)),
                                    })
                                }
                            >
                                Fetch all employees
                            </button>
                            <input
                                value={employeeId}
                                onChange={(e) => setEmployeeId(e.target.value)}
                                placeholder="Employee UUID"
                            />
                            <button
                                className="ghost-button"
                                type="button"
                                onClick={() =>
                                    runRequest({
                                        method: "GET",
                                        path: `/api/staff/employees/${employeeId}`,
                                        onSuccess: (data) => setEmployeeResults(toEmployeeList(data)),
                                    })
                                }
                            >
                                Get by ID
                            </button>
                        </div>
                        <div className="inline-row">
                            <input
                                value={employeeDepartmentFilter}
                                onChange={(e) => setEmployeeDepartmentFilter(e.target.value)}
                                placeholder="Department"
                            />
                            <button
                                className="ghost-button"
                                type="button"
                                onClick={() =>
                                    runRequest({
                                        method: "GET",
                                        path: `/api/staff/employees/department/${employeeDepartmentFilter}`,
                                        onSuccess: (data) => setEmployeeResults(toEmployeeList(data)),
                                    })
                                }
                            >
                                Get by department
                            </button>
                        </div>
                    </div>
                    <div className="panel__section">
                        <h3>Employee results</h3>
                        {employeeResults.length ? (
                            <div className="employee-list">
                                {employeeResults.map((employee) => (
                                    <div className="employee-card" key={employee.id}>
                                        <div className="employee-card__name">
                                            {employee.lastName} {employee.firstName} {employee.middleName ?? ""}
                                        </div>
                                        <div className="employee-card__meta">
                                            <span>{employee.position}</span>
                                            <span>{employee.department}</span>
                                            <span>{employee.status}</span>
                                        </div>
                                        <div className="employee-card__id">{employee.id}</div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="hint">Run a lookup to show employee cards.</div>
                        )}
                    </div>
                    <div className="panel__section">
                        <h3>Update status</h3>
                        <div className="inline-row">
                            <input
                                value={employeeStatusId}
                                onChange={(e) => setEmployeeStatusId(e.target.value)}
                                placeholder="Employee UUID"
                            />
                            <select
                                value={employeeStatusUpdate}
                                onChange={(e) => setEmployeeStatusUpdate(e.target.value)}
                            >
                                {EMPLOYEE_STATUSES.map((status) => (
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
                                        path: `/api/staff/employees/${employeeStatusId}/status`,
                                        query: {status: employeeStatusUpdate},
                                    })
                                }
                            >
                                Update status
                            </button>
                        </div>
                    </div>
                </div>

                <div className="panel">
                    <div className="panel__title">Shift management</div>
                    <div className="panel__section">
                        <h3>Create shift schedule</h3>
                        <div className="form-grid">
                            <label>
                                Employee UUID
                                <input
                                    value={shiftEmployeeId}
                                    onChange={(e) => setShiftEmployeeId(e.target.value)}
                                    placeholder="Employee UUID"
                                />
                            </label>
                            <label>
                                Shift date
                                <input
                                    type="date"
                                    value={shiftDate}
                                    onChange={(e) => setShiftDate(e.target.value)}
                                />
                            </label>
                            <label>
                                Planned start
                                <input
                                    type="datetime-local"
                                    value={shiftStart}
                                    onChange={(e) => setShiftStart(e.target.value)}
                                />
                            </label>
                            <label>
                                Planned end
                                <input
                                    type="datetime-local"
                                    value={shiftEnd}
                                    onChange={(e) => setShiftEnd(e.target.value)}
                                />
                            </label>
                            <label>
                                Shift type
                                <select value={shiftType} onChange={(e) => setShiftType(e.target.value)}>
                                    {SHIFT_TYPES.map((type) => (
                                        <option key={type} value={type}>
                                            {type}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <label>
                                Location
                                <input
                                    value={shiftLocation}
                                    onChange={(e) => setShiftLocation(e.target.value)}
                                    placeholder="Casino floor"
                                />
                            </label>
                            <label>
                                Created by (UUID)
                                <input
                                    value={shiftCreatedBy}
                                    onChange={(e) => setShiftCreatedBy(e.target.value)}
                                    placeholder="Manager UUID"
                                />
                            </label>
                            <label className="form-span">
                                Notes
                                <textarea
                                    value={shiftNotes}
                                    onChange={(e) => setShiftNotes(e.target.value)}
                                    placeholder="Extra notes"
                                />
                            </label>
                        </div>
                        <button
                            className="primary-button"
                            type="button"
                            onClick={() =>
                                runRequest({
                                    method: "POST",
                                    path: "/api/staff/shifts",
                                    body: {
                                        employeeId: shiftEmployeeId,
                                        shiftDate,
                                        plannedStartTime: toIso(shiftStart),
                                        plannedEndTime: toIso(shiftEnd),
                                        shiftType,
                                        location: shiftLocation || undefined,
                                        createdBy: shiftCreatedBy || undefined,
                                        notes: shiftNotes || undefined,
                                    },
                                })
                            }
                        >
                            Create schedule
                        </button>
                    </div>
                    <div className="panel__section">
                        <h3>Shift actions</h3>
                        <div className="inline-row">
                            <input
                                value={shiftPublishId}
                                onChange={(e) => setShiftPublishId(e.target.value)}
                                placeholder="Shift UUID"
                            />
                            <button
                                className="ghost-button"
                                type="button"
                                onClick={() =>
                                    runRequest({
                                        method: "POST",
                                        path: `/api/staff/shifts/${shiftPublishId}/publish`,
                                    })
                                }
                            >
                                Publish
                            </button>
                        </div>
                        <div className="inline-row">
                            <input
                                value={shiftConfirmId}
                                onChange={(e) => setShiftConfirmId(e.target.value)}
                                placeholder="Shift UUID"
                            />
                            <input
                                value={shiftConfirmedBy}
                                onChange={(e) => setShiftConfirmedBy(e.target.value)}
                                placeholder="Confirmed by UUID"
                            />
                            <button
                                className="ghost-button"
                                type="button"
                                onClick={() =>
                                    runRequest({
                                        method: "POST",
                                        path: `/api/staff/shifts/${shiftConfirmId}/confirm`,
                                        query: {confirmedBy: shiftConfirmedBy},
                                    })
                                }
                            >
                                Confirm
                            </button>
                        </div>
                        <div className="inline-row">
                            <input
                                value={shiftReassignId}
                                onChange={(e) => setShiftReassignId(e.target.value)}
                                placeholder="Shift UUID"
                            />
                            <input
                                value={shiftReassignEmployeeId}
                                onChange={(e) => setShiftReassignEmployeeId(e.target.value)}
                                placeholder="New employee UUID"
                            />
                            <button
                                className="ghost-button"
                                type="button"
                                onClick={() =>
                                    runRequest({
                                        method: "POST",
                                        path: `/api/staff/shifts/${shiftReassignId}/reassign`,
                                        query: {newEmployeeId: shiftReassignEmployeeId},
                                    })
                                }
                            >
                                Reassign
                            </button>
                        </div>
                    </div>
                    <div className="panel__section">
                        <h3>Availability & lookup</h3>
                        <div className="inline-row">
                            <input
                                type="date"
                                value={availabilityStart}
                                onChange={(e) => setAvailabilityStart(e.target.value)}
                            />
                            <input
                                type="date"
                                value={availabilityEnd}
                                onChange={(e) => setAvailabilityEnd(e.target.value)}
                            />
                            <button
                                className="ghost-button"
                                type="button"
                                onClick={() =>
                                    runRequest({
                                        method: "GET",
                                        path: "/api/staff/shifts/availability",
                                        query: {startDate: availabilityStart, endDate: availabilityEnd},
                                    })
                                }
                            >
                                Get availability
                            </button>
                        </div>
                        <div className="inline-row">
                            <input
                                value={shiftEmployeeFilterId}
                                onChange={(e) => setShiftEmployeeFilterId(e.target.value)}
                                placeholder="Employee UUID"
                            />
                            <button
                                className="ghost-button"
                                type="button"
                                onClick={() =>
                                    runRequest({
                                        method: "GET",
                                        path: `/api/staff/shifts/employee/${shiftEmployeeFilterId}`,
                                    })
                                }
                            >
                                Shifts by employee
                            </button>
                        </div>
                        <div className="inline-row">
                            <input
                                type="date"
                                value={shiftRangeStart}
                                onChange={(e) => setShiftRangeStart(e.target.value)}
                            />
                            <input
                                type="date"
                                value={shiftRangeEnd}
                                onChange={(e) => setShiftRangeEnd(e.target.value)}
                            />
                            <button
                                className="ghost-button"
                                type="button"
                                onClick={() =>
                                    runRequest({
                                        method: "GET",
                                        path: "/api/staff/shifts",
                                        query: {startDate: shiftRangeStart, endDate: shiftRangeEnd},
                                    })
                                }
                            >
                                Shifts by date range
                            </button>
                        </div>
                        <div className="inline-row">
                            <input
                                value={shiftId}
                                onChange={(e) => setShiftId(e.target.value)}
                                placeholder="Shift UUID"
                            />
                            <button
                                className="ghost-button"
                                type="button"
                                onClick={() =>
                                    runRequest({
                                        method: "GET",
                                        path: `/api/staff/shifts/${shiftId}`,
                                    })
                                }
                            >
                                Get shift by ID
                            </button>
                        </div>
                    </div>
                </div>

                <div className="panel">
                    <div className="panel__title">Work time</div>
                    <div className="panel__section">
                        <h3>Clock in</h3>
                        <div className="inline-row">
                            <input
                                value={workTimeEmployeeId}
                                onChange={(e) => setWorkTimeEmployeeId(e.target.value)}
                                placeholder="Employee UUID"
                            />
                            <input
                                value={workTimeDeviceId}
                                onChange={(e) => setWorkTimeDeviceId(e.target.value)}
                                placeholder="Device ID"
                            />
                            <button
                                className="primary-button"
                                type="button"
                                onClick={() =>
                                    runRequest({
                                        method: "POST",
                                        path: "/api/staff/work-time/clock-in",
                                        body: {
                                            employeeId: workTimeEmployeeId,
                                            deviceId: workTimeDeviceId || undefined,
                                        },
                                    })
                                }
                            >
                                Clock in
                            </button>
                        </div>
                    </div>
                    <div className="panel__section">
                        <h3>Clock out</h3>
                        <div className="inline-row">
                            <input
                                value={workTimeClockOutEmployeeId}
                                onChange={(e) => setWorkTimeClockOutEmployeeId(e.target.value)}
                                placeholder="Employee UUID"
                            />
                            <input
                                value={workTimeClockOutDeviceId}
                                onChange={(e) => setWorkTimeClockOutDeviceId(e.target.value)}
                                placeholder="Device ID"
                            />
                            <button
                                className="primary-button"
                                type="button"
                                onClick={() =>
                                    runRequest({
                                        method: "POST",
                                        path: "/api/staff/work-time/clock-out",
                                        body: {
                                            employeeId: workTimeClockOutEmployeeId,
                                            deviceId: workTimeClockOutDeviceId || undefined,
                                        },
                                    })
                                }
                            >
                                Clock out
                            </button>
                        </div>
                    </div>
                    <div className="panel__section">
                        <h3>Work time records</h3>
                        <div className="inline-row">
                            <input
                                value={workTimeHistoryEmployeeId}
                                onChange={(e) => setWorkTimeHistoryEmployeeId(e.target.value)}
                                placeholder="Employee UUID"
                            />
                            <input
                                type="datetime-local"
                                value={workTimeHistoryStart}
                                onChange={(e) => setWorkTimeHistoryStart(e.target.value)}
                            />
                            <input
                                type="datetime-local"
                                value={workTimeHistoryEnd}
                                onChange={(e) => setWorkTimeHistoryEnd(e.target.value)}
                            />
                            <button
                                className="ghost-button"
                                type="button"
                                onClick={() =>
                                    runRequest({
                                        method: "GET",
                                        path: `/api/staff/work-time/employee/${workTimeHistoryEmployeeId}`,
                                        query: {
                                            startDate: toIso(workTimeHistoryStart),
                                            endDate: toIso(workTimeHistoryEnd),
                                        },
                                    })
                                }
                            >
                                Fetch records
                            </button>
                        </div>
                        <div className="inline-row">
                            <input
                                value={workTimeRecordId}
                                onChange={(e) => setWorkTimeRecordId(e.target.value)}
                                placeholder="Record UUID"
                            />
                            <button
                                className="ghost-button"
                                type="button"
                                onClick={() =>
                                    runRequest({
                                        method: "GET",
                                        path: `/api/staff/work-time/${workTimeRecordId}`,
                                    })
                                }
                            >
                                Get record by ID
                            </button>
                        </div>
                        <button
                            className="ghost-button"
                            type="button"
                            onClick={() =>
                                runRequest({
                                    method: "POST",
                                    path: "/api/staff/work-time/check-missing-clock-outs",
                                })
                            }
                        >
                            Check missing clock-outs
                        </button>
                    </div>
                </div>

                <div className="panel">
                    <div className="panel__title">Violation history</div>
                    <div className="panel__section">
                        <h3>Search violations</h3>
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
                                Department
                                <input
                                    value={violationDepartment}
                                    onChange={(e) => setViolationDepartment(e.target.value)}
                                    placeholder="Department"
                                />
                            </label>
                            <label>
                                Start date
                                <input
                                    type="datetime-local"
                                    value={violationStart}
                                    onChange={(e) => setViolationStart(e.target.value)}
                                />
                            </label>
                            <label>
                                End date
                                <input
                                    type="datetime-local"
                                    value={violationEnd}
                                    onChange={(e) => setViolationEnd(e.target.value)}
                                />
                            </label>
                            <label className="form-span">
                                Violation type (optional)
                                <input
                                    value={violationType}
                                    onChange={(e) => setViolationType(e.target.value)}
                                    placeholder="Type name"
                                />
                            </label>
                        </div>
                        <button
                            className="primary-button"
                            type="button"
                            onClick={() =>
                                runRequest({
                                    method: "POST",
                                    path: "/api/staff/violation-history/search",
                                    body: {
                                        employeeId: violationEmployeeId || undefined,
                                        department: violationDepartment || undefined,
                                        startDate: toIso(violationStart),
                                        endDate: toIso(violationEnd),
                                        violationType: violationType || undefined,
                                    },
                                })
                            }
                        >
                            Search violations
                        </button>
                    </div>
                    <div className="panel__section">
                        <h3>Quick filters</h3>
                        <div className="inline-row">
                            <input
                                value={violationHistoryEmployeeId}
                                onChange={(e) => setViolationHistoryEmployeeId(e.target.value)}
                                placeholder="Employee UUID"
                            />
                            <button
                                className="ghost-button"
                                type="button"
                                onClick={() =>
                                    runRequest({
                                        method: "GET",
                                        path: `/api/staff/violation-history/employee/${violationHistoryEmployeeId}`,
                                    })
                                }
                            >
                                By employee
                            </button>
                        </div>
                        <div className="inline-row">
                            <input
                                value={violationHistoryDepartment}
                                onChange={(e) => setViolationHistoryDepartment(e.target.value)}
                                placeholder="Department"
                            />
                            <button
                                className="ghost-button"
                                type="button"
                                onClick={() =>
                                    runRequest({
                                        method: "GET",
                                        path: `/api/staff/violation-history/department/${violationHistoryDepartment}`,
                                    })
                                }
                            >
                                By department
                            </button>
                        </div>
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

export default StaffPage;
