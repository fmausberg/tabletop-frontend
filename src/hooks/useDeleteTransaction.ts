import { useMutation, useQueryClient } from "@tanstack/react-query";

interface UseDeleteTransactionOptions {
    invalidateQueries?: string[];
}

export const useDeleteTransaction = (options: UseDeleteTransactionOptions = {}) => {
    const queryClient = useQueryClient();
    const { invalidateQueries = ["transactions", "imports"] } = options;

    const mutation = useMutation({
        mutationFn: async (transactionId: number) => {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/transactions/${transactionId}`,
                {
                    method: "DELETE",
                    credentials: "include",
                }
            );
            if (!res.ok) throw new Error("Failed to delete transaction");
            return res.json();
        },
        onSuccess: () => {
            invalidateQueries.forEach((queryKey) => {
                queryClient.invalidateQueries({ queryKey: [queryKey] });
            });
        },
    });

    const handleDeleteTransaction = (transactionId: number) => {
        if (confirm("Are you sure you want to delete this transaction?")) {
            mutation.mutate(transactionId);
        }
    };

    return {
        deleteTransaction: handleDeleteTransaction,
        isPending: mutation.isPending,
        error: mutation.error,
    };
};
