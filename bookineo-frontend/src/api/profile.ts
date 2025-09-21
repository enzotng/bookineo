// src/api/profile.ts
import type { UserProfile, UpdateProfileRequest } from "../types/profile";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
const USERS_BASE = `${API_BASE_URL}/users`;
const PROFILE_URL = `${USERS_BASE}/profile`;

function authHeaders(): Record<string, string> {
    const h: Record<string, string> = {};
    const t = localStorage.getItem("access_token") || localStorage.getItem("authToken") || localStorage.getItem("token");
    if (t) h.Authorization = `Bearer ${t}`;
    return h;
}

function jsonHeaders(): HeadersInit {
    return { "Content-Type": "application/json", ...authHeaders() };
}

class ProfileAPI {
    async getProfile(): Promise<UserProfile> {
        const res = await fetch(PROFILE_URL, { method: "GET", headers: authHeaders() });
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
    }

    async updateProfile(updates: UpdateProfileRequest): Promise<UserProfile> {
        const payload: Record<string, unknown> = {};
        const toNull = (v?: string) => (v !== undefined && v.trim() === "" ? undefined : v);

        if (updates.first_name !== undefined) {
            const v = toNull(updates.first_name);
            if (v !== undefined) payload.first_name = v;
        }
        if (updates.last_name !== undefined) {
            const v = toNull(updates.last_name);
            if (v !== undefined) payload.last_name = v;
        }
        if (updates.birth_date !== undefined) {
            const v = toNull(updates.birth_date);
            if (v !== undefined) payload.birth_date = v;
        }
        if (updates.newsletter !== undefined) payload.newsletter = updates.newsletter;

        const res = await fetch(PROFILE_URL, {
            method: "PUT",
            headers: jsonHeaders(),
            body: JSON.stringify(payload),
        });
        if (!res.ok) {
            const t = await res.text().catch(() => "");
            throw new Error(`HTTP error! status: ${res.status} - ${t}`);
        }
        return res.json();
    }

    async updateEmailNotifications(_enabled: boolean): Promise<UserProfile> {
        throw new Error("Endpoint /users/:id/preferences non implémenté côté serveur.");
    }

    async deleteAccount(): Promise<void> {
        const res = await fetch(USERS_BASE, { method: "DELETE", headers: authHeaders() });
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    }
}

export const profileAPI = new ProfileAPI();
