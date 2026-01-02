"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Partner } from "../../types/partner";

interface PartnerSelectorProps {
    selectedPartnerId?: number | null;
    onSelectPartner: (partner: Partner | null) => void;
    onCancel?: () => void;
}

const fetchGetPartners = async (): Promise<Partner[]> => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/partners`, {
        credentials: "include"
    });
    if (!res.ok) throw new Error("Failed to fetch partners");
    const json = await res.json();
    return json.data || json;
};

const PartnerSelector: React.FC<PartnerSelectorProps> = ({
    selectedPartnerId,
    onSelectPartner,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const { data: partners = [], isLoading } = useQuery<Partner[]>({
        queryKey: ["partners"],
        queryFn: fetchGetPartners,
    });

    const selectedPartner = partners.find(p => p.id === selectedPartnerId);

    const filteredPartners = partners.filter(partner =>
        `${partner.lastName}, ${partner.firstName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (partner.additionalInfo?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleSelect = (partner: Partner | null) => {
        onSelectPartner(partner);
        setIsOpen(false);
        setSearchTerm("");
    };

    /*const handleCancel = () => {
        setIsOpen(false);
        setSearchTerm("");
        onCancel?.();
    };*/

    return (
        <div className="relative w-full">
            <input
                type="text"
                placeholder={selectedPartner ? `${selectedPartner.lastName}, ${selectedPartner.firstName}` : "Search partners..."}
                value={searchTerm}
                onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setIsOpen(true);
                }}
                onFocus={() => setIsOpen(true)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white hover:border-blue-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />

            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-xl z-50">
                    {/* Partners list */}
                    <div className="max-h-60 overflow-y-auto">
                        {/* Clear selection option */}
                        {selectedPartnerId && (
                            <button
                                onClick={() => handleSelect(null)}
                                type="button"
                                className="w-full text-left px-4 py-3 transition-colors border-b border-gray-100 hover:bg-red-50 text-red-600 font-medium text-sm"
                            >
                                ✕ Clear Selection
                            </button>
                        )}

                        {isLoading ? (
                            <div className="p-4 text-center text-gray-500 text-sm">Loading partners...</div>
                        ) : filteredPartners.length === 0 ? (
                            <div className="p-4 text-center text-gray-500 text-sm">
                                {partners.length === 0 ? "No partners created" : "No matching partners"}
                            </div>
                        ) : (
                            filteredPartners.map((partner) => (
                                <button
                                    key={partner.id}
                                    onClick={() => handleSelect(partner)}
                                    type="button"
                                    className={`w-full text-left px-4 py-3 transition-colors border-b border-gray-100 last:border-b-0 hover:bg-blue-50 ${selectedPartnerId === partner.id ? "bg-blue-100" : ""
                                        }`}
                                >
                                    <div className="text-sm font-medium text-gray-900">
                                        {partner.lastName}, {partner.firstName}
                                    </div>
                                    {partner.additionalInfo && (
                                        <div className="text-xs text-gray-600 mt-1">
                                            {partner.additionalInfo}
                                        </div>
                                    )}
                                    {partner.email && (
                                        <div className="text-xs text-gray-500 mt-1">
                                            {partner.email}
                                        </div>
                                    )}
                                </button>
                            ))
                        )}
                    </div>

                    {/* Close button */}
                    {filteredPartners.length > 0 && (
                        <div className="border-t border-gray-200 p-3 bg-gray-50">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-full px-3 py-2 text-sm font-medium bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                            >
                                Done
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default PartnerSelector;
