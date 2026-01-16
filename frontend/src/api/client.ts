export type ApiError = {
    status: number;
    message: string;
};

const normalizeBaseUrl = (baseUrl: string) => baseUrl.trim().replace(/\/+$/, "");

export const buildApiUrl = (baseUrl: string, path: string) => {
    if (path.startsWith("http://") || path.startsWith("https://")) {
        return path;
    }
    if (!baseUrl) {
        return path;
    }
    const cleanBase = normalizeBaseUrl(baseUrl);
    if (path.startsWith("/")) {
        return `${cleanBase}${path}`;
    }
    return `${cleanBase}/${path}`;
};

const parseJson = async <T>(response: Response): Promise<T> => {
    if (response.status === 204) {
        return undefined as T;
    }
    const text = await response.text();
    if (!text) {
        return undefined as T;
    }
    return JSON.parse(text) as T;
};

export const apiRequest = async <T>(
    baseUrl: string,
    token: string | null,
    path: string,
    options: RequestInit = {}
): Promise<T> => {
    const url = buildApiUrl(baseUrl, path);
    const headers = new Headers(options.headers || {});

    if (token) {
        headers.set("Authorization", token);
    }

    if (options.body && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
    }

    const response = await fetch(url, {
        ...options,
        headers,
    });

    if (!response.ok) {
        let message = `HTTP ${response.status}`;
        try {
            const text = await response.text();
            if (text) {
                message = text;
            }
        } catch {
            // ignore parsing errors
        }
        throw {status: response.status, message} satisfies ApiError;
    }

    return parseJson<T>(response);
};
