import {FormEvent, useState} from "react";
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
            <form className="login-card" onSubmit={handleSubmit}>
                <div className="login-card__header">
                    <div className="login-eyebrow">Casino MIS</div>
                    <h1>Вход</h1>
                    <p>Используйте Basic-auth. Оставьте базовый URL пустым, чтобы использовать прокси.</p>
                </div>
                <div className="login-card__fields">
                    <label>
                        Логин
                        <input
                            value={username}
                            onChange={(event) => setUsername(event.target.value)}
                            placeholder="admin"
                        />
                    </label>
                    <label>
                        Пароль
                        <input
                            type="password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            placeholder="admin"
                        />
                    </label>
                    <label>
                        Базовый URL API (необязательно)
                        <input
                            value={baseUrl}
                            onChange={(event) => setBaseUrl(event.target.value)}
                            placeholder="http://localhost:8080"
                        />
                    </label>
                </div>
                {error ? <div className="login-error">{error}</div> : null}
                <button className="primary-button" type="submit" disabled={isLoading}>
                    {isLoading ? "Входим..." : "Войти"}
                </button>
            </form>
        </div>
    );
};

export default LoginPage;
