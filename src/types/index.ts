// This file exports types and interfaces that may be used throughout the application, including any types related to the CSV data structure.

export interface CsvRow {
    [key: string]: string | number; // Represents a row in the CSV file with string or number values
}

export interface CsvData {
    rows: CsvRow[]; // An array of rows parsed from the CSV file
    headers: string[]; // An array of headers from the CSV file
}