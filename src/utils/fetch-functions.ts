import type { User } from "../types/user";
import { Transaction } from "../types/transaction"; // or adjust the path as needed for your file structure
import { CreateTransactionDto } from "../types/transaction";
import { Partner } from "../types/partner";
import { Event } from "../types/event";

export async function fetchLoginData(userData: {
  email: string;
  password: string;
}) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
      credentials: "include",
    }
  );
  return response;
}

export async function fetchRegisterData(userData: {
  email: string;
  password: string;
}) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/auth/register`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    }
  );
  return response;
}

export async function fetchVerifyEmail(token: string) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/mailing/verify-email/${token}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    }
  );
  return response;
}

export async function fetchLogout() {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/auth/logout`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    }
  );
  return response;
}

export async function validateToken() {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });
  if (!response.ok) return null;
  console.log(response);
  return response.json();
}

// fetch Partner functions

export const fetchGetPartners = async () => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/partners`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch partners");
  const json = await res.json();
  return json.data; // <-- Make sure to return the array!
};

export const fetchGetpartner = async (id: string) => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/partners/${id}`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch partner details");
  const json = await res.json();
  return json.data;
};

export const fetchUpdatePartner = async ({ id, data }: { id: number; data: Partial<Partner> }) => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/partners/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to update partner");
  return res.json();
};

export async function fetchCreatePartner(data: {
  firstName: string;
  lastName: string;
  additionalInfo?: string;
  email?: string;
  phone?: string;
}) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/partners`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create partner");
  const json = await res.json();
  return json.data;
}

// Fetch user data by ID
export async function fetchGetUser(userId: number): Promise<Response> {
  return fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${userId}`, {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });
}

// Update user data by ID
export async function fetchUpdateUser(user: User) {
  return fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${user.id}`, {
    method: "PUT",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
  });
}

// Update user password by ID
export async function fetchUpdateUserPassword(userId: number, oldPassword: string, newPassword: string) {
  return fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${userId}/password`, {
    method: "PUT",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ oldPassword, newPassword }),
  });
}

// Fetch all buckets for a user
export async function fetchGetBuckets() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/buckets`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch buckets");
  const json = await res.json();
  return json.data; // Adjust if your API returns a different structure
}

// Fetch a single bucket by ID
export async function fetchGetBucket(id: number) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/buckets/${id}`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch bucket");
  const json = await res.json();
  return json.data;
}

// Fetch all transactions for a bucket
export async function fetchGetTransactions(bucketId: number) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/transactions/forbucket/${bucketId}`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch transactions");
  const json = await res.json();
  return json.data; // Adjust if your API returns a different structure
}

// Fetch all words for a sentence
export async function fetchWordsForSentence(sentenceId: number) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/words/forsentence/${sentenceId}`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch words");
  const json = await res.json();
  return json.data;
}

// Update word partner by ID
export async function fetchUpdateWordPartner(wordId: number, partnerId: number | null) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/words/${wordId}/partner`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ partnerId }),
  });
  if (!res.ok) throw new Error("Failed to update partner");
  return res.json();
}

// Create a transaction
export async function fetchCreateTransaction(data: CreateTransactionDto) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/transactions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create transaction");
  const json = await res.json();
  return json.data;
}

// Update a transaction
export async function fetchUpdateTransaction(id: number, transaction: Omit<Transaction, "id">) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/transactions/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(transaction),
  });
  if (!res.ok) throw new Error("Failed to update transaction");
  const json = await res.json();
  return json.data;
}

// Fetch a single transaction by ID
export async function fetchGetTransaction(id: number) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/transactions/${id}`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch transaction");
  const json = await res.json();
  return json.data;
}

// fetch Event functions

export const fetchGetEvents = async () => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/events`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch events");
  const json = await res.json();
  return json.data; // <-- Make sure to return the array!
};

export const fetchGetEvent = async (id: string) => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/events/${id}`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch event details");
  return res.json();
};

export const fetchUpdateEvent = async ({ id, data }: { id: number; data: Partial<Event> }) => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/events/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to update event");
  return res.json();
};

export async function fetchCreateEvent(data: {
  name: string;
  begin: string;
  end: string;
}) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create event");
  const json = await res.json();
  return json.data;
}

// Import functions
export async function fetchCreateImport(data: {
  fileName: string;
  fileContent: string;
  separator: string;
  bucketId: number;
  mappings: { csvHeader: string; fieldName: string }[];
}) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/imports`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create import");
  const json = await res.json();
  return json;
}

export async function fetchGetImports() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/imports`, {
    credentials: "include"
  });
  if (!res.ok) throw new Error("Failed to fetch imports");
  const json = await res.json();
  return json.data || json;
}

export async function fetchGetImport(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/imports/${id}`, {
    credentials: "include"
  });
  if (!res.ok) throw new Error("Failed to fetch import details");
  const json = await res.json();
  return json.data || json;
}