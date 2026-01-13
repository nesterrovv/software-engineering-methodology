import './header.scss'
import {NavLink} from "react-router-dom";
import {useAuth} from "../../auth/AuthContext.tsx";

const Header = () => {
    const linkClass = ({isActive}: { isActive: boolean }) => (isActive ? "active" : "");
    const {username, baseUrl, logout} = useAuth();

    return (
        <div className='header'>
            <div className="header__nav">
                <NavLink to="/incidents" className={linkClass}>Incidents</NavLink>
                <NavLink to="/security" className={linkClass}>Security</NavLink>
                <NavLink to="/finance" className={linkClass}>Finance</NavLink>
                <NavLink to="/staff" className={linkClass}>Staff</NavLink>
            </div>
            <div className="header__auth">
                <span className="header__badge">{username ?? "anonymous"}</span>
                <span className="header__badge">{baseUrl ? baseUrl : "proxy"}</span>
                <button className="header__logout" type="button" onClick={logout}>
                    Log out
                </button>
            </div>
        </div>
    )
}
export default Header;
