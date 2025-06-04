let currentPage = 1;
let rowsPerPage = 4;
let currentData = [];

export function resetPagination(newData = null) {
    currentPage = 1;
    currentData = newData || [];
}

export function displayPage(data, page) {
    const tbody = document.getElementById('resultTableBody');
    const start = (page - 1) * rowsPerPage;
    const end = Math.min(start + rowsPerPage, data.length);

    tbody.innerHTML = '';

    if (data.length === 0) {
        const row = document.createElement('tr');
        const cell = document.createElement('td');
        cell.colSpan = 7;
        cell.textContent = 'No data to display.';
        cell.style.textAlign = 'center';
        row.appendChild(cell);
        tbody.appendChild(row);
    } else {
        for (let i = start; i < end; i++) {
            const tr = document.createElement('tr');
            data[i].forEach(cell => {
                const td = document.createElement('td');
                td.textContent = cell;
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        }
    }

    const pageInfo = document.getElementById('pageInfo');
    pageInfo.textContent = data.length > 0
        ? `Page ${page} of ${Math.ceil(data.length / rowsPerPage)}`
        : 'No results found.';
}


export function filterAndDisplayRows(filteredData, page) {
    currentData = filteredData;
    displayPage(currentData, page);
}

export function changePage(delta) {
    const dataSet = currentData.length > 0 ? currentData : getDataFromExcel();
    const totalPages = Math.ceil(dataSet.length / rowsPerPage);
    const nextPage = currentPage + delta;

    if (nextPage >= 1 && nextPage <= totalPages) {
        currentPage = nextPage;
        displayPage(dataSet, currentPage);
    }
}

import { getRawData } from './excel.js';
function getDataFromExcel() {
    return getRawData();
}
