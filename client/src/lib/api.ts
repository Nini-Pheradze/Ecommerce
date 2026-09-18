import axios, { AxiosError } from 'axios';

// NEXT_PUBLIC_API_URL ხანდახან Vercel-ის dashboard-ში ემატება '/api' სუფიქსის გარეშე
// (მაგ. https://shopspace-api.onrender.com ნაცვლად .../api-სი) - ამის გამო ყველა მოთხოვნა
// (მათ შორის Google login-ის ბმულიც) არასწორ endpoint-ზე მიდიოდა
function normalizeApiUrl(url: string): string {
  const trimmed = url.trim().replace(/\/+$/, '');
  return /\/api$/.test(trimmed) ? trimmed : `${trimmed}/api`;
}

export const API_URL = normalizeApiUrl(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api');
export const SERVER_ORIGIN = API_URL.replace(/\/api\/?$/, '');

export const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = window.localStorage.getItem('shopspace_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const err = error as AxiosError<{ message?: string }>;
    return err.response?.data?.message || err.message || 'Something went wrong';
  }
  if (error instanceof Error) return error.message;
  return 'Something went wrong';
}

export function productImageUrl(filename?: string | null): string | null {
  if (!filename) return null;
  // Cloudinary (და ნებისმიერი სხვა) სურათები უკვე სრული URL-ის სახით ინახება ბაზაში
  if (/^https?:\/\//i.test(filename)) return filename;
  return `${SERVER_ORIGIN}/public/img/${filename}`;
}
