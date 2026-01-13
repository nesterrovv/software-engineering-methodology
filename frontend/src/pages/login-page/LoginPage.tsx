import {useState} from "react";
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

    const handleSubmit = async (event: React.FormEvent) => {
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
                setError("Invalid credentials or access denied.");
                return;
            }
            login(username, token, baseUrl);
            const target = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname;
            navigate(target || "/incidents", {replace: true});
        } catch {
            setError("Network error. Check the API base URL or proxy.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-page">
            <form className="login-card" onSubmit={handleSubmit}>
                <div className="login-card__header">
                    <div className="login-eyebrow">Casino MIS</div>
                    <h1>Sign in</h1>
                    <p>Use your Basic-auth credentials. Leave base URL empty to use the proxy.</p>
                </div>
                <div className="login-card__fields">
                    <label>
                        Username
                        <input
                            value={username}
                            onChange={(event) => setUsername(event.target.value)}
                            placeholder="admin"
                        />
                    </label>
                    <label>
                        Password
                        <input
                            type="password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            placeholder="admin"
                        />
                    </label>
                    <label>
                        API base URL (optional)
                        <input
                            value={baseUrl}
                            onChange={(event) => setBaseUrl(event.target.value)}
                            placeholder="http://localhost:8080"
                        />
                    </label>
                </div>
                {error ? <div className="login-error">{error}</div> : null}
                <button className="primary-button" type="submit" disabled={isLoading}>
                    {isLoading ? "Signing in..." : "Sign in"}
                </button>
            </form>
        </div>
    );
};

export default LoginPage;
