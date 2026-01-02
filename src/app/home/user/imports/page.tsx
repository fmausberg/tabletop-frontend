"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams, useRouter } from "next/navigation";
import TransactionTable from "../../../../components/transaction-table/TransactionTable";
import { Partner } from "../../../../types/partner";
import { useDeleteTransaction } from "../../../../hooks/useDeleteTransaction";

interface Import {
    id: number;
    fileName: string;
    separator: string;
    bucketId: number;
    createdAt: string;
    transactionCount?: number;
    bucket?: {
        id: number;
        name: string;
    };
}

interface ImportDetails {
    id: number;
    fileName: string;
    fileContent: string;
    separator: string;
    bucketId: number;
    createdAt: string;
    updatedAt: string;
    transactionCount?: number;
    mappings: Array<{
        id: number;
        csvHeader: string;
        fieldName: string;
    }>;
    bucket?: {
        id: number;
        name: string;
    };
    transactions?: Array<{
        id: number;
        value: number;
        currency: string;
        description: string;
        counterpart: string;
        date: string;
        externalId?: string;
    }>;
}

const fetchGetImports = async (): Promise<Import[]> => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/imports`, {
        credentials: "include"
    });
    if (!res.ok) throw new Error("Failed to fetch imports");
    const json = await res.json();
    return json.data || json;
};

const fetchGetImport = async (id: number): Promise<ImportDetails> => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/imports/${id}`, {
        credentials: "include"
    });
    if (!res.ok) throw new Error("Failed to fetch import details");
    const json = await res.json();
    return json.data || json;
};

