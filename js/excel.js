import { displayPage, resetPagination, filterAndDisplayRows, renderHeaders } from './table.js';

let rawData = [];
let currentHeaders = [];

export function getRawData() {
    return rawData;
}

export function getCurrentHeaders() {
    return currentHeaders;
}

export function loadExcelData(file) {
    const reader = new FileReader();
    reader.onload = function (e) {
        const workbook = XLSX.read(e.target.result, { type: 'binary' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        processData(json);
    };
    reader.readAsBinaryString(file);
}

function processData(json) {
    const [headers, ...rows] = json;

    rawData = rows.map(row => row.map(cell => cell.toString()));
    currentHeaders = headers.map(header => header?.toString?.() || 'Column');

    resetPagination();
    displayPage(rawData, 1);
    renderHeaders(currentHeaders);
}

export function searchSuburbs(query) {
    const lower = query.toLowerCase().trim();
    if (!lower) {
        resetPagination();
        displayPage(rawData, 1);
    } else {
        const filtered = rawData.filter(row =>
            row.some(cell => cell?.toLowerCase?.().includes(lower))
        );
        resetPagination(filtered);
        filterAndDisplayRows(filtered, 1);
    }
}
