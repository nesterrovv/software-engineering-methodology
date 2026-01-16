import {NavLink, Outlet} from "react-router-dom";
import {useAuth} from "../auth/AuthContext";

const Layout = () => {
    const {username, logout} = useAuth();

    return (
        <div className="app-shell">
            <header className="header">
                <div className="container header__content">
                    <div className="header__brand">Casino MIS</div>
                    <nav className="header__nav">
                        <NavLink to="/security" className={({isActive}) => (isActive ? "active" : undefined)}>
                            Безопасность
                        </NavLink>
                        <NavLink to="/incidents" className={({isActive}) => (isActive ? "active" : undefined)}>
                            Инциденты
                        </NavLink>
                        <NavLink to="/finance" className={({isActive}) => (isActive ? "active" : undefined)}>
                            Финансы
                        </NavLink>
                        <NavLink to="/staff/time-tracking" className={({isActive}) => (isActive ? "active" : undefined)}>
                            Персонал
                        </NavLink>
                        <NavLink to="/reports/incidents" className={({isActive}) => (isActive ? "active" : undefined)}>
                            Отчёты
                        </NavLink>
                    </nav>
                    <div className="header__actions">
                        <span className="header__user">{username ?? "Пользователь"}</span>
                        <button className="secondary-button" type="button" onClick={logout}>
                            Выйти
                        </button>
                    </div>
                </div>
            </header>
            <main className="main">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
