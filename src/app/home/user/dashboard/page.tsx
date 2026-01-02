'use client';

import { useEffect, useState } from 'react';
import { useAuth } from "../../../../context/AuthContext";

interface Statistics {
    totalTransactions?: number;
    transactionsWithoutWord?: number;
    [key: string]: any;
}

const DashboardPage = () => {
    const { user } = useAuth();
    const [statistics, setStatistics] = useState<Statistics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStatistics = async () => {
            if (!user?.userID) {
                setError('User ID not available');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/users/statistics/${user.userID}`,
                    {
                        credentials: 'include',
                    }
                );

                if (!response.ok) {
                    throw new Error('Failed to fetch statistics');
                }

                const data = await response.json();
                setStatistics(data.data);
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchStatistics();
    }, [user?.userID]);

    return (
        <div className="w-full">
            <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

            {/* KPIs Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* KPI 1: Total Transactions */}
                <div className="bg-white border border-gray-200 rounded-lg shadow-md p-6">
                    <h3 className="text-gray-600 text-sm font-medium mb-2">Total Transactions</h3>
                    <div className="text-4xl font-bold text-blue-600 mb-2">
                        {loading ? '-' : statistics?.totalTransactions ?? 0}
                    </div>
                </div>

                {/* KPI 2: Transactions Without Words */}
                <div className="bg-white border border-gray-200 rounded-lg shadow-md p-6">
                    <h3 className="text-gray-600 text-sm font-medium mb-2">Unbooked Transactions</h3>
                    <div className="text-4xl font-bold text-blue-600 mb-2">
                        {loading ? '-' : statistics?.transactionsWithoutWord ?? 0}
                    </div>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                    {error}
                </div>
            )}
        </div>
    );
};

export default DashboardPage;
