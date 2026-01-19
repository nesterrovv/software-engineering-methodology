import {Navigate, Route, Routes} from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/login-page/LoginPage";
import SecurityPage from "./pages/security/SecurityPage";
import HallMonitoringPage from "./pages/security/HallMonitoringPage";
import SuspiciousActivityPage from "./pages/security/SuspiciousActivityPage";
import ContactDurationPage from "./pages/security/ContactDurationPage";
import ContactFrequencyPage from "./pages/security/ContactFrequencyPage";
import FraudCheckPage from "./pages/security/FraudCheckPage";
import NotificationsSettingsPage from "./pages/security/NotificationsSettingsPage";
import IncidentsPage from "./pages/incidents/IncidentsPage";
import IncidentRegistrationPage from "./pages/incidents/IncidentRegistrationPage";
import IncidentReportsPage from "./pages/incidents/IncidentReportsPage";
import ComplaintsPage from "./pages/incidents/ComplaintsPage";
import RepeatedViolationsPage from "./pages/incidents/RepeatedViolationsPage";
import ManagementReportsPage from "./pages/incidents/ManagementReportsPage";
import RegulatoryReportsPage from "./pages/incidents/RegulatoryReportsPage";
import ExportReportsPage from "./pages/incidents/ExportReportsPage";
import AllReportsPage from "./pages/reports/AllReportsPage";
import FinancePage from "./pages/finance/FinancePage";
import FinanceAnalysisPage from "./pages/finance/FinanceAnalysisPage";
import OperationsPage from "./pages/finance/OperationsPage";
import CashControlPage from "./pages/finance/CashControlPage";
import AnomalyDetectionPage from "./pages/finance/AnomalyDetectionPage";
import GameAnalysisPage from "./pages/finance/GameAnalysisPage";
import WorkTimePage from "./pages/staff/WorkTimePage";
import DisciplinaryViolationsPage from "./pages/staff/DisciplinaryViolationsPage";
import ViolationHistoryPage from "./pages/staff/ViolationHistoryPage";
import ShiftManagementPage from "./pages/staff/ShiftManagementPage";
import StaffManagementPage from "./pages/staff/StaffManagementPage";

function App() {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
                element={
                    <ProtectedRoute>
                        <Layout />
                    </ProtectedRoute>
                }
            >
                <Route index element={<Navigate to="/security" replace />} />
                <Route path="security" element={<SecurityPage />} />
                <Route path="security/hall-monitoring" element={<HallMonitoringPage />} />
                <Route path="security/suspicious-activity" element={<SuspiciousActivityPage />} />
                <Route path="security/contact-duration" element={<ContactDurationPage />} />
                <Route path="security/contact-frequency" element={<ContactFrequencyPage />} />
                <Route path="security/fraud-check" element={<FraudCheckPage />} />
                <Route path="security/notifications" element={<NotificationsSettingsPage />} />

                <Route path="incidents" element={<IncidentsPage />} />
                <Route path="incidents/register" element={<IncidentRegistrationPage />} />
                <Route path="incidents/reports" element={<Navigate to="/reports/incidents" replace />} />
                <Route path="incidents/complaints" element={<ComplaintsPage />} />
                <Route path="incidents/repeated-violations" element={<RepeatedViolationsPage />} />
                <Route path="incidents/management-reports" element={<Navigate to="/reports/management" replace />} />
                <Route path="incidents/regulatory-reports" element={<Navigate to="/reports/regulatory" replace />} />
                <Route path="reports/export" element={<ExportReportsPage />} />
                <Route path="reports/all" element={<AllReportsPage />} />
                <Route path="reports/incidents" element={<IncidentReportsPage />} />
                <Route path="reports/management" element={<ManagementReportsPage />} />
                <Route path="reports/regulatory" element={<RegulatoryReportsPage />} />
                <Route path="reports" element={<Navigate to="/reports/all" replace />} />

                <Route path="finance" element={<FinancePage />} />
                <Route path="finance/analysis" element={<FinanceAnalysisPage />} />
                <Route path="finance/operations" element={<OperationsPage />} />
                <Route path="finance/cash-control" element={<CashControlPage />} />
                <Route path="finance/anomalies" element={<AnomalyDetectionPage />} />
                <Route path="finance/game-analysis" element={<GameAnalysisPage />} />

                <Route path="staff/time-tracking" element={<WorkTimePage />} />
                <Route path="staff/management" element={<StaffManagementPage />} />
                <Route path="staff/discipline" element={<DisciplinaryViolationsPage />} />
                <Route path="staff/violations" element={<DisciplinaryViolationsPage />} />
                <Route path="staff/violation-history" element={<ViolationHistoryPage />} />
                <Route path="staff/shifts" element={<ShiftManagementPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/security" replace />} />
        </Routes>
    );
}

export default App;
