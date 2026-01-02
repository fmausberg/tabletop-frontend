"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useParams } from "next/navigation";
import { fetchGetBucket, fetchGetTransactions } from "../../../../../utils/fetch-functions";

interface Bucket {
    id: number;
    name: string;
    description?: string;
    userId: number;
    createdAt: string;
    updatedAt: string;
    transactionCount?: number;
    totalIncome?: number;
    totalExpenses?: number;
    balance?: number;
}

interface Transaction {
    id: number;
    value: number;
    currency: string;
    counterpart: string;
    description: string;
    date: string;
    externalId?: string;
    partnerId?: number;
    partner?: {
        id: number;
        firstName: string;
        lastName: string;
    };
}

const BucketDetailsPage: React.FC = () => {
    const router = useRouter();
    const params = useParams();
    const bucketId = params?.id as string;
    const [showAllTransactions, setShowAllTransactions] = useState(false);

    const { data: bucket, isLoading: bucketLoading, error: bucketError } = useQuery<Bucket>({
        queryKey: ["bucket", bucketId],
        queryFn: () => fetchGetBucket(parseInt(bucketId)),
        enabled: !!bucketId,
    });

    const { data: transactions = [], isLoading: transactionsLoading } = useQuery<Transaction[]>({
        queryKey: ["transactions", bucketId],
        queryFn: () => fetchGetTransactions(parseInt(bucketId)),
        enabled: !!bucketId,
    });

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('de-DE', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatCurrency = (amount: number, currency: string = 'EUR') => {
        return new Intl.NumberFormat('de-DE', {
            style: 'currency',
            currency: currency
        }).format(amount);
    };

    // Calculate statistics from transactions
    const stats = React.useMemo(() => {
        const income = transactions.filter(t => t.value > 0).reduce((sum, t) => sum + t.value, 0);
        const expenses = transactions.filter(t => t.value < 0).reduce((sum, t) => sum + Math.abs(t.value), 0);
        const balance = income - expenses;
        return { income, expenses, balance, count: transactions.length };
    }, [transactions]);

    const displayedTransactions = showAllTransactions ? transactions : transactions.slice(0, 10);

    if (bucketLoading) {
        return (
            <div className="max-w-6xl mx-auto py-8 px-4">
                <div className="flex items-center justify-center h-64">
                    <div className="text-lg">Loading bucket details...</div>
                </div>
            </div>
        );
    }

    if (bucketError || !bucket) {
        return (
            <div className="max-w-6xl mx-auto py-8 px-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="text-red-800">Failed to load bucket details. Please try again.</div>
                </div>
                <button
                    onClick={() => router.back()}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto py-8 px-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{bucket.name}</h1>
                    {bucket.description && (
                        <p className="text-gray-600 mt-1">{bucket.description}</p>
                    )}
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => router.back()}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                        Go Back
                    </button>
                    <button
                        onClick={() => router.push(`/home/user/transactions?bucket=${bucketId}`)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Manage Transactions
                    </button>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white shadow-md rounded-lg p-6">
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Balance</h3>
                    <p className={`text-2xl font-bold mt-2 ${stats.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(stats.balance)}
                    </p>
                </div>

                <div className="bg-white shadow-md rounded-lg p-6">
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Income</h3>
                    <p className="text-2xl font-bold text-green-600 mt-2">
                        {formatCurrency(stats.income)}
                    </p>
                </div>

                <div className="bg-white shadow-md rounded-lg p-6">
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Expenses</h3>
                    <p className="text-2xl font-bold text-red-600 mt-2">
                        {formatCurrency(stats.expenses)}
                    </p>
                </div>

                <div className="bg-white shadow-md rounded-lg p-6">
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Transactions</h3>
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                        {stats.count}
                    </p>
                </div>
            </div>

            {/* Bucket Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-white shadow-md rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Bucket Information</h2>
                    <div className="space-y-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">ID</label>
                            <p className="text-gray-900">{bucket.id}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Name</label>
                            <p className="text-gray-900">{bucket.name}</p>
                        </div>
                        {bucket.description && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Description</label>
                                <p className="text-gray-900">{bucket.description}</p>
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Created</label>
                            <p className="text-gray-900">{formatDate(bucket.createdAt)}</p>
                        </div>
                        {bucket.updatedAt !== bucket.createdAt && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Last Updated</label>
                                <p className="text-gray-900">{formatDate(bucket.updatedAt)}</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white shadow-md rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
                    <div className="space-y-3">
                        <button
                            onClick={() => router.push(`/home/user/transactions/import?bucket=${bucketId}`)}
                            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                            Import CSV Transactions
                        </button>
                        <button
                            onClick={() => router.push(`/home/user/transactions?bucket=${bucketId}`)}
                            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            View All Transactions
                        </button>
                        <button
                            onClick={() => router.push('/home/user/imports')}
                            className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                        >
                            View Import History
                        </button>
                    </div>
                </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white shadow-md rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">
                        {showAllTransactions ? 'All Transactions' : 'Recent Transactions'}
                    </h2>
                    {transactions.length > 10 && (
                        <button
                            onClick={() => setShowAllTransactions(!showAllTransactions)}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                            {showAllTransactions ? 'Show Less' : 'Show All'}
                        </button>
                    )}
                </div>

                {transactionsLoading ? (
                    <div className="text-center py-8">Loading transactions...</div>
                ) : transactions.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        No transactions found in this bucket.
                        <div className="mt-4">
                            <button
                                onClick={() => router.push(`/home/user/transactions/import?bucket=${bucketId}`)}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                                Import First Transactions
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Description
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Counterpart
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Amount
                                    </th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {displayedTransactions.map((transaction) => (
                                    <tr key={transaction.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                            {new Date(transaction.date).toLocaleDateString('de-DE')}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-900">
                                            {transaction.description || 'No description'}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-900">
                                            {transaction.counterpart || 'N/A'}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                                            <span className={transaction.value >= 0 ? 'text-green-600' : 'text-red-600'}>
                                                {transaction.value >= 0 ? '+' : ''}{formatCurrency(transaction.value, transaction.currency)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-center text-sm">
                                            <button
                                                onClick={() => router.push(`/home/user/transactions/${transaction.id}`)}
                                                className="text-blue-600 hover:text-blue-800 font-medium"
                                            >
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {!showAllTransactions && transactions.length > 10 && (
                            <div className="mt-4 text-center">
                                <p className="text-gray-500 text-sm">
                                    Showing {displayedTransactions.length} of {transactions.length} transactions
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BucketDetailsPage;