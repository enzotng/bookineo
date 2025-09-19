export interface User {
    id: string;
    email: string;
    password: string;
    first_name?: string | null;
    last_name?: string | null;
    birth_date?: Date | null;
    created_at: Date;
    updated_at: Date;
}
