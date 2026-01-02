"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../../../context/AuthContext";
import { fetchGetBuckets, fetchGetTransactions, fetchGetPartners } from "../../../../utils/fetch-functions";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Transaction } from "../../../../types/transaction";
import { Partner } from "../../../../types/partner";
import TransactionTable from "../../../../components/transaction-table/TransactionTable";
import { useDeleteTransaction } from "../../../../hooks/useDeleteTransaction";

interface Bucket {
    id: number;
    name: string;
}

const TransactionsPage: React.FC = () => {
    const { user } = useAuth();
    const [selectedBucketId, setSelectedBucketId] = useState<number | null>(null);
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
    const [editingTransactionId, setEditingTransactionId] = useState<number | null>(null);
    const [editingPartnerId, setEditingPartnerId] = useState<number | null>(null);
    const searchParams = useSearchParams();
    const queryClient = useQueryClient();
    const router = useRouter();
    const pathname = usePathname();

    const { deleteTransaction } = useDeleteTransaction({
        invalidateQueries: ["transactions"]
    });

    // Fetch buckets for this user
    const { data: buckets = [], isLoading: bucketsLoading } = useQuery<Bucket[]>({
        queryKey: ["buckets", user?.userID],
        queryFn: () => fetchGetBuckets(),
        enabled: !!user?.userID,
    });

    // Fetch transactions for selected bucket
    const { data: transactions = [], isLoading: transactionsLoading } = useQuery<Transaction[]>({
        queryKey: ["transactions", selectedBucketId],
        queryFn: () => selectedBucketId ? fetchGetTransactions(selectedBucketId) : [],
        enabled: !!selectedBucketId,
    });

    // Fetch partners
    useQuery<Partner[]>({
        queryKey: ["partners", user?.userID],
        queryFn: () => fetchGetPartners(),
        enabled: !!user?.userID,
    });

    // Filter transactions by year
    const filteredTransactions = transactions.filter(transaction => {
        const transactionYear = new Date(transaction.date).getFullYear();
        return transactionYear === selectedYear;
    });

    // Get available years from transactions
    const availableYears = Array.from(
        new Set(transactions.map(tx => new Date(tx.date).getFullYear()))
    ).sort((a, b) => b - a);

    useEffect(() => {
        const bucketParam = searchParams.get("bucket");
        const yearParam = searchParams.get("year");

        if (bucketParam && !isNaN(Number(bucketParam))) {
            setSelectedBucketId(Number(bucketParam));
        }

        if (yearParam && !isNaN(Number(yearParam))) {
            setSelectedYear(Number(yearParam));
        }
    }, [searchParams]);

    // Update URL when bucket or year changes
    useEffect(() => {
        const params = new URLSearchParams();
        if (selectedBucketId) {
            params.set('bucket', selectedBucketId.toString());
        }
        if (selectedYear) {
            params.set('year', selectedYear.toString());
        }
        const queryString = params.toString();
        router.push(queryString ? `${pathname}?${queryString}` : pathname);
    }, [selectedBucketId, selectedYear, router, pathname]);

    // Partner editing handlers
    const handlePartnerEdit = (transactionId: number, currentPartner?: Partner) => {
        setEditingTransactionId(transactionId);
        setEditingPartnerId(currentPartner?.id || null);
    };

    const handlePartnerSelect = async (partner: Partner | null) => {
        if (editingTransactionId === null) return;

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/transactions/${editingTransactionId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    partnerId: partner?.id ?? null
                })
            });

            if (!response.ok) {
                throw new Error('Failed to update partner');
            }

            // Refresh transactions
            queryClient.invalidateQueries({ queryKey: ["transactions", selectedBucketId] });

            setEditingTransactionId(null);
            setEditingPartnerId(null);
        } catch {
            alert('Failed to update partner. Please try again.');
        }
    };

    const handlePartnerCancel = () => {
        setEditingTransactionId(null);
        setEditingPartnerId(null);
    };

    const handleNavigateToPartner = (partnerId: number) => {
        router.push(`/home/user/partner?id=${partnerId}`);
    };

    // Format currency
    const formatCurrency = (value: number, currency: string) => {
        return new Intl.NumberFormat('de-DE', {
            style: 'currency',
            currency: currency || 'EUR'
        }).format(value);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="flex">
                {/* Left Sidebar - Filters */}
                <div className="w-80 bg-white border-r border-gray-200 p-6 space-y-6">
                    {/* Header */}
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Transactions</h1>
                        <p className="text-sm text-gray-500">Manage your financial transactions</p>
                    </div>

                    {/* Quick Actions */}
                    <div className="space-y-2">
                        <button
                            onClick={() => router.push(`${pathname}/import${selectedBucketId ? `?bucket=${selectedBucketId}` : ''}`)}
                            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                            disabled={!selectedBucketId}
                        >
                            Import Transactions
                        </button>
                        <button
                            onClick={() => router.push('/home/user/imports')}
                            className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                        >
                            View Imports
                        </button>
                    </div>

                    {/* Bucket Filter */}
                    <div>
                        <h3 className="text-sm font-medium text-gray-900 mb-3">Filter by Bucket</h3>
                        <div className="space-y-1 max-h-60 overflow-y-auto">
                            <button
                                onClick={() => setSelectedBucketId(null)}
                                className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${selectedBucketId === null
                                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                                    : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                All Buckets
                            </button>
                            {bucketsLoading ? (
                                <div className="px-3 py-2 text-sm text-gray-500">Loading buckets...</div>
                            ) : (
                                buckets.map((bucket) => (
                                    <button
                                        key={bucket.id}
                                        onClick={() => setSelectedBucketId(bucket.id)}
                                        className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${selectedBucketId === bucket.id
                                            ? 'bg-blue-100 text-blue-700 border border-blue-300'
                                            : 'text-gray-600 hover:bg-gray-100'
                                            }`}
                                    >
                                        {bucket.name}
                                    </button>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Year Filter */}
                    {selectedBucketId && availableYears.length > 0 && (
                        <div>
                            <h3 className="text-sm font-medium text-gray-900 mb-3">Filter by Year</h3>
                            <select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(Number(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            >
                                {availableYears.map((year) => (
                                    <option key={year} value={year}>
                                        {year}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Statistics */}
                    {selectedBucketId && (
                        <div>
                            <h3 className="text-sm font-medium text-gray-900 mb-3">Statistics</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Total Transactions:</span>
                                    <span className="font-medium">{filteredTransactions.length}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Income:</span>
                                    <span className="font-medium text-green-600">
                                        {formatCurrency(
                                            filteredTransactions
                                                .filter(tx => tx.value > 0)
                                                .reduce((sum, tx) => sum + tx.value, 0),
                                            filteredTransactions[0]?.currency || 'EUR'
                                        )}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Expenses:</span>
                                    <span className="font-medium text-red-600">
                                        {formatCurrency(
                                            filteredTransactions
                                                .filter(tx => tx.value < 0)
                                                .reduce((sum, tx) => sum + tx.value, 0),
                                            filteredTransactions[0]?.currency || 'EUR'
                                        )}
                                    </span>
                                </div>
                                <div className="flex justify-between border-t pt-2">
                                    <span className="text-gray-600">Net:</span>
                                    <span className="font-medium">
                                        {formatCurrency(
                                            filteredTransactions.reduce((sum, tx) => sum + tx.value, 0),
                                            filteredTransactions[0]?.currency || 'EUR'
                                        )}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Main Content */}
                <div className="flex-1 p-6">
                    {!selectedBucketId ? (
                        <div className="bg-white rounded-lg shadow p-8 text-center">
                            <h2 className="text-lg font-medium text-gray-900 mb-2">Select a bucket to view transactions</h2>
                            <p className="text-gray-500">Choose a bucket from the sidebar to get started</p>
                        </div>
                    ) : transactionsLoading ? (
                        <div className="bg-white rounded-lg shadow p-8 text-center">
                            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                            <p className="mt-2 text-gray-500">Loading transactions...</p>
                        </div>
                    ) : filteredTransactions.length === 0 ? (
                        <div className="bg-white rounded-lg shadow p-8 text-center">
                            <h2 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h2>
                            <p className="text-gray-500 mb-4">No transactions found for {selectedYear}</p>
                            <button
                                onClick={() => router.push(`${pathname}/import?bucket=${selectedBucketId}`)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Import Transactions
                            </button>
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg shadow">
                            {/* Table Header */}
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h2 className="text-lg font-medium text-gray-900">
                                    Transactions for {buckets.find(b => b.id === selectedBucketId)?.name} ({selectedYear})
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''}
                                </p>
                            </div>

                            {/* Transaction Table */}
                            <TransactionTable
                                transactions={filteredTransactions}
                                editingTransactionId={editingTransactionId}
                                editingPartnerId={editingPartnerId}
                                onPartnerEdit={handlePartnerEdit}
                                onPartnerSelect={handlePartnerSelect}
                                onPartnerCancel={handlePartnerCancel}
                                onNavigateToPartner={handleNavigateToPartner}
                                onDeleteTransaction={deleteTransaction}
                                showPartnerColumn={true}
                                showActionsColumn={true}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TransactionsPage;