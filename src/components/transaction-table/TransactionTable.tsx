"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Partner } from "../../types/partner";
import PartnerSelector from "../partner-selector/PartnerSelector";

// Flexible transaction type that works with both full Transaction and ImportDetails transactions
interface BaseTransaction {
    id: number;
    value: number;
    currency: string;
    counterpart?: string;
    description?: string;
    date: string;
    externalId?: string;
    partner?: Partner;
}

interface TransactionTableProps<T extends BaseTransaction = BaseTransaction> {
    transactions: T[];
    editingTransactionId?: number | null;
    editingPartnerId?: number | null;
    onPartnerEdit?: (transactionId: number, currentPartner?: Partner) => void;
    onPartnerSelect?: (partner: Partner | null) => void;
    onPartnerCancel?: () => void;
    onViewTransaction?: (transactionId: number) => void;
    onEditTransaction?: (transactionId: number) => void;
    onDeleteTransaction?: (transactionId: number) => void;
    onNavigateToPartner?: (partnerId: number) => void;
    showPartnerColumn?: boolean;
    showActionsColumn?: boolean;
}

const TransactionTable = React.forwardRef<HTMLTableElement, TransactionTableProps>(({
    transactions,
    editingTransactionId,
    editingPartnerId,
    onPartnerEdit,
    onPartnerSelect,
    onPartnerCancel,
    onViewTransaction,
    onEditTransaction,
    onDeleteTransaction,
    onNavigateToPartner,
    showPartnerColumn = true,
    showActionsColumn = false,
}) => {
    const router = useRouter();

    // Default action handlers
    const defaultHandleViewTransaction = (transactionId: number) => {
        router.push(`/home/user/transactions/${transactionId}`);
    };

    const defaultHandleEditTransaction = (transactionId: number) => {
        alert(`Edit transaction ${transactionId} - This will be implemented next`);
    };

    const defaultHandleDeleteTransaction = (transactionId: number) => {
        if (confirm(`Are you sure you want to delete transaction ${transactionId}?`)) {
            alert(`Delete transaction ${transactionId} - This will be implemented next`);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('de-DE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatCurrency = (value: number, currency: string) => {
        return new Intl.NumberFormat('de-DE', {
            style: 'currency',
            currency: currency || 'EUR'
        }).format(value);
    };

    const sortedTransactions = [...transactions].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Description
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Counterpart
                        </th>
                        {showPartnerColumn && (
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Partner
                            </th>
                        )}
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Amount
                        </th>
                        {showActionsColumn && (
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        )}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {sortedTransactions.map((transaction) => (
                        <tr key={transaction.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatDate(transaction.date)}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                                <div className="max-w-xs truncate">
                                    {transaction.description || 'No description'}
                                </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                                <div className="max-w-xs truncate">
                                    {transaction.counterpart || 'N/A'}
                                </div>
                            </td>
                            {showPartnerColumn && (
                                <td className="px-6 py-4 text-sm text-gray-900">
                                    {editingTransactionId === transaction.id && onPartnerSelect && onPartnerCancel ? (
                                        <PartnerSelector
                                            selectedPartnerId={editingPartnerId}
                                            onSelectPartner={onPartnerSelect}
                                            onCancel={onPartnerCancel}
                                        />
                                    ) : (
                                        <div className="flex items-center space-x-2 flex-1">
                                            <div className="flex-1 truncate">
                                                {transaction.partner?.id ? (
                                                    onNavigateToPartner ? (
                                                        <button
                                                            onClick={() => onNavigateToPartner(transaction.partner!.id)}
                                                            className="text-blue-600 hover:text-blue-800 hover:underline text-xs transition-colors"
                                                            title="View Partner"
                                                        >
                                                            {transaction.partner?.lastName}, {transaction.partner?.firstName}{transaction.partner?.additionalInfo ? ` (${transaction.partner?.additionalInfo})` : ''}
                                                        </button>
                                                    ) : (
                                                        <span className="text-xs text-gray-900">
                                                            {transaction.partner?.lastName}, {transaction.partner?.firstName}{transaction.partner?.additionalInfo ? ` (${transaction.partner?.additionalInfo})` : ''}
                                                        </span>
                                                    )
                                                ) : null}
                                            </div>
                                            {onPartnerEdit && (
                                                <button
                                                    onClick={() => onPartnerEdit(transaction.id, transaction.partner)}
                                                    className="p-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                                                    title="Edit Partner"
                                                >
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </td>
                            )}
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                                <span className={transaction.value >= 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                                    {transaction.value >= 0 ? '+' : ''}{formatCurrency(transaction.value, transaction.currency)}
                                </span>
                            </td>
                            {showActionsColumn && (
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                    <div className="flex justify-center space-x-2">
                                        {(onViewTransaction || true) && (
                                            <button
                                                onClick={() => (onViewTransaction || defaultHandleViewTransaction)(transaction.id)}
                                                className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                                title="View Details"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            </button>
                                        )}
                                        {(onEditTransaction || true) && (
                                            <button
                                                onClick={() => (onEditTransaction || defaultHandleEditTransaction)(transaction.id)}
                                                className="p-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
                                                title="Edit Transaction"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>
                                        )}
                                        {(onDeleteTransaction || true) && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (onDeleteTransaction && confirm(`Are you sure you want to delete this transaction?`)) {
                                                        onDeleteTransaction(transaction.id);
                                                    } else if (!onDeleteTransaction) {
                                                        alert(`Delete transaction ${transaction.id} - Please provide onDeleteTransaction handler`);
                                                    }
                                                }}
                                                className="p-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                                                title="Delete Transaction"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
});

TransactionTable.displayName = 'TransactionTable';

export default TransactionTable;
