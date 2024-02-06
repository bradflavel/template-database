var data = []; // Array to store processed data
var currentFilteredData = []; // Array to store filtered data
var currentPage = 1;
var rowsPerPage = 10; // Adjust the number of rows per page as needed

function loadExcelData() {
    var file = document.getElementById('fileInput').files[0];
    var reader = new FileReader();

    reader.onload = function(e) {
        var workbook = XLSX.read(e.target.result, { type: 'binary' });
        var firstSheetName = workbook.SheetNames[0];
        var worksheet = workbook.Sheets[firstSheetName];
        var json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        processExcelData(json);
    };

    reader.readAsBinaryString(file);
}

function processExcelData(json) {
    data = json.map(row => row.map(cell => cell.toString())); // Convert all cells to strings
    currentPage = 1;
    displayRows(currentPage);
}

function displayRows(page) {
    var startIndex = (page - 1) * rowsPerPage;
    var endIndex = Math.min(startIndex + rowsPerPage, data.length);
    var resultTableBody = document.getElementById('resultTableBody');
    resultTableBody.innerHTML = ""; // Clear previous results in the body

    for (var i = startIndex; i < endIndex; i++) {
        var row = data[i];
        var tr = document.createElement('tr');
        row.forEach(function(cell) {
            var td = document.createElement('td');
            td.textContent = cell;
            tr.appendChild(td);
        });
        resultTableBody.appendChild(tr); // Appending to tbody with id="resultTableBody"
    }

    document.getElementById('pageInfo').textContent = `Page ${page} of ${Math.ceil(data.length / rowsPerPage)}`;
}


function changePage(delta) {
    var newPage = currentPage + delta;
    var totalPages = currentFilteredData.length > 0 ? Math.ceil(currentFilteredData.length / rowsPerPage) : Math.ceil(data.length / rowsPerPage);

    if (newPage > 0 && newPage <= totalPages) {
        currentPage = newPage;
        if (currentFilteredData.length > 0) {
            displayFilteredRows(currentFilteredData, currentPage);
        } else {
            displayRows(currentPage);
        }
    }
}

function displayFilteredRows(filteredData, page) {
    var startIndex = (page - 1) * rowsPerPage;
    var endIndex = Math.min(startIndex + rowsPerPage, filteredData.length);
    var resultTableBody = document.getElementById('resultTableBody');
    resultTableBody.innerHTML = "";

    for (var i = startIndex; i < endIndex; i++) {
        var row = filteredData[i];
        var tr = document.createElement('tr');
        row.forEach(function(cell) {
            var td = document.createElement('td');
            td.textContent = cell;
            tr.appendChild(td);
        });
        resultTableBody.appendChild(tr); // Ensure appending to tbody
    }

    document.getElementById('pageInfo').textContent = `Page ${page} of ${Math.ceil(filteredData.length / rowsPerPage)}`;
}

function debounce(func, wait) {
    let timeout;

    return function executedFunction(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func(...args);
        }, wait);
    };
}

function updateResultsTable(filter) {
    // Filter data where the filter matches the suburb (first column) or postcode (third column)
    currentFilteredData = data.filter(row => 
        row[0].toLowerCase().includes(filter) || row[2].toLowerCase().includes(filter)
    );
    currentPage = 1;
    displayFilteredRows(currentFilteredData, currentPage);
}


function searchSuburb() {
    var input = document.getElementById('suburbInput').value.trim().toLowerCase();

    if (input === "") {
        currentFilteredData = [];
        currentPage = 1;
        displayRows(currentPage);
    } else {
        updateResultsTable(input);
    }
}

var debouncedSearchSuburb = debounce(searchSuburb, 250); // 250 milliseconds wait
