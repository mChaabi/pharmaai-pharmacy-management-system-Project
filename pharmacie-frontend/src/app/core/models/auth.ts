// core/models/auth.ts
export interface LoginRequest {
    email: string;
    password: string;
}

export interface AuthResponse {
    token: string;
    email: string;
    nomComplet: string;
    role: 'ADMIN' | 'PHARMACIEN';
}
