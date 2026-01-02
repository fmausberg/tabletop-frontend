"use client";

import React, { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import CsvUpload from './CsvUpload';
import { fetchCreateImport } from '../../../../../utils/fetch-functions';

const TRANSACTION_FIELDS = [
    { key: "value", label: "Value (Float)" },
    { key: "currency", label: "Currency" },
    { key: "counterpart", label: "Counterpart (String?)" },
    { key: "date", label: "Date (DateTime)" },
    { key: "time", label: "Time (Optional)" },
    { key: "description", label: "Description (String?)" },
    { key: "externalId", label: "External ID (String?)" },
];

const ImportPage: React.FC = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const bucketId = searchParams.get('bucket');
    const [data, setData] = useState<Record<string, string>[]>([]);
    const [headers, setHeaders] = useState<string[]>([]);
    const [mapping, setMapping] = useState<Record<string, string>>({});
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [fileInfo, setFileInfo] = useState<{ name: string; content: string; separator: string } | null>(null);

    const handleDataUpload = (uploadedData: Record<string, string>[], fileData: { name: string; content: string; separator: string }) => {
        setData(uploadedData);
        setFileInfo(fileData);
        if (uploadedData.length > 0) {
            setHeaders(Object.keys(uploadedData[0]));
            // Optionally, try to auto-map by name
            const autoMap: Record<string, string> = {};
            TRANSACTION_FIELDS.forEach(field => {
                const found = Object.keys(uploadedData[0]).find(h => h.toLowerCase() === field.key.toLowerCase());
                if (found) autoMap[field.key] = found;
            });
            setMapping(autoMap);
        }
    };

    const handleMappingChange = (fieldKey: string, csvHeader: string) => {
        setMapping(prev => ({ ...prev, [fieldKey]: csvHeader }));
    };

    const handleUploadTransactions = async () => {
        if (!bucketId) {
            setUploadError('No bucket ID found in URL parameters.');
            return;
        }

        if (data.length === 0) {
            setUploadError('No data to upload.');
            return;
        }

        if (!fileInfo) {
            setUploadError('No file information available.');
            return;
        }

        setUploadError(null);
        setUploadSuccess(null);
        setIsUploading(true);

        try {
            // First, create the import record
            const mappings = Object.entries(mapping)
                .filter(([, csvHeader]) => csvHeader) // Only include mapped fields
                .map(([fieldName, csvHeader]) => ({ csvHeader, fieldName }));

            const importData = {
                fileName: fileInfo.name,
                fileContent: fileInfo.content,
                separator: fileInfo.separator,
                bucketId: parseInt(bucketId),
                mappings: mappings
            };

            console.log('Creating import record:', importData);
            const importResult = await fetchCreateImport(importData);
            console.log('Import record created:', importResult);

            // Navigate to the import details page
            const importId = importResult.id || importResult.data?.id;
            if (importId) {
                router.push(`/home/user/imports?id=${importId}`);
            } else {
                setUploadSuccess('Import created successfully! Transactions are being processed automatically.');
            }
        } catch (err) {
            setUploadError('Failed to create import.');
            console.error('Import creation error:', err);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div>
            <h1>Import Transactions</h1>
            <CsvUpload onDataUpload={handleDataUpload} />
            {headers.length > 0 && (
                <div>
                    <h2>Map CSV Columns</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Transaction Field</th>
                                <th>CSV Column</th>
                            </tr>
                        </thead>
                        <tbody>
                            {TRANSACTION_FIELDS.map(field => (
                                <tr key={field.key}>
                                    <td>{field.label}</td>
                                    <td>
                                        <select
                                            value={mapping[field.key] || ""}
                                            onChange={e => handleMappingChange(field.key, e.target.value)}
                                        >
                                            <option value="">-- Not mapped --</option>
                                            {headers.map(header => (
                                                <option key={header} value={header}>{header}</option>
                                            ))}
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {data.length > 0 && (
                <div>
                    <h2>Preview (first 5 rows, mapped)</h2>
                    <table className="min-w-full border mt-2 text-xs">
                        <thead>
                            <tr>
                                {Object.keys(mapping)
                                    .filter(field => mapping[field])
                                    .map(field => (
                                        <th key={field} className="border px-2 py-1">{field}</th>
                                    ))}
                            </tr>
                        </thead>
                        <tbody>
                            {data.slice(0, 5).map((row, idx) => (
                                <tr key={idx}>
                                    {Object.keys(mapping)
                                        .filter(field => mapping[field])
                                        .map(field => (
                                            <td key={field} className="border px-2 py-1">
                                                {row[mapping[field]]}
                                            </td>
                                        ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Upload Button */}
                    <div style={{ marginTop: '20px' }}>
                        <button
                            onClick={handleUploadTransactions}
                            disabled={isUploading || !bucketId}
                            style={{
                                backgroundColor: isUploading ? '#6c757d' : '#28a745',
                                color: 'white',
                                padding: '10px 20px',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: isUploading || !bucketId ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {isUploading ? 'Uploading...' : 'Upload as Transactions'}
                        </button>
                        {!bucketId && (
                            <p style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>
                                No bucket ID found in URL parameters.
                            </p>
                        )}
                    </div>

                    {/* Status Messages */}
                    {uploadError && <p style={{ color: 'red', marginTop: '10px' }}>{uploadError}</p>}
                    {uploadSuccess && <p style={{ color: 'green', marginTop: '10px' }}>{uploadSuccess}</p>}
                </div>
            )}
        </div>
    );
};

export default ImportPage;