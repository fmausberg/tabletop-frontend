export interface Partner {
    id: number;
    firstName: string;
    lastName: string;
    additionalInfo?: string;
    email?: string;
    phone?: string;
    createdAt: string; // ISO date string
    updatedAt: string; // ISO date string
}