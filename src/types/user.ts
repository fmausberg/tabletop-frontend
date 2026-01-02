export interface User {
    id: number;
    email: string;
    verifiedMail: boolean;
    password?: string; // usually not sent to frontend, but included for completeness
    firstName?: string;
    lastName?: string;
    birthDate?: string; // ISO string
    createdAt: string;  // ISO string
    updatedAt: string;  // ISO string
}