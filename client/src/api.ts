const BASE = '/api';

const token = () => localStorage.getItem('token');
const authHeaders = (extra: Record<string, string> = {}): Record<string, string> => {
  const accessToken = token();
  return accessToken ? { Authorization: `Bearer ${accessToken}`, ...extra } : extra;
};

async function req<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(BASE + path, options);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as any)?.message ?? `Request failed: ${res.status}`);
  }
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}
const json = (body: any) => ({ 'Content-Type': 'application/json' });

// ── Types ────────────────────────────────────────────────
export type Role = 'customer' | 'admin';
export interface AuthUser {
  user_id: number;
  email: string;
  name: string;
  role: Role;
}
export interface AuthResponse {
  access_token: string;
  user: AuthUser;
}
export interface Restaurant {
  restaurant_id: number;
  name: string;
  address: string;
  image_filename: string | null;
  menuItems?: MenuItem[];
  comments?: Comment[];
}

export interface MenuItem {
  menu_id: number;
  name: string;
  price: number;
}
export interface Comment {
  comment_id: number;
  name: string;
  comment: string;
  created_at: string;
}
export interface CaptchaData {
  token: string;
  svg: string;
}
export interface User {
  user_id: number;
  email: string;
  name: string;
  role: Role;
}
export interface NutritionItem {
  nutrition_id: number;
  restaurant_id: number;
  item_name: string;
  calories: number | null;
  protein: number | null;
  sodium: number | null;
  restaurant?: { restaurant_id: number; name: string };
}
export interface Paged<T> {
  results: T[];
  total: number;
  totalPages: number;
}

// ── Auth ─────────────────────────────────────────────────
export const login = (email: string, password: string) =>
  req<AuthResponse>('/auth/login', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

export const register = (data: { email: string; name: string; password: string }) =>
  req<AuthResponse>('/auth/register', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

// ── Restaurants ──────────────────────────────────────────
export const getRestaurants = async () => {
  const data = await req<any>('/restaurants');
  return Array.isArray(data) ? (data as Restaurant[]) : [];
};
export const getRestaurant = (id: number) => req<Restaurant>(`/restaurants/${id}`);
export const searchRestaurants = (keyword: string, category: string, page: number) =>
  req<Paged<Restaurant>>(
    `/restaurants/search?keyword=${encodeURIComponent(keyword)}&category=${encodeURIComponent(category)}&page=${page}`,
  );

export const createRestaurant = (fd: FormData) =>
  req<Restaurant>('/restaurants', { method: 'POST', headers: authHeaders(), body: fd });

export const updateRestaurant = (id: number, fd: FormData) =>
  req<Restaurant>(`/restaurants/${id}`, { method: 'PATCH', headers: authHeaders(), body: fd });

export const deleteRestaurant = (id: number) =>
  req<void>(`/restaurants/${id}`, { method: 'DELETE', headers: authHeaders() });

// ── Comments + Captcha ───────────────────────────────────
export const getCaptcha = () => req<CaptchaData>('/captcha');

export const postComment = (id: number, data: {
  name: string; comment: string; captcha_token: string; captcha_code: string;
}) => req<Comment>(`/restaurants/${id}/comments`, {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data),
});

// ── Users (admin) ────────────────────────────────────────
export const getUsers   = () => req<User[]>('/users', { headers: authHeaders() });
export const updateUser = (id: number, data: Partial<User>) =>
  req<User>(`/users/${id}`, {
    method: 'PATCH', headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(data),
  });
export const deleteUser = (id: number) =>
  req<void>(`/users/${id}`, { method: 'DELETE', headers: authHeaders() });

// ── Nutrition ────────────────────────────────────────────
export const getNutritionForRestaurant = (id: number) =>
  req<NutritionItem[]>(`/nutrition/restaurant/${id}`);

export const searchNutrition = (item: string, maxCalories: string, page: number) =>
  req<Paged<NutritionItem>>(
    `/nutrition/search?item=${encodeURIComponent(item)}&maxCalories=${encodeURIComponent(maxCalories)}&page=${page}`,
  );

export const uploadNutritionCsv = (id: number, file: File) => {
  const fd = new FormData();
  fd.append('file', file);
  return req<{ message: string; count: number }>(
    `/nutrition/restaurant/${id}/upload`,
    { method: 'POST', headers: authHeaders(), body: fd },
  );
};

export const clearNutrition = (id: number) =>
  req<void>(`/nutrition/restaurant/${id}`, { method: 'DELETE', headers: authHeaders() });
