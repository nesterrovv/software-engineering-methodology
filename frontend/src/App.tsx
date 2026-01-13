import {Route, Routes} from "react-router-dom";
import MainLayout from "./layouts/MainLayout.tsx";
import IncidentsPage from "./pages/incidents-page/IncidentsPage.tsx";
import SecurityPage from "./pages/security-page/SecurityPage.tsx";
import FinancePage from "./pages/finance-page/FinancePage.tsx";
import StaffPage from "./pages/staff-page/StaffPage.tsx";

function App() {
    return (
        <>
            <Routes>
                <Route path='/' element={<MainLayout/>}>
                    <Route index element={<IncidentsPage/>}/>
                    <Route path="incidents" element={<IncidentsPage/>}/>
                    <Route path="security" element={<SecurityPage/>}/>
                    <Route path="finance" element={<FinancePage/>}/>
                    <Route path="staff" element={<StaffPage/>}/>
                </Route>
            </Routes>
        </>

    );
}

export default App
