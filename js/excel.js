import { displayPage, resetPagination, filterAndDisplayRows } from './table.js';

let rawData = [];

export function getRawData() {
    return rawData;
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
    rawData = json.map(row => row.map(cell => cell.toString()));
    resetPagination();
    displayPage(rawData, 1);
}

export function searchSuburbs(query) {
    const lower = query.toLowerCase().trim();
    if (lower === "") {
        resetPagination();
        displayPage(rawData, 1);
    } else {
        const filtered = rawData.filter(row =>
            (row[0] && row[0].toLowerCase().includes(lower)) ||
            (row[2] && row[2].toLowerCase().includes(lower))
        );
        resetPagination(filtered);
        filterAndDisplayRows(filtered, 1);
    }
}
