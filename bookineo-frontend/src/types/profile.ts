// src/types/profile.ts

export interface UserProfile {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    birth_date: string; // ISO date (YYYY-MM-DD)
    notifications_email: boolean;
    avatar_url?: string;
    created_at: string; // ISO datetime
    updated_at: string; // ISO datetime
}

export interface UpdateProfileRequest {
    first_name?: string;
    last_name?: string;
    email?: string;
    birth_date?: string; // ISO date (YYYY-MM-DD)
}

export interface PreferencesRequest {
    notifications_email: boolean;
}
