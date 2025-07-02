import { loadExcelData, searchSuburbs } from './excel.js';
import { changePage } from './table.js';
import { setupNotepad } from './notepad.js';

document.addEventListener('DOMContentLoaded', () => {
    setupNotepad();
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

    document.addEventListener('keydown', (e) => {
        const activeTag = document.activeElement.tagName;

        if (e.key === 'Enter' && activeTag !== 'TEXTAREA' && activeTag !== 'INPUT') {
            const file = document.getElementById('fileInput').files[0];
            if (file) {
                loadExcelData(file);
                document.getElementById('suburbInput').value = '';
            }
        }

        if (e.key === 'ArrowLeft') {
            changePage(-1);
        } else if (e.key === 'ArrowRight') {
            changePage(1);
        }

        if (e.key === '/' && activeTag !== 'INPUT' && activeTag !== 'TEXTAREA') {
            e.preventDefault();
            document.getElementById('suburbInput').focus();
        }
    });

    const themeToggle = document.getElementById('themeToggle');
    const userPref = localStorage.getItem('theme');
    if (userPref === 'dark') {
        document.body.classList.add('dark-theme');
    }

    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        const mode = document.body.classList.contains('dark-theme') ? 'dark' : 'light';
        localStorage.setItem('theme', mode);
    });

    document.getElementById('exportTxt').addEventListener('click', () => {
        const content = document.getElementById('notePad').value;
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `notes-${new Date().toISOString().slice(0, 16)}.txt`;
        link.click();

        URL.revokeObjectURL(url);
    });

    document.getElementById('importTxt').addEventListener('click', () => {
        document.getElementById('importFileInput').click();
    });

    document.getElementById('importFileInput').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (e) {
            document.getElementById('notePad').value = e.target.result;
        };
        reader.readAsText(file);
    });

    const deptTable = document.getElementById('department-data');
    const savedDept = localStorage.getItem('departmentInfo');
    if (savedDept) {
        const data = JSON.parse(savedDept);
        [...deptTable.rows].forEach((row, i) => {
            if (data[i]) {
                row.cells[0].textContent = data[i][0];
                row.cells[1].textContent = data[i][1];
            }
        });
    }

    let editingDept = false;

    document.getElementById('editDepartmentBtn').addEventListener('click', () => {
        editingDept = !editingDept;
        const button = document.getElementById('editDepartmentBtn');

        [...deptTable.rows].forEach(row => {
            [...row.cells].forEach((cell, colIndex) => {
                if (editingDept) {
                    const input = document.createElement('input');
                    input.value = cell.textContent;
                    input.style.width = '100%';
                    cell.textContent = '';
                    cell.appendChild(input);
                } else {
                    const input = cell.querySelector('input');
                    if (input) {
                        cell.textContent = input.value;
                    }
                }
            });
        });

        if (!editingDept) {
            const newData = [...deptTable.rows].map(row => [
                row.cells[0].textContent,
                row.cells[1].textContent
            ]);
            localStorage.setItem('departmentInfo', JSON.stringify(newData));
            alert('Info saved!');
        }

        button.textContent = editingDept ? 'Save Info' : 'Edit Info';
    });


});

function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}
