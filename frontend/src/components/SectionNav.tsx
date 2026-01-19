import {NavLink} from "react-router-dom";
import type {SectionLink} from "../navigation/sectionLinks";

type SectionNavProps = {
    links: SectionLink[];
    className?: string;
    ariaLabel?: string;
};

const SectionNav = ({links, className, ariaLabel = "Навигация раздела"}: SectionNavProps) => {
    if (!links.length) {
        return null;
    }

    return (
        <nav className={`section-nav ${className ?? ""}`.trim()} aria-label={ariaLabel}>
            {links.map((link) => (
                <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.end}
                    className={({isActive}) => `section-nav__link${isActive ? " active" : ""}`}
                >
                    {link.label}
                </NavLink>
            ))}
        </nav>
    );
};

export default SectionNav;
