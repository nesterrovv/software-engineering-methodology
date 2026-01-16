import {useState} from "react";
import type {FormEvent} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import {useAuth} from "../../auth/AuthContext.tsx";
import "./login-page.scss";

const LoginPage = () => {
    const {login} = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [username, setUsername] = useState("admin");
    const [password, setPassword] = useState("admin");
    const [baseUrl, setBaseUrl] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setError("");
        setIsLoading(true);
        const token = `Basic ${window.btoa(`${username}:${password}`)}`;
        const base = baseUrl.replace(/\/+$/, "");
        const url = `${base}/api/security/monitoring/status`;

        try {
            const response = await fetch(url, {
                method: "GET",
                headers: {Authorization: token},
            });
            if (!response.ok) {
                setError("Неверный логин/пароль или доступ запрещен.");
                return;
            }
            login(username, token, baseUrl);
            const target = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname;
            navigate(target || "/incidents", {replace: true});
        } catch {
            setError("Ошибка сети. Проверьте базовый URL API или прокси.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="container">
                <header className="page-header">
                    <h1>Вход в систему</h1>
                    <p>Доступ к информационной системе казино.</p>
                </header>
                <section className="page-section">
                    <div className="card login-card">
                        <h3>Авторизация</h3>
                        <form onSubmit={handleSubmit}>
                            <label>
                                Логин
                                <input
                                    value={username}
                                    onChange={(event) => setUsername(event.target.value)}
                                />
                            </label>
                            <label>
                                Пароль
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                />
                            </label>
                            <label>
                                Базовый URL API (необязательно)
                                <input
                                    value={baseUrl}
                                    onChange={(event) => setBaseUrl(event.target.value)}
                                    placeholder="https://api.example.com"
                                />
                            </label>
                            {error ? <div className="login-error">{error}</div> : null}
                            <button className="primary-button" type="submit" disabled={isLoading}>
                                {isLoading ? "Входим..." : "Войти"}
                            </button>
                        </form>
                    </div>
                </section>
                <footer>
                    <p>© 2025 Казино - Все права защищены</p>
                </footer>
            </div>
        </div>
    );
};

export default LoginPage;
