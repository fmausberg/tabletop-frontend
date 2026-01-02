import { Partner } from "./partner";

export interface TransactionAttribute {
    id: number;
    key: string;
    value: string;
    transactionId: number;
    createdAt: string;
    updatedAt: string;
}

export interface Transaction {
    id: number;
    value: number;
    currency: string;
    counterpart?: string;
    description?: string;
    partner?: Partner;
    date: string;
    createdAt: string;
    updatedAt: string;
    word?: { id: number; sentenceId: number } | null;
    attributes?: TransactionAttribute[];
}

export type TransactionWrite = Omit<Transaction, "id" | "createdAt" | "updatedAt" | "attributes">;

export interface CreateTransactionDto {
    value: number;
    currency: string;
    bucketId: number;
    date: string;
    partnerId?: number | null;
    description?: string;
    counterpart?: string;
    externalId?: string;
    attributes?: { key: string; value: string }[];
}