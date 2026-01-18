export type Employee = {
    id: string;
    firstName: string;
    lastName: string;
    middleName?: string | null;
    position?: string | null;
    department?: string | null;
    status?: string | null;
};

export type Incident = {
    id: string;
    type: string;
    location?: string | null;
    occurredAt?: string | null;
    description?: string | null;
    status?: string | null;
};

export type Complaint = {
    id: string;
    category?: string | null;
    description?: string | null;
    reportedAt?: string | null;
    source?: string | null;
    status?: string | null;
};

export type Violation = {
    id: string;
    employeeId: string;
    type?: string | null;
    description?: string | null;
    occurredAt?: string | null;
    status?: string | null;
};

export type NotificationItem = {
    id: string;
    recipientId: string;
    type: string;
    title: string;
    message: string;
    priority: string;
    status: string;
    createdAt?: string | null;
};

export type ContactEvent = {
    id: string;
    personId1: string;
    personId2: string;
    contactStartTime?: string | null;
    contactEndTime?: string | null;
    durationSeconds?: number | null;
    location?: string | null;
    status?: string | null;
    suspicious?: boolean | null;
    suspiciousActivityId?: string | null;
};

export type FraudRecord = {
    id: string;
    personId: string;
    fullName: string;
    description?: string | null;
    photoUrl?: string | null;
    fraudType: string;
    addedAt?: string | null;
    addedBy?: string | null;
    lastCheckedAt?: string | null;
    matchCount?: number | null;
    status?: string | null;
};

export type SuspiciousActivity = {
    id: string;
    shortDescription?: string | null;
    location?: string | null;
    occurredAt?: string | null;
    risk?: string | null;
    status?: string | null;
};

export type HallStatus = {
    totalVisitors?: number | null;
    totalStaff?: number | null;
    activeTables?: number | null;
    anomaliesCount?: number | null;
    recentActivities?: Array<{
        type: string;
        description: string;
        location?: string | null;
        timestamp?: string | null;
    }>;
};

export type HallSession = {
    id: string;
    securityOfficerId: string;
    startedAt?: string | null;
    endedAt?: string | null;
    status?: string | null;
    activeVisitors?: number | null;
    activeStaff?: number | null;
    anomaliesDetected?: number | null;
    notes?: string | null;
};

export type CashOperation = {
    id: string;
    cashDeskId: string;
    amount: string | number;
    type: string;
    currency?: string | null;
    operatedAt?: string | null;
};

export type CashReconciliation = {
    id: string;
    cashDeskId: string;
    shiftStart?: string | null;
    shiftEnd?: string | null;
    expectedBalance?: string | number | null;
    actualBalance?: string | number | null;
    discrepancy?: string | number | null;
    status?: string | null;
    createdAt?: string | null;
    notes?: string | null;
};

export type Anomaly = {
    id: string;
    cashOperationId?: string | null;
    type?: string | null;
    riskLevel?: string | null;
    reason?: string | null;
    amount?: string | number | null;
    detectedAt?: string | null;
    status?: string | null;
};

export type FinancialReport = {
    id: string;
    periodStart: string;
    periodEnd: string;
    csvUrl?: string | null;
};

export type ReportResponse = {
    id: string;
    type: string;
    generatedAt?: string | null;
    periodStart?: string | null;
    periodEnd?: string | null;
    reportData?: string | null;
    status?: string | null;
};

export type WorkTimeRecord = {
    id: string;
    employeeId: string;
    clockInTime?: string | null;
    clockOutTime?: string | null;
    workedMinutes?: number | null;
    status?: string | null;
    isLate?: boolean | null;
    hasOvertime?: boolean | null;
};

export type ViolationHistoryResponse = {
    violations?: Array<{
        id: string;
        employeeId?: string | null;
        employeeName?: string | null;
        violationType?: string | null;
        description?: string | null;
        occurredAt?: string | null;
        status?: string | null;
        severity?: string | null;
    }>;
    summary?: {
        totalViolations?: number | null;
        byType?: Record<string, number> | null;
        byDepartment?: Record<string, number> | null;
        employeesWithViolations?: number | null;
    };
};

export type ShiftSchedule = {
    id: string;
    employeeId: string;
    shiftDate?: string | null;
    plannedStartTime?: string | null;
    plannedEndTime?: string | null;
    status?: string | null;
    shiftType?: string | null;
    location?: string | null;
};
