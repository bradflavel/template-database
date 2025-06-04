let currentPage = 1;
let rowsPerPage = 4;
let currentData = [];
let currentSortColumn = null;
let currentSortAsc = true;

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

export function setupSortableTable() {
    const headers = document.querySelectorAll('#resultTable thead th');
    headers.forEach((th, index) => {
        th.style.cursor = 'pointer';
        th.addEventListener('click', () => {
            const dataset = currentData.length > 0 ? currentData : getRawData();
            if (!dataset || dataset.length === 0) return;

            if (currentSortColumn === index) {
                currentSortAsc = !currentSortAsc;
            } else {
                currentSortColumn = index;
                currentSortAsc = true;
            }

            const sorted = [...dataset].sort((a, b) => {
                const valA = a[index] || '';
                const valB = b[index] || '';
                return currentSortAsc
                    ? valA.localeCompare(valB, undefined, { numeric: true })
                    : valB.localeCompare(valA, undefined, { numeric: true });
            });

            resetPagination(sorted);
            filterAndDisplayRows(sorted, 1);
            updateSortIndicators(index, currentSortAsc);
        });
    });
}

function updateSortIndicators(activeIndex, asc) {
    const headers = document.querySelectorAll('#resultTable thead th');
    headers.forEach((th, idx) => {
        th.textContent = th.textContent.replace(/ ▲| ▼/, '');
        if (idx === activeIndex) {
            th.textContent += asc ? ' ▲' : ' ▼';
        }
    });
}

import { getRawData } from './excel.js';
function getDataFromExcel() {
    return getRawData();
}
