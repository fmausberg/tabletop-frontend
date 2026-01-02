"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useParams } from "next/navigation";
import { fetchGetTransaction } from "../../../../../utils/fetch-functions";
import { useDeleteTransaction } from "../../../../../hooks/useDeleteTransaction";

interface Transaction {
    id: number;
    value: number;
    currency: string;
    counterpart: string;
    description: string;
    date: string;
    externalId?: string;
    partnerId?: number;
    bucketId: number;
    createdAt: string;
    updatedAt: string;
    bucket?: {
        id: number;
        name: string;
    };
    partner?: {
        id: number;
        firstName: string;
        lastName: string;
        email?: string;
        phone?: string;
    };
    word?: {
        id: number;
        sentenceId: number;
    };
    attributes?: Array<{
        id: number;
        key: string;
        value: string;
    }>;
}

const TransactionDetailsPage: React.FC = () => {
    const router = useRouter();
    const params = useParams();
    const transactionId = params?.id as string;
    const [isDeleting, setIsDeleting] = useState(false);

    const { deleteTransaction } = useDeleteTransaction({
        invalidateQueries: ["transactions", "transaction"]
    });

    const { data: transaction, isLoading, error } = useQuery<Transaction>({
        queryKey: ["transaction", transactionId],
        queryFn: () => fetchGetTransaction(parseInt(transactionId)),
        enabled: !!transactionId,
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

    const handleDeleteTransaction = async () => {
        if (!transaction) return;
        
        try {
            setIsDeleting(true);
            deleteTransaction(transaction.id);
            // Redirect to transactions page after deletion
            setTimeout(() => {
                const year = new Date(transaction.date).getFullYear();
                router.push(`/home/user/transactions?bucket=${transaction.bucketId}&year=${year}`);
            }, 500);
        } catch (error) {
            console.error('Failed to delete transaction:', error);
            alert('Failed to delete transaction. Please try again.');
            setIsDeleting(false);
        }
    };
    
    const formatCurrency = (amount: number, currency: string) => {
        return new Intl.NumberFormat('de-DE', {
            style: 'currency',
            currency: currency || 'EUR'
        }).format(amount);
    };

    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto py-8 px-4">
                <div className="flex items-center justify-center h-64">
                    <div className="text-lg">Loading transaction details...</div>
                </div>
            </div>
        );
    }

    if (error || !transaction) {
        return (
            <div className="max-w-4xl mx-auto py-8 px-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="text-red-800">Failed to load transaction details. Please try again.</div>
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
        <div className="max-w-4xl mx-auto py-8 px-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Transaction Details</h1>
                    <p className="text-gray-600 mt-1">ID: {transaction.id}</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => router.back()}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                        Go Back
                    </button>
                    <button
                        onClick={() => {
                            const year = new Date(transaction.date).getFullYear();
                            router.push(`/home/user/transactions?bucket=${transaction.bucket?.id}&year=${year}`);
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        All Transactions
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Transaction Information */}
                <div className="bg-white shadow-md rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Transaction Information</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                            <div className={`text-2xl font-bold ${transaction.value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {transaction.value >= 0 ? '+' : ''}{formatCurrency(transaction.value, transaction.currency)}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                            <p className="text-gray-900">{formatDate(transaction.date)}</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <p className="text-gray-900">{transaction.description || 'No description'}</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Counterpart</label>
                            <p className="text-gray-900">{transaction.counterpart || 'Not specified'}</p>
                        </div>

                    </div>
                </div>

                {/* Related Information */}
                <div className="bg-white shadow-md rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Related Information</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Bucket</label>
                            {transaction.bucket ? (
                                <button
                                    onClick={() => router.push(`home/user/buckets/${transaction.bucket!.id}`)}
                                    className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                                >
                                    {transaction.bucket.name}
                                </button>
                            ) : (
                                <span className="text-gray-900">Bucket {transaction.bucketId}</span>
                            )}
                        </div>

                        {transaction.externalId && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">External ID</label>
                                <p className="text-gray-900 font-mono text-sm bg-gray-50 px-2 py-1 rounded">{transaction.externalId}</p>
                            </div>
                        )}

                        {transaction.partner && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Partner</label>
                                <button
                                    onClick={() => router.push(`/home/user/partner?id=${transaction.partner!.id}`)}
                                    className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                                >
                                    {transaction.partner.lastName}, {transaction.partner.firstName}
                                </button>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Created</label>
                            <p className="text-gray-900">{formatDate(transaction.createdAt)}</p>
                        </div>

                        {transaction.updatedAt !== transaction.createdAt && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Last Updated</label>
                                <p className="text-gray-900">{formatDate(transaction.updatedAt)}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Accounting */}
            <div className="mt-6 bg-white shadow-md rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Accounting</h2>
                <div className="space-y-4">
                    {transaction.word?.sentenceId ? (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Booking Sentence</label>
                            <button
                                onClick={() => router.push(`/home/user/sentences/${transaction.word!.sentenceId}`)}
                                className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                            >
                                Sentence #{transaction.word!.sentenceId}
                            </button>
                        </div>
                    ) : (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Booking Sentence</label>
                            <p className="text-gray-600 mb-3">No booking sentence assigned yet</p>
                            <button
                                onClick={() => router.push(`/home/user/sentences/new?trxId=${transaction.id}`)}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                            >
                                Create New Sentence
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Additional Attributes */}
            {transaction.attributes && transaction.attributes.length > 0 && (
                <div className="mt-6 bg-white shadow-md rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Additional Attributes</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Attribute
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Value
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {transaction.attributes.map((attribute) => (
                                    <tr key={attribute.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {attribute.key}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-900 break-words">
                                            {attribute.value}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            <div className="mt-8 flex justify-center gap-4">
                <button
                    onClick={() => {
                        // TODO: Add edit functionality
                        alert('Edit functionality coming soon!');
                    }}
                    className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                >
                    Edit Transaction
                </button>
                <button
                    onClick={handleDeleteTransaction}
                    disabled={isDeleting}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isDeleting ? 'Deleting...' : 'Delete Transaction'}
                </button>
            </div>
        </div>
    );
};

export default TransactionDetailsPage;