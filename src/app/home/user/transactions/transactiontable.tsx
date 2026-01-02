import React from "react";
import { Transaction } from "../../../../types/transaction"; // Adjust the path as needed

interface TransactionTableProps {
    transactions: Transaction[];
    selectedTransactionId?: number | null;
    onRowClick?: (tx: Transaction) => void;
}

const TransactionTable: React.FC<TransactionTableProps> = ({
    transactions,
    selectedTransactionId,
    onRowClick,
}) => {
    // Sort transactions by date (newest first)
    const sortedTransactions = [...transactions].sort((a, b) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    return (
        <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
                <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Currency</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Counterpart</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Partner</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sentence</th>
                </tr>
            </thead>
            <tbody className="bg-white">
                {sortedTransactions.map((tx) => (
                    <tr
                        key={tx.id}
                        className={selectedTransactionId === tx.id ? "bg-blue-100" : ""}
                        style={{ cursor: onRowClick ? "pointer" : undefined }}
                        onClick={onRowClick ? () => onRowClick(tx) : undefined}
                    >
                        <td className="py-2 px-4 border-b border-gray-100">
                            {(() => {
                                const date = new Date(tx.date);
                                const pad = (n: number) => n.toString().padStart(2, "0");
                                return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()} - ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
                            })()}
                        </td>
                        <td className="py-2 px-4 border-b border-gray-100 text-right">
                            {tx.value < 0 && "-"} {Math.abs(tx.value).toFixed(2)}
                        </td>
                        <td className="py-2 px-4 border-b border-gray-100">{tx.currency}</td>
                        <td className="py-2 px-4 border-b border-gray-100">{tx.counterpart}</td>
                        <td className="py-2 px-4 border-b border-gray-100">
                            {tx.partner ? (
                                <a
                                    href={`/home/user/partner?id=${tx.partner.id}`}
                                    className="text-blue-600 hover:text-blue-800 hover:underline"
                                    onClick={(e) => e.stopPropagation()} // Prevent row click when clicking the link
                                >
                                    {tx.partner.lastName}, {tx.partner.firstName}
                                </a>
                            ) : ""}
                        </td>
                        <td className="py-2 px-4 border-b border-gray-100">{tx.description}</td>
                        <td className="py-2 px-4 border-b border-gray-100 text-right">
                            {tx.word?.sentenceId ? (
                                <a
                                    href={`/home/user/sentence?id=${tx.word.sentenceId}`}
                                    className="text-blue-600 hover:underline"
                                >
                                    {tx.word.sentenceId}
                                </a>
                            ) : (
                                ""
                            )}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};
export default TransactionTable;