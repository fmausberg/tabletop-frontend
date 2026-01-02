import React, { useState } from 'react';

interface CsvUploadProps {
    onDataUpload: (uploadedData: Record<string, string>[], fileData: { name: string; content: string; separator: string }) => void;
}

const CsvUpload: React.FC<CsvUploadProps> = ({ onDataUpload }) => {
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [rawContent, setRawContent] = useState<string>('');
    const [separator, setSeparator] = useState<string>(',');

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile && selectedFile.type === 'text/csv') {
            setFile(selectedFile);
            setError(null);
            // Read and show raw content
            const text = await selectedFile.text();
            setRawContent(text);

            // Auto-detect separator
            const detectedSeparator = detectSeparator(text);
            setSeparator(detectedSeparator);
        } else {
            setError('Please upload a valid CSV file.');
            setFile(null);
            setRawContent('');
        }
    };

    // Auto-detect CSV separator by checking which one appears more frequently in the first few lines
    const detectSeparator = (text: string): string => {
        const lines = text.split('\n').slice(0, 3); // Check first 3 lines
        let commaCount = 0;
        let semicolonCount = 0;

        lines.forEach(line => {
            // Count separators outside of quotes
            let inQuotes = false;
            for (let i = 0; i < line.length; i++) {
                const char = line[i];
                if (char === '"') {
                    inQuotes = !inQuotes;
                } else if (!inQuotes) {
                    if (char === ',') commaCount++;
                    if (char === ';') semicolonCount++;
                }
            }
        });

        // Return the separator that appears most frequently
        return semicolonCount > commaCount ? ';' : ',';
    };

    const handleUpload = async () => {
        if (!file) {
            setError('No file selected.');
            return;
        }

        try {
            const text = await file.text();
            const data = parseCSV(text, separator);

            // Pass both the parsed data and file information
            const fileData = {
                name: file.name,
                content: text,
                separator: separator
            };

            onDataUpload(data, fileData);
        } catch (err) {
            setError('Failed to parse CSV file. Please check the format.');
            console.error('CSV parsing error:', err);
        }
    };

    // Proper CSV parser that handles quoted fields
    const parseCSV = (text: string, separator: string): Record<string, string>[] => {
        const rows: string[] = [];
        let currentRow = '';
        let inQuotes = false;

        // Split text into rows, handling quoted fields that may contain newlines
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === '\n' && !inQuotes) {
                if (currentRow.trim()) {
                    rows.push(currentRow);
                }
                currentRow = '';
                continue;
            }
            currentRow += char;
        }
        // Add the last row if it doesn't end with newline
        if (currentRow.trim()) {
            rows.push(currentRow);
        }

        if (rows.length === 0) return [];

        // Parse headers
        const headers = parseCSVRow(rows[0], separator);

        // Parse data rows
        const data = rows.slice(1).map(row => {
            const values = parseCSVRow(row, separator);
            return headers.reduce((obj, header, idx) => {
                obj[header] = values[idx] || '';
                return obj;
            }, {} as Record<string, string>);
        });

        return data;
    };

    // Parse a single CSV row, handling quoted fields
    const parseCSVRow = (row: string, separator: string): string[] => {
        const result: string[] = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < row.length; i++) {
            const char = row[i];
            const nextChar = row[i + 1];

            if (char === '"') {
                if (inQuotes && nextChar === '"') {
                    // Handle escaped quotes ("")
                    current += '"';
                    i++; // Skip next quote
                } else {
                    // Toggle quote state
                    inQuotes = !inQuotes;
                }
            } else if (char === separator && !inQuotes) {
                // Field separator outside quotes
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }

        // Add the last field
        result.push(current.trim());

        return result;
    };



    return (
        <div style={{ padding: '20px', border: '1px solid #e0e0e0', borderRadius: '8px', marginBottom: '20px', backgroundColor: '#f9f9f9' }}>
            <h3 style={{ marginBottom: '15px', color: '#333' }}>Upload CSV File</h3>

            <div style={{ marginBottom: '15px' }}>
                <label htmlFor="separator-select" style={{ marginRight: '10px', fontWeight: 'bold' }}>
                    CSV Separator:
                </label>
                <select
                    id="separator-select"
                    value={separator}
                    onChange={(e) => setSeparator(e.target.value)}
                    style={{
                        padding: '6px 12px',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        fontSize: '14px',
                        backgroundColor: 'white'
                    }}
                >
                    <option value=",">Comma (,)</option>
                    <option value=";">Semicolon (;)</option>
                </select>
                {file && (
                    <span style={{ marginLeft: '10px', fontSize: '0.9em', color: '#666', fontStyle: 'italic' }}>
                        Auto-detected: {separator === ',' ? 'Comma' : 'Semicolon'}
                    </span>
                )}
            </div>

            <div style={{ marginBottom: '15px' }}>
                <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    style={{
                        padding: '8px',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        backgroundColor: 'white'
                    }}
                />
            </div>
            {error && <div style={{ color: 'red', padding: '10px', backgroundColor: '#ffe6e6', border: '1px solid #ffcccc', borderRadius: '4px', marginBottom: '15px' }}>{error}</div>}

            {rawContent && (
                <div style={{ marginBottom: '15px' }}>
                    <h4 style={{ marginBottom: '10px', color: '#333' }}>Preview (first 5 rows):</h4>
                    <pre style={{
                        maxHeight: 200,
                        overflow: 'auto',
                        background: '#f5f5f5',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        padding: '12px',
                        fontSize: '12px',
                        lineHeight: '1.4'
                    }}>
                        {rawContent.split('\n').slice(0, 5).join('\n')}
                        {rawContent.split('\n').length > 5 && '\n...'}
                    </pre>
                </div>
            )}

            <div style={{ display: 'flex', gap: '10px' }}>
                <button
                    onClick={handleUpload}
                    disabled={!file}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: file ? '#007bff' : '#6c757d',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: file ? 'pointer' : 'not-allowed',
                        fontSize: '14px',
                        fontWeight: 'bold'
                    }}
                >
                    Parse CSV
                </button>
            </div>
        </div>
    );
};

export default CsvUpload;