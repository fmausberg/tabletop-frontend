import Papa from 'papaparse';

export const parseCsv = (csvString: string): Array<Record<string, string | number>> => {
    const result = Papa.parse(csvString, {
        header: true,
        skipEmptyLines: true,
    });

    // Improved regex: also match numbers without thousands separator
    const germanNumberRegex = /^-?\d{1,3}(\.\d{3})*,\d+$|^-?\d+,\d+$/;

    return (result.data as Array<Record<string, string>>).map(row => {
        const newRow: Record<string, string | number> = {};
        for (const key in row) {
            if (typeof row[key] === "string" && germanNumberRegex.test(row[key]!)) {
                newRow[key] = parseFloat(row[key]!.replace(/\./g, '').replace(',', '.'));
            } else {
                newRow[key] = row[key]!;
            }
        }
        return newRow;
    });
};