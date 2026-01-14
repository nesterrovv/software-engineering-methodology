import './header.scss'
import {NavLink} from "react-router-dom";
import {useAuth} from "../../auth/AuthContext.tsx";

const Header = () => {
    const linkClass = ({isActive}: { isActive: boolean }) => (isActive ? "active" : "");
    const {username, baseUrl, logout} = useAuth();

    return (
        <div className='header'>
            <div className="header__nav">
                <NavLink to="/incidents" className={linkClass}>Инциденты</NavLink>
                <NavLink to="/security" className={linkClass}>Безопасность</NavLink>
                <NavLink to="/finance" className={linkClass}>Финансы</NavLink>
                <NavLink to="/staff" className={linkClass}>Персонал</NavLink>
            </div>
            <div className="header__auth">
                <span className="header__badge">{username ?? "гость"}</span>
                <span className="header__badge">{baseUrl ? baseUrl : "прокси"}</span>
                <button className="header__logout" type="button" onClick={logout}>
                    Выйти
                </button>
            </div>
        </div>
    )
}
export default Header;
