"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams, useRouter } from "next/navigation";
import { fetchGetPartners, fetchUpdatePartner, fetchCreatePartner } from "../../../../utils/fetch-functions";
import { Partner } from "../../../../types/partner";

type PartnerFormMode = "view" | "edit" | "create";

const emptyPartner = {
    firstName: "",
    lastName: "",
    additionalInfo: "",
    email: "",
    phone: "",
};

const PartnerPage: React.FC = () => {
    const queryClient = useQueryClient();
    const searchParams = useSearchParams();
    const router = useRouter();
    const [selectedPartnerId, setSelectedPartnerId] = useState<number | null>(null);
    const [formPartner, setFormPartner] = useState<typeof emptyPartner>(emptyPartner);
    const [mode, setMode] = useState<PartnerFormMode>("view");
    const [isSaving, setIsSaving] = useState(false);

    // Fetch all partners
    const { data: partners = [], isLoading: partnersLoading } = useQuery<Partner[]>({
        queryKey: ["partners"],
        queryFn: fetchGetPartners,
    });

    // Handle URL parameter for auto-selecting partner
    useEffect(() => {
        const idParam = searchParams.get("id");
        if (idParam && !isNaN(Number(idParam)) && partners.length > 0) {
            const partnerId = Number(idParam);
            const partner = partners.find(p => p.id === partnerId);
            if (partner) {
                setSelectedPartnerId(partner.id);
                setFormPartner({
                    firstName: partner.firstName ?? "",
                    lastName: partner.lastName ?? "",
                    additionalInfo: partner.additionalInfo ?? "",
                    email: partner.email ?? "",
                    phone: partner.phone ?? "",
                });
                setMode("view");
            }
        }
    }, [searchParams, partners]);

    // Find the selected partner
    const partnerDetails = partners.find((p) => p.id === selectedPartnerId);

    // Mutations
    const mutation = useMutation({
        mutationFn: fetchUpdatePartner,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["partners"] });
            setMode("view");
        },
    });

    const createPartnerMutation = useMutation({
        mutationFn: fetchCreatePartner,
        onSuccess: (createdPartner) => {
            // Select the newly created partner
            setSelectedPartnerId(createdPartner.id);
            setFormPartner({
                firstName: createdPartner.firstName ?? "",
                lastName: createdPartner.lastName ?? "",
                additionalInfo: createdPartner.additionalInfo ?? "",
                email: createdPartner.email ?? "",
                phone: createdPartner.phone ?? "",
            });
            setMode("view");
            router.push(`?id=${createdPartner.id}`);
            queryClient.invalidateQueries({ queryKey: ["partners"] });
        },
    });

    // Handle selection
    const handleSelectPartner = (partner: Partner) => {
        setSelectedPartnerId(partner.id);
        setFormPartner({
            firstName: partner.firstName ?? "",
            lastName: partner.lastName ?? "",
            additionalInfo: partner.additionalInfo ?? "",
            email: partner.email ?? "",
            phone: partner.phone ?? "",
        });
        setMode("view");
        // Update URL with query parameter
        router.push(`?id=${partner.id}`);
    };

    // Handle New Partner
    const handleNewPartner = () => {
        setSelectedPartnerId(null);
        setFormPartner(emptyPartner);
        setMode("create");
    };

    // Handle form submit
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (mode === "create") {
            createPartnerMutation.mutate(formPartner);
        } else if (mode === "edit" && selectedPartnerId) {
            mutation.mutate({
                id: selectedPartnerId,
                data: formPartner,
            });
        }
    };

    // Handle edit button
    const handleEdit = () => setMode("edit");

    // Handle cancel
    const handleCancel = () => {
        if (selectedPartnerId && partnerDetails) {
            setFormPartner({
                firstName: partnerDetails.firstName ?? "",
                lastName: partnerDetails.lastName ?? "",
                additionalInfo: partnerDetails.additionalInfo ?? "",
                email: partnerDetails.email ?? "",
                phone: partnerDetails.phone ?? "",
            });
            setMode("view");
        } else {
            setFormPartner(emptyPartner);
            setSelectedPartnerId(null);
            setMode("view");
            router.push("");
        }
    };

    // Handle delete
    const handleDeletePartner = async () => {
        if (!selectedPartnerId) return;

        if (!confirm(`Are you sure you want to delete ${formPartner.firstName} ${formPartner.lastName}? This action cannot be undone.`)) {
            return;
        }

        setIsSaving(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/partners/${selectedPartnerId}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Failed to delete partner');
            }

            // Invalidate partners list
            queryClient.invalidateQueries({ queryKey: ["partners"] });

            // Reset form and navigate
            setSelectedPartnerId(null);
            setFormPartner(emptyPartner);
            setMode("view");
            router.push("");
        } catch (error) {
            alert(`Failed to delete partner: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="flex bg-gray-50 gap-4 min-h-screen p-6">
            {/* Left Side: Partner List */}
            <div className="w-1/3">
                <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900">Partners</h2>
                        <button
                            className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-1"
                            onClick={handleNewPartner}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                            </svg>
                            <span>New</span>
                        </button>
                    </div>
                    {partnersLoading ? (
                        <div className="p-6 text-center">
                            <div className="inline-block h-6 w-6 animate-spin rounded-full border-3 border-solid border-current border-r-transparent"></div>
                            <p className="mt-2 text-gray-500 text-sm">Loading partners...</p>
                        </div>
                    ) : partners.length === 0 ? (
                        <div className="p-6 text-center text-gray-500 text-sm">No partners yet</div>
                    ) : (
                        <div className="divide-y">
                            {partners.map((partner) => (
                                <div
                                    key={partner.id}
                                    onClick={() => handleSelectPartner(partner)}
                                    className={`p-4 cursor-pointer transition-colors ${selectedPartnerId === partner.id
                                        ? "bg-blue-50 border-l-4 border-blue-600"
                                        : "hover:bg-gray-50"
                                        }`}
                                >
                                    <div className="font-semibold text-gray-900">
                                        {partner.lastName}, {partner.firstName}
                                        {partner.additionalInfo && (
                                            <span className="text-sm text-gray-600 font-normal ml-2">
                                                [{partner.additionalInfo}]
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Right Side: Partner Details */}
            <div className="flex-1">
                {mode === "create" ? (
                    <div className="bg-white rounded-lg shadow">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">Create New Partner</h2>
                        </div>
                        <form className="p-6 space-y-4" onSubmit={handleSubmit}>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    First Name
                                </label>
                                <input
                                    type="text"
                                    value={formPartner.firstName}
                                    onChange={e => setFormPartner(p => ({ ...p, firstName: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Last Name
                                </label>
                                <input
                                    type="text"
                                    value={formPartner.lastName}
                                    onChange={e => setFormPartner(p => ({ ...p, lastName: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Additional Info
                                </label>
                                <input
                                    type="text"
                                    value={formPartner.additionalInfo}
                                    onChange={e => setFormPartner(p => ({ ...p, additionalInfo: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={formPartner.email}
                                    onChange={e => setFormPartner(p => ({ ...p, email: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Phone
                                </label>
                                <input
                                    type="tel"
                                    value={formPartner.phone}
                                    onChange={e => setFormPartner(p => ({ ...p, phone: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="flex gap-3 mt-6 pt-4 border-t">
                                <button
                                    type="submit"
                                    disabled={createPartnerMutation.isPending}
                                    className="flex-1 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>{createPartnerMutation.isPending ? "Creating..." : "Create"}</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    disabled={createPartnerMutation.isPending}
                                    className="flex-1 px-4 py-2 rounded-lg bg-gray-300 text-gray-700 hover:bg-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Cancel
                                </button>
                            </div>
                            {createPartnerMutation.isError && (
                                <div className="text-red-600 mt-4 p-3 bg-red-50 rounded-lg text-sm">Create failed</div>
                            )}
                            {createPartnerMutation.isSuccess && (
                                <div className="text-green-600 mt-4 p-3 bg-green-50 rounded-lg text-sm">Created successfully!</div>
                            )}
                        </form>
                    </div>
                ) : !selectedPartnerId ? (
                    <div className="bg-white rounded-lg shadow">
                        <div className="text-gray-500 text-center py-16">
                            <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10a3 3 0 11-6 0 3 3 0 016 0zM6 20h12a6 6 0 00-6-6 6 6 0 00-6 6z" />
                            </svg>
                            <p>Select a partner or create a new one</p>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow">
                        {/* Header Section */}
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-lg">
                            {mode === "edit" ? (
                                <div className="space-y-3">
                                    <div className="grid grid-cols-2 gap-3">
                                        <input
                                            type="text"
                                            placeholder="Last Name"
                                            value={formPartner.lastName}
                                            onChange={(e) => setFormPartner({ ...formPartner, lastName: e.target.value })}
                                            className="px-3 py-2 rounded bg-blue-500 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white"
                                        />
                                        <input
                                            type="text"
                                            placeholder="First Name"
                                            value={formPartner.firstName}
                                            onChange={(e) => setFormPartner({ ...formPartner, firstName: e.target.value })}
                                            className="px-3 py-2 rounded bg-blue-500 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white"
                                        />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Additional Info"
                                        value={formPartner.additionalInfo}
                                        onChange={(e) => setFormPartner({ ...formPartner, additionalInfo: e.target.value })}
                                        className="w-full px-3 py-2 rounded bg-blue-500 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white"
                                    />
                                </div>
                            ) : (
                                <>
                                    <h1 className="text-3xl font-bold">
                                        {formPartner.lastName}, {formPartner.firstName}
                                    </h1>
                                    {formPartner.additionalInfo && (
                                        <p className="text-blue-100 mt-1">{formPartner.additionalInfo}</p>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Content Section */}
                        <div className="p-6 space-y-6">
                            {/* Contact Information */}
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
                                {mode === "edit" ? (
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-sm text-gray-700 mb-1">Email</label>
                                            <input
                                                type="email"
                                                value={formPartner.email || ''}
                                                onChange={(e) => setFormPartner({ ...formPartner, email: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Enter email address"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-700 mb-1">Phone</label>
                                            <input
                                                type="tel"
                                                value={formPartner.phone || ''}
                                                onChange={(e) => setFormPartner({ ...formPartner, phone: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Enter phone number"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {formPartner.email && (
                                            <div className="flex items-start">
                                                <span className="text-gray-600 font-medium w-20">Email:</span>
                                                <a
                                                    href={`mailto:${formPartner.email}`}
                                                    className="text-blue-600 hover:text-blue-800 hover:underline break-all"
                                                >
                                                    {formPartner.email}
                                                </a>
                                            </div>
                                        )}
                                        {formPartner.phone && (
                                            <div className="flex items-start">
                                                <span className="text-gray-600 font-medium w-20">Phone:</span>
                                                <a
                                                    href={`tel:${formPartner.phone}`}
                                                    className="text-blue-600 hover:text-blue-800 hover:underline"
                                                >
                                                    {formPartner.phone}
                                                </a>
                                            </div>
                                        )}
                                        {!formPartner.email && !formPartner.phone && (
                                            <p className="text-gray-500 italic">No contact information available</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer Buttons */}
                        <div className="bg-gray-50 px-6 py-4 rounded-b-lg border-t flex gap-3">
                            {mode === "view" && (
                                <>
                                    <button
                                        type="button"
                                        onClick={handleEdit}
                                        className="flex-1 px-4 py-2 rounded-lg bg-yellow-600 text-white hover:bg-yellow-700 transition-colors flex items-center justify-center space-x-2 text-sm"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                        <span>Edit</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleDeletePartner}
                                        disabled={isSaving}
                                        className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        <span>{isSaving ? "Deleting..." : "Delete"}</span>
                                    </button>
                                </>
                            )}
                            {mode === "edit" && (
                                <>
                                    <button
                                        type="submit"
                                        onClick={handleSubmit}
                                        disabled={mutation.isPending}
                                        className="flex-1 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span>{mutation.isPending ? "Saving..." : "Save"}</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setMode("view")}
                                        disabled={mutation.isPending}
                                        className="flex-1 px-4 py-2 rounded-lg bg-gray-300 text-gray-700 hover:bg-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                        <span>Cancel</span>
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PartnerPage;
