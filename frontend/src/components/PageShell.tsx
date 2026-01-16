import type {ReactNode} from "react";
type PageShellProps = {
    title: string;
    subtitle?: string;
    className?: string;
    footerText?: string;
    children: ReactNode;
};

const PageShell = ({title, subtitle, className, footerText, children}: PageShellProps) => {
    return (
        <div className={`page ${className ?? ""}`.trim()}>
            <div className="container">
                <header className="page-header">
                    <h1>{title}</h1>
                    {subtitle ? <p>{subtitle}</p> : null}
                </header>
                {children}
                <footer className="page-footer">
                    <p>{footerText ?? "© 2025 Казино - Все права защищены"}</p>
                </footer>
            </div>
        </div>
    );
};

export default PageShell;
