import { loadExcelData, searchSuburbs } from './excel.js';
import { changePage } from './table.js';
import { setupNotepad } from './notepad.js';
import { setupSortableTable } from './table.js';

document.addEventListener('DOMContentLoaded', () => {
    setupNotepad();
    setupSortableTable();
    document.getElementById('suburbInput').focus();


    document.getElementById('load-data').addEventListener('click', () => {
        const file = document.getElementById('fileInput').files[0];
        if (file) {
            loadExcelData(file);
            document.getElementById('suburbInput').value = '';
        }
    });

    document.getElementById('suburbInput').addEventListener('input', debounce(() => {
        const query = document.getElementById('suburbInput').value;
        searchSuburbs(query);
    }, 250));

    document.getElementById('prevPage').addEventListener('click', () => changePage(-1));
    document.getElementById('nextPage').addEventListener('click', () => changePage(1));
});

function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}
