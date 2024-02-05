var data = []; // Changed to an array to store processed data
var currentPage = 1;
var rowsPerPage = 100; // Adjust the number of rows per page as needed

function loadExcelData() {
    var file = document.getElementById('fileInput').files[0];
    var reader = new FileReader();

    reader.onload = function(e) {
        var workbook = XLSX.read(e.target.result, {
            type: 'binary'
        });

        // Assuming your data is on the first sheet
        var firstSheetName = workbook.SheetNames[0];
        var worksheet = workbook.Sheets[firstSheetName];
        
        // Convert sheet to JSON
        var json = XLSX.utils.sheet_to_json(worksheet, {header:1});
        processExcelData(json);
    };

    reader.readAsBinaryString(file);
}

function processExcelData(json) {
    // Assuming each row in json is an array of cell values
    json.forEach(function(row) {
        if (row.length > 0) {
            // Example: push the entire row; adjust based on your data structure
            data.push(row);
        }
    });
    displayRows(currentPage);
}



function displayRows(page) {
    var startIndex = (page - 1) * rowsPerPage;
    var endIndex = Math.min(startIndex + rowsPerPage, data.length);
    var resultTable = document.getElementById('resultTable');

    resultTable.innerHTML = ""; // Clear previous results
    // Add table header here if necessary

    for (var i = startIndex; i < endIndex; i++) {
        var row = data[i];
        // Code to create and append each row to the resultTable
        // Example: Assuming row is an array of cell values
        var tr = document.createElement('tr');
        row.forEach(function(cell) {
            var td = document.createElement('td');
            td.textContent = cell;
            tr.appendChild(td);
        });
        resultTable.appendChild(tr);
    }

    // Update pagination info
    document.getElementById('pageInfo').textContent = `Page ${page} of ${Math.ceil(data.length / rowsPerPage)}`;
}

function changePage(delta) {
    var newPage = currentPage + delta;
    var totalPages = Math.ceil(data.length / rowsPerPage);
    if (newPage > 0 && newPage <= totalPages) {
        currentPage = newPage;
        displayRows(currentPage);
    }
}


function capitalize(str) {
    return str.replace(/\b\w/g, function(char) { return char.toUpperCase(); });
}

function updateResultsTable(filter) {
    var resultTable = document.getElementById('resultTable');
    resultTable.innerHTML = ""; // Clear previous results
    // Add table header here

    for (var i = 0; i < data.length; i++) {
        if (data[i][0].toLowerCase().includes(filter)) {
            var tr = document.createElement('tr');
            for (var j = 0; j < data[i].length; j++) {
                var td = document.createElement('td');
                var cellContent = (j === 0) ? capitalize(data[i][j]) : data[i][j]; // Capitalize only the first cell (suburb name)
                td.textContent = cellContent;
                tr.appendChild(td);
            }
            resultTable.appendChild(tr);
        }
    }
}

function debounce(func, wait) {
    let timeout;

    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };

        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}


function searchSuburb() {
    var input = document.getElementById('suburbInput').value.trim().toLowerCase();

    if (input === "") {
        // When input is cleared, reset to the first page of the original data
        currentPage = 1;
        displayRows(currentPage);
    } else {
        updateResultsTable(input);
    }
}


var debouncedSearchSuburb = debounce(searchSuburb, 250); // 250 milliseconds wait