const ImportsPage: React.FC = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const queryClient = useQueryClient();
    const [selectedImportId, setSelectedImportId] = useState<number | null>(null);
    const [editingTransactionId, setEditingTransactionId] = useState<number | null>(null);
    const [editingPartnerId, setEditingPartnerId] = useState<number | null>(null);

    const { data: imports = [], isLoading: importsLoading } = useQuery<Import[]>({
        queryKey: ["imports"],
        queryFn: fetchGetImports,
    });

    const { data: importDetails, isLoading: detailsLoading } = useQuery<ImportDetails>({
        queryKey: ["import", selectedImportId],
        queryFn: () => fetchGetImport(selectedImportId!),
        enabled: !!selectedImportId,
    });

    const updateTransactionMutation = useMutation({
        mutationFn: async ({ transactionId, partnerId }: { transactionId: number; partnerId: number | null }) => {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/transactions/${transactionId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ partnerId })
            });
            if (!res.ok) throw new Error("Failed to update transaction");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["import", selectedImportId] });
            setEditingTransactionId(null);
            setEditingPartnerId(null);
        }
    });

    const { deleteTransaction } = useDeleteTransaction({
        invalidateQueries: ["imports", "import"]
    });

    useEffect(() => {
        const idParam = searchParams.get("id");
        if (idParam && !isNaN(Number(idParam)) && imports.length > 0) {
            const importId = Number(idParam);
            const importExists = imports.find(i => i.id === importId);
            if (importExists) {
                setSelectedImportId(importId);
            }
        }
    }, [searchParams, imports]);

    const handleSelectImport = (importId: number) => {
        setSelectedImportId(importId);
        router.push(`?id=${importId}`);
    };

    const handlePartnerEdit = (transactionId: number) => {
        setEditingTransactionId(transactionId);
    };

    const handlePartnerSelect = (partner: Partner | null) => {
        if (editingTransactionId) {
            updateTransactionMutation.mutate({
                transactionId: editingTransactionId,
                partnerId: partner?.id ?? null
            });
        }
    };

    const handlePartnerCancel = () => {
        setEditingTransactionId(null);
        setEditingPartnerId(null);
    };

    const handleNavigateToPartner = (partnerId: number) => {
        router.push(`/home/user/partner?id=${partnerId}`);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('de-DE', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getFilePreview = (content: string) => {
        if (!content) return 'No file content available';
        const lines = content.split('\n').slice(0, 5);
        return lines.join('\n');
    };

    return (
        <div className="flex bg-gray-50 gap-4 min-h-screen p-6">
            {/* Left Side: Imports List */}
            <div className="w-1/3">
                <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">Transaction Imports</h2>
                    </div>
                    {importsLoading ? (
                        <div className="p-6 text-center">
                            <div className="inline-block h-6 w-6 animate-spin rounded-full border-3 border-solid border-current border-r-transparent"></div>
                            <p className="mt-2 text-gray-500 text-sm">Loading imports...</p>
                        </div>
                    ) : imports.length === 0 ? (
                        <div className="p-6 text-center text-gray-500 text-sm">No imports yet</div>
                    ) : (
                        <div className="divide-y">
                            {imports.map((importRecord) => (
                                <div
                                    key={importRecord.id}
                                    onClick={() => handleSelectImport(importRecord.id)}
                                    className={`p-4 cursor-pointer transition-colors ${selectedImportId === importRecord.id
                                        ? "bg-blue-50 border-l-4 border-blue-600"
                                        : "hover:bg-gray-50"
                                        }`}
                                >
                                    <div className="font-semibold text-gray-900">{importRecord.fileName}</div>
                                    <div className="text-sm text-gray-600 mt-1">
                                        {importRecord.transactionCount ?? 0} transactions
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        {formatDate(importRecord.createdAt)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Right Side: Import Details */}
            <div className="flex-1">
                {!selectedImportId ? (
                    <div className="bg-white rounded-lg shadow">
                        <div className="text-gray-500 text-center py-16">
                            <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p>Select an import to view details</p>
                        </div>
                    </div>
                ) : detailsLoading ? (
                    <div className="bg-white rounded-lg shadow p-6 text-center">
                        <div className="inline-block h-6 w-6 animate-spin rounded-full border-3 border-solid border-current border-r-transparent"></div>
                        <p className="mt-4 text-gray-500">Loading import details...</p>
                    </div>
                ) : importDetails ? (
                    <div className="bg-white rounded-lg shadow">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-lg">
                            <h1 className="text-3xl font-bold">{importDetails.fileName}</h1>
                            <p className="text-blue-100 mt-1">Import Details</p>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-6">
                            {/* Import Information and Field Mappings - Side by Side */}
                            <div className="grid grid-cols-2 gap-6">
                                {/* Import Information */}
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Import Information</h2>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 font-medium">Bucket:</span>
                                            <span className="text-gray-900">{importDetails.bucket?.name || `Bucket ${importDetails.bucketId}`}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 font-medium">Separator:</span>
                                            <span className="text-gray-900">{importDetails.separator === ',' ? 'Comma (,)' : 'Semicolon (;)'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 font-medium">File Rows:</span>
                                            <span className="text-gray-900">{Math.max(0, (importDetails.fileContent?.split('\n').filter(line => line.trim()).length || 1) - 1)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 font-medium">Read Transactions:</span>
                                            <span className="text-gray-900">{importDetails.transactionCount ?? 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 font-medium">Import Date:</span>
                                            <span className="text-gray-900">{formatDate(importDetails.createdAt)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Field Mappings */}
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Field Mappings</h2>
                                    {importDetails.mappings && importDetails.mappings.length > 0 ? (
                                        <div className="space-y-2">
                                            {importDetails.mappings.map((mapping) => (
                                                <div key={mapping.id} className="flex justify-between py-2 px-3 bg-gray-50 rounded border border-gray-200">
                                                    <span className="font-medium text-gray-700">{mapping.fieldName}</span>
                                                    <span className="text-gray-900">→ {mapping.csvHeader}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500">No mappings available</p>
                                    )}
                                </div>
                            </div>

                            {/* File Preview */}
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">File Preview (First 5 Rows)</h2>
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                    <pre className="text-sm text-gray-800 font-mono overflow-x-auto whitespace-pre-wrap">
                                        {getFilePreview(importDetails.fileContent)}
                                        {importDetails.fileContent && importDetails.fileContent.split('\n').length > 5 && '\n...'}
                                    </pre>
                                </div>
                            </div>

                            {/* Transactions */}
                            {importDetails.transactions && importDetails.transactions.length > 0 && (
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Transactions</h2>
                                    <TransactionTable
                                        transactions={importDetails.transactions}
                                        showActionsColumn={true}
                                        editingTransactionId={editingTransactionId}
                                        editingPartnerId={editingPartnerId}
                                        onPartnerEdit={handlePartnerEdit}
                                        onPartnerSelect={handlePartnerSelect}
                                        onPartnerCancel={handlePartnerCancel}
                                        onNavigateToPartner={handleNavigateToPartner}
                                        onDeleteTransaction={deleteTransaction}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow p-6 text-center">
                        <div className="text-red-600">Failed to load import details</div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ImportsPage;
