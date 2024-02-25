var data = []; 
var currentFilteredData = []; 
var currentPage = 1;
var rowsPerPage = 8; 

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
    data = json.map(row => row.map(cell => cell.toString())); 
    currentPage = 1;
    displayRows(currentPage);
}

function displayRows(page) {
    var startIndex = (page - 1) * rowsPerPage;
    var endIndex = Math.min(startIndex + rowsPerPage, data.length);
    var resultTableBody = document.getElementById('resultTableBody');
    resultTableBody.innerHTML = ""; 

    for (var i = startIndex; i < endIndex; i++) {
        var row = data[i];
        var tr = document.createElement('tr');
        row.forEach(function(cell) {
            var td = document.createElement('td');
            td.textContent = cell;
            tr.appendChild(td);
        });
        resultTableBody.appendChild(tr); 
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
        resultTableBody.appendChild(tr); 
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

var debouncedSearchSuburb = debounce(searchSuburb, 250); 



// Notepad section ---------------------------------------------------------------------------------------------------------------------------------------------------------------


function populateVersionSelector() {
    var versionSelector = document.getElementById('versionSelector');
    versionSelector.innerHTML = ''; 

 
    var timestamps = [];
    for (var i = 0; i < localStorage.length; i++) {
        var key = localStorage.key(i);
        if (key.startsWith('textData_')) {
            var timestamp = parseInt(key.split('_')[1]);
            timestamps.push(timestamp);
        }
    }
    timestamps.sort(function(a, b) { return b - a; }); 

    timestamps.forEach(function(timestamp) {
        var option = document.createElement('option');
        option.value = 'textData_' + timestamp;
        var date = new Date(timestamp);
        var formattedDate = date.toLocaleDateString('en-AU'); 
        var time = date.toLocaleTimeString('en-AU'); 
        option.textContent = 'Saved at ' + formattedDate + ' ' + time;
        versionSelector.appendChild(option);
    });
}

function loadSelectedVersion() {
    var versionSelector = document.getElementById('versionSelector');
    var selectedKey = versionSelector.value;
    var notePad = document.getElementById('notePad');

    if (selectedKey && localStorage.getItem(selectedKey)) {
        notePad.value = localStorage.getItem(selectedKey);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    populateVersionSelector();

    var notePad = document.getElementById('notePad');
    var saveInterval = 30 * 1000; 
    var deleteAfter = 60 * 60 * 1000; 


    function saveCurrentVersion() {
        var currentText = notePad.value;
        var mostRecentKey = null;
        var mostRecentTime = 0;
    
  
        for (var i = 0; i < localStorage.length; i++) {
            var key = localStorage.key(i);
            if (key.startsWith('textData_')) {
                var timestamp = parseInt(key.split('_')[1]);
                if (timestamp > mostRecentTime) {
                    mostRecentTime = timestamp;
                    mostRecentKey = key;
                }
            }
        }
    
    
        if (mostRecentKey) {
            var mostRecentText = localStorage.getItem(mostRecentKey);
            if (currentText === mostRecentText) {
                return;
            }
        }
    

        var timestamp = new Date().getTime();
        localStorage.setItem('textData_' + timestamp, currentText);
        deleteOldVersions();
        populateVersionSelector(); 
    }

    function populateVersionSelector() {
    var versionSelector = document.getElementById('versionSelector');
    versionSelector.innerHTML = ''; 


    var timestamps = [];
    for (var i = 0; i < localStorage.length; i++) {
        var key = localStorage.key(i);
        if (key.startsWith('textData_')) {
            var timestamp = parseInt(key.split('_')[1]);
            timestamps.push(timestamp);
        }
    }
    timestamps.sort(function(a, b) { return b - a; }); 

 
    timestamps.forEach(function(timestamp) {
        var option = document.createElement('option');
        option.value = 'textData_' + timestamp;
        var date = new Date(timestamp);
        var formattedDate = date.toLocaleDateString('en-AU'); 
        var time = date.toLocaleTimeString('en-AU'); 
        option.textContent = 'Saved at ' + formattedDate + ' ' + time;
        versionSelector.appendChild(option);
    });
}

    
    function deleteOldVersions() {
        var currentTime = new Date().getTime();
        for (var i = 0; i < localStorage.length; i++) {
            var key = localStorage.key(i);
            if (key.startsWith('textData_')) {
                var timestamp = parseInt(key.split('_')[1]);
                if (currentTime - timestamp > deleteAfter) {
                    localStorage.removeItem(key);
                }
            }
        }
    }

  
    var mostRecentKey;
    var mostRecentTime = 0;
    for (var i = 0; i < localStorage.length; i++) {
        var key = localStorage.key(i);
        if (key.startsWith('textData_')) {
            var timestamp = parseInt(key.split('_')[1]);
            if (timestamp > mostRecentTime) {
                mostRecentTime = timestamp;
                mostRecentKey = key;
            }
        }
    }
    if (mostRecentKey) {
        notePad.value = localStorage.getItem(mostRecentKey);
    }

  
    setInterval(saveCurrentVersion, saveInterval);
});

function changeVersion(delta) {
    var versionSelector = document.getElementById('versionSelector');
    var currentIndex = versionSelector.selectedIndex;
    var newIndex = currentIndex + delta;

  
    if (newIndex >= 0 && newIndex < versionSelector.options.length) {
        versionSelector.selectedIndex = newIndex; 
        loadSelectedVersion(); 
    }
}


document.getElementById('prevVersion').addEventListener('click', function() {
    changeVersion(-1); 
});

document.getElementById('nextVersion').addEventListener('click', function() {
    changeVersion(1); 
});

