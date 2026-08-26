const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export class ApiRequestError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("nodeship_token");
}

export function setToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) window.localStorage.setItem("nodeship_token", token);
  else window.localStorage.removeItem("nodeship_token");
}

interface RequestOptions extends RequestInit {
  auth?: boolean;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { auth = false, headers, ...rest } = options;

  const finalHeaders: Record<string, string> = {
    ...(headers as Record<string, string>),
  };

  const isFormData = rest.body instanceof FormData;
  if (!isFormData) {
    finalHeaders["Content-Type"] = "application/json";
  }

  if (auth) {
    const token = getToken();
    if (token) finalHeaders["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: finalHeaders,
    cache: "no-store",
  });

  let body: any = null;
  const text = await res.text();
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = null;
    }
  }

  if (!res.ok) {
    const message = body?.message || `Request failed with status ${res.status}`;
    throw new ApiRequestError(message, res.status);
  }

  return body as T;
}

export const api = {
  get: <T>(path: string, auth = false) => request<T>(path, { method: "GET", auth }),
  post: <T>(path: string, data?: unknown, auth = false) =>
    request<T>(path, {
      method: "POST",
      auth,
      body: data instanceof FormData ? data : JSON.stringify(data ?? {}),
    }),
  patch: <T>(path: string, data?: unknown, auth = false) =>
    request<T>(path, {
      method: "PATCH",
      auth,
      body: data instanceof FormData ? data : JSON.stringify(data ?? {}),
    }),
  delete: <T>(path: string, auth = false) => request<T>(path, { method: "DELETE", auth }),
};

export function productImageUrl(filename?: string): string | null {
  if (!filename) return null;
  if (filename.startsWith("http")) return filename;
  const base = API_URL.replace(/\/api\/?$/, "");
  return `${base}/public/img/${filename}`;
}

export { API_URL };
