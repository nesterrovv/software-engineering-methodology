import './header.scss'
import {NavLink} from "react-router-dom";

const Header = () => {
    const linkClass = ({isActive}: { isActive: boolean }) => (isActive ? "active" : "");

    return (
        <div className='header'>
            <NavLink to="/incidents" className={linkClass}>Incidents</NavLink>
            <NavLink to="/security" className={linkClass}>Security</NavLink>
            <NavLink to="/finance" className={linkClass}>Finance</NavLink>
            <NavLink to="/staff" className={linkClass}>Staff</NavLink>
        </div>
    )
}
export default Header;
