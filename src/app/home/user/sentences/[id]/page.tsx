"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter, useParams } from "next/navigation";
import { fetchWordsForSentence } from "../../../../../utils/fetch-functions";
import PartnerSelector from "../../../../../components/partner-selector/PartnerSelector";
import { Partner } from "../../../../../types/partner";

interface Account {
    id: number;
    name: string;
    type: string;
}

interface Bucket {
    id: number;
    name: string;
    account: Account;
}

interface Word {
    id: number;
    value: number;
    currency: string;
    sentenceId: number;
    transactionId?: number | null;
    bucket: Bucket;
    partnerId?: number | null;
    partner?: Partner;
    createdAt: string;
    updatedAt: string;
}

const ACCOUNT_TYPES_MARK_YELLOW = [
    "CASHFLOW",
    "DEFERREDITEMS",
    "IS",
    "LIABILITIES",
    "RECEIVABLES",
];

const SentenceDetailsPage: React.FC = () => {
    const router = useRouter();
    const params = useParams();
    const sentenceId = params?.id ? parseInt(params.id as string, 10) : undefined;
    const queryClient = useQueryClient();
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        setIsHydrated(true);
    }, []);

    const [editRow, setEditRow] = useState<null | {
        id: number | 'new';
        value: number;
        currency: string;
        bucketId: number;
        partnerId: number | null;
    }>(null);

    const { data: words = [], isLoading, isError } = useQuery<Word[]>({
        queryKey: ["words", sentenceId],
        queryFn: () => fetchWordsForSentence(sentenceId!),
        enabled: !!sentenceId,
    });

    const { data: buckets = [] } = useQuery<Bucket[]>({
        queryKey: ["buckets"],
        queryFn: async () => {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/buckets`, { credentials: "include" });
            if (!res.ok) return [];
            const json = await res.json();
            return json.data;
        }
    });

    /*const fetchPartners = async (search: string) => {
        const partners = await fetchGetPartners();
        if (!search) return partners;
        const lower = search.toLowerCase();
        return partners.filter(
            (p: Partner) =>
                p.firstName?.toLowerCase().includes(lower) ||
                p.lastName?.toLowerCase().includes(lower) ||
                p.email?.toLowerCase().includes(lower)
        );
    };*/

    const updateWordMutation = useMutation({
        mutationFn: async (data: { id: number; value: number; currency: string; bucketId: number; partnerId: number | null }) => {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/words/${data.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error("Failed to update word");
            return res.json();
        },
        onSuccess: () => {
            setEditRow(null);
            queryClient.invalidateQueries({ queryKey: ["words", sentenceId] });
        },
        onError: (error) => {
            alert(`Error updating word: ${error.message}`);
        },
    });

    const createWordMutation = useMutation({
        mutationFn: async (data: { value: number; currency: string; bucketId: number; partnerId: number | null; sentenceId: number }) => {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/words`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error("Failed to create word");
            return res.json();
        },
        onSuccess: () => {
            setEditRow(null);
            queryClient.invalidateQueries({ queryKey: ["words", sentenceId] });
        },
        onError: (error) => {
            alert(`Error creating word: ${error.message}`);
        },
    });

    const deleteWordMutation = useMutation({
        mutationFn: async (id: number) => {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/words/${id}`, {
                method: "DELETE",
                credentials: "include",
            });
            if (!res.ok) throw new Error("Failed to delete word");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["words", sentenceId] });
        },
        onError: (error) => {
            alert(`Error deleting word: ${error.message}`);
        },
    });

    // Calculate totals
    const totals = words.reduce((acc, word) => {
        if (!acc[word.currency]) acc[word.currency] = 0;
        acc[word.currency] += word.value;
        return acc;
    }, {} as Record<string, number>);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="w-full">
                    <div className="flex items-center justify-center h-64">
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="w-full">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Booking Sentence</h1>
                            <p className="text-gray-600 mt-1">ID: {sentenceId}</p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    if (buckets.length === 0) {
                                        alert('No buckets available. Please create a bucket first.');
                                        return;
                                    }
                                    setEditRow({
                                        id: 'new',
                                        value: 0,
                                        currency: 'EUR',
                                        bucketId: buckets[0].id,
                                        partnerId: null,
                                    });
                                }}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                                + Add Word
                            </button>
                            <button
                                onClick={() => router.back()}
                                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                            >
                                Back
                            </button>
                        </div>
                    </div>
                </div>

                {isError ? (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
                        Error loading sentence details. Please try again.
                    </div>
                ) : words.length === 0 ? (
                    <div className="bg-gray-100 rounded-lg p-8 text-center">
                        <p className="text-gray-600">No words found for this sentence.</p>
                    </div>
                ) : (
                    <>
                        {/* Words Table */}
                        <div className="bg-white rounded-lg shadow overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-sm font-semibold">Amount</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold">Bucket</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold">Account</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold">Type</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold">Partner</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold">Transaction</th>
                                            <th className="px-6 py-4 text-right text-sm font-semibold">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200" suppressHydrationWarning>
                                        {words.map((word, idx) => {
                                            const isEditing = editRow?.id === word.id;
                                            const shouldHighlightPartner =
                                                ACCOUNT_TYPES_MARK_YELLOW.includes(word.bucket.account.type) &&
                                                (word.partnerId === null || word.partnerId === undefined);

                                            return (
                                                <tr key={word.id} className={`hover:bg-gray-50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                                                    <td className="px-6 py-4">
                                                        {isEditing ? (
                                                            <div className="flex gap-2">
                                                                <input
                                                                    type="number"
                                                                    step="0.01"
                                                                    value={editRow.value}
                                                                    onChange={e => setEditRow(row => row ? { ...row, value: parseFloat(e.target.value) } : row)}
                                                                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                                />
                                                                <input
                                                                    type="text"
                                                                    maxLength={3}
                                                                    value={editRow.currency}
                                                                    onChange={e => setEditRow(row => row ? { ...row, currency: e.target.value.toUpperCase() } : row)}
                                                                    className="w-16 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                                />
                                                            </div>
                                                        ) : (
                                                            <span className={`text-sm font-medium ${word.value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                                {word.value >= 0 ? '+' : ''}{word.value.toFixed(2)} {word.currency}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {isEditing ? (
                                                            <select
                                                                value={editRow.bucketId}
                                                                onChange={e => setEditRow(row => row ? { ...row, bucketId: Number(e.target.value) } : row)}
                                                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                                            >
                                                                {buckets.map(b => (
                                                                    <option key={b.id} value={b.id}>{b.name}</option>
                                                                ))}
                                                            </select>
                                                        ) : (
                                                            <span className="text-sm text-gray-900">{word.bucket.name}</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-900">{word.bucket.account.name}</td>
                                                    <td className="px-6 py-4">
                                                        <span className="inline-block px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                                            {word.bucket.account.type}
                                                        </span>
                                                    </td>
                                                    <td className={`px-6 py-4 ${shouldHighlightPartner ? "bg-yellow-100" : ""}`}
                                                    >
                                                        {isEditing ? (
                                                            <PartnerSelector
                                                                selectedPartnerId={editRow.partnerId}
                                                                onSelectPartner={(partner) => setEditRow(row => row ? { ...row, partnerId: partner?.id ?? null } : row)}
                                                                onCancel={() => { }}
                                                            />
                                                        ) : word.partner ? (
                                                            <a
                                                                href={`/home/user/partner?id=${word.partner.id}`}
                                                                className="text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium"
                                                            >
                                                                {word.partner.lastName}, {word.partner.firstName}
                                                            </a>
                                                        ) : (
                                                            <span className="text-gray-400 text-sm">No partner</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {word.transactionId ? (
                                                            <a
                                                                href={`/home/user/transactions/${word.transactionId}`}
                                                                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                                                            >
                                                                <span>Trx #{word.transactionId}</span>
                                                                <span>→</span>
                                                            </a>
                                                        ) : (
                                                            <span className="text-gray-400 text-sm">-</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        {isEditing ? (
                                                            <div className="flex justify-end gap-2">
                                                                <button
                                                                    className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50"
                                                                    onClick={() => {
                                                                        if (editRow.id === 'new') {
                                                                            createWordMutation.mutate({
                                                                                value: editRow.value,
                                                                                currency: editRow.currency,
                                                                                bucketId: editRow.bucketId,
                                                                                partnerId: editRow.partnerId,
                                                                                sentenceId: sentenceId!,
                                                                            });
                                                                        } else {
                                                                            updateWordMutation.mutate({
                                                                                id: editRow.id as number,
                                                                                value: editRow.value,
                                                                                currency: editRow.currency,
                                                                                bucketId: editRow.bucketId,
                                                                                partnerId: editRow.partnerId,
                                                                            });
                                                                        }
                                                                    }}
                                                                    disabled={updateWordMutation.isPending || createWordMutation.isPending}
                                                                    type="button"
                                                                >
                                                                    Save
                                                                </button>
                                                                <button
                                                                    className="px-3 py-1 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors text-sm font-medium"
                                                                    onClick={() => setEditRow(null)}
                                                                    type="button"
                                                                >
                                                                    Cancel
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div className="flex justify-end gap-2">
                                                                <button
                                                                    className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                                                                    onClick={() => setEditRow({
                                                                        id: word.id,
                                                                        value: word.value,
                                                                        currency: word.currency,
                                                                        bucketId: word.bucket.id,
                                                                        partnerId: word.partnerId ?? null,
                                                                    })}
                                                                    type="button"
                                                                >
                                                                    Edit
                                                                </button>
                                                                <button
                                                                    className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                                                                    onClick={() => {
                                                                        if (confirm('Are you sure you want to delete this word?')) {
                                                                            deleteWordMutation.mutate(word.id);
                                                                        }
                                                                    }}
                                                                    type="button"
                                                                >
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {isHydrated && editRow?.id === 'new' && (
                                            <tr key="new" className="bg-blue-50 hover:bg-blue-50 transition-colors border-2 border-blue-300">
                                                <td className="px-6 py-4">
                                                    <div className="flex gap-2">
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            value={editRow.value}
                                                            onChange={e => setEditRow(row => row ? { ...row, value: parseFloat(e.target.value) } : row)}
                                                            className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        />
                                                        <input
                                                            type="text"
                                                            maxLength={3}
                                                            value={editRow.currency}
                                                            onChange={e => setEditRow(row => row ? { ...row, currency: e.target.value.toUpperCase() } : row)}
                                                            className="w-16 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        />
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <select
                                                        value={editRow.bucketId}
                                                        onChange={e => setEditRow(row => row ? { ...row, bucketId: Number(e.target.value) } : row)}
                                                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                                    >
                                                        {buckets.map(b => (
                                                            <option key={b.id} value={b.id}>{b.name}</option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-900">{buckets.find(b => b.id === editRow?.bucketId)?.account?.name || '-'}</td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-block px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                                        {buckets.find(b => b.id === editRow?.bucketId)?.account?.type || '-'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <PartnerSelector
                                                        selectedPartnerId={editRow.partnerId}
                                                        onSelectPartner={(partner) => setEditRow(row => row ? { ...row, partnerId: partner?.id ?? null } : row)}
                                                        onCancel={() => { }}
                                                    />
                                                </td>
                                                <td className="px-6 py-4 text-gray-400 text-sm">-</td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50"
                                                            onClick={() => {
                                                                createWordMutation.mutate({
                                                                    value: editRow.value,
                                                                    currency: editRow.currency,
                                                                    bucketId: editRow.bucketId,
                                                                    partnerId: editRow.partnerId,
                                                                    sentenceId: sentenceId!,
                                                                });
                                                            }}
                                                            disabled={createWordMutation.isPending}
                                                            type="button"
                                                        >
                                                            Save
                                                        </button>
                                                        <button
                                                            className="px-3 py-1 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors text-sm font-medium"
                                                            onClick={() => setEditRow(null)}
                                                            type="button"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                    {/* Totals Row */}
                                    {Object.keys(totals).length > 0 && (
                                        <tfoot className="bg-gray-100 border-t-2 border-gray-300">
                                            <tr>
                                                <td colSpan={6} className="px-6 py-4 text-right font-semibold text-gray-900">
                                                    Totals:
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="space-y-1">
                                                        {Object.entries(totals).map(([currency, total]) => (
                                                            <div key={currency} className={`font-semibold ${total >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                                {total >= 0 ? '+' : ''}{total.toFixed(2)} {currency}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </td>
                                            </tr>
                                        </tfoot>
                                    )}
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default SentenceDetailsPage;
