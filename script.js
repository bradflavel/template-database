var data = []; // Array to store processed data
var currentFilteredData = []; // Array to store filtered data
var currentPage = 1;
var rowsPerPage = 4; // Adjust the number of rows per page as needed

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



// Notepad section ---------------------------------------------------------------------------------------------------------------------------------------------------------------


function populateVersionSelector() {
    var versionSelector = document.getElementById('versionSelector');
    versionSelector.innerHTML = ''; // Clear existing options

    // Collect all timestamps and sort them
    var timestamps = [];
    for (var i = 0; i < localStorage.length; i++) {
        var key = localStorage.key(i);
        if (key.startsWith('textData_')) {
            var timestamp = parseInt(key.split('_')[1]);
            timestamps.push(timestamp);
        }
    }
    timestamps.sort(function(a, b) { return b - a; }); // Sort in descending order

    // Add sorted timestamps to the dropdown
    timestamps.forEach(function(timestamp) {
        var option = document.createElement('option');
        option.value = 'textData_' + timestamp;
        var date = new Date(timestamp);
        var formattedDate = date.toLocaleDateString('en-AU'); // Australian date format
        var time = date.toLocaleTimeString('en-AU'); // Australian time format
        option.textContent = 'Saved at ' + formattedDate + ' ' + time;
        versionSelector.appendChild(option);
    });
}

// Function to load the selected version
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
    var saveInterval = 30 * 1000; // 30 seconds
    var deleteAfter = 60 * 60 * 1000; // 60 minutes

    // Function to save the current version
    function saveCurrentVersion() {
        var currentText = notePad.value;
        var mostRecentKey = null;
        var mostRecentTime = 0;
    
        // Find the most recent saved version
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
    
        // Compare current text with the most recent saved version
        if (mostRecentKey) {
            var mostRecentText = localStorage.getItem(mostRecentKey);
            if (currentText === mostRecentText) {
                // If the text is the same, do not save a new version
                return;
            }
        }
    
        // Save the new version
        var timestamp = new Date().getTime();
        localStorage.setItem('textData_' + timestamp, currentText);
        deleteOldVersions();
        populateVersionSelector(); // Update the selector with the new version
    }

    function populateVersionSelector() {
    var versionSelector = document.getElementById('versionSelector');
    versionSelector.innerHTML = ''; // Clear existing options

    // Collect all timestamps and sort them
    var timestamps = [];
    for (var i = 0; i < localStorage.length; i++) {
        var key = localStorage.key(i);
        if (key.startsWith('textData_')) {
            var timestamp = parseInt(key.split('_')[1]);
            timestamps.push(timestamp);
        }
    }
    timestamps.sort(function(a, b) { return b - a; }); // Sort in descending order

    // Add sorted timestamps to the dropdown
    timestamps.forEach(function(timestamp) {
        var option = document.createElement('option');
        option.value = 'textData_' + timestamp;
        var date = new Date(timestamp);
        var formattedDate = date.toLocaleDateString('en-AU'); // Australian date format
        var time = date.toLocaleTimeString('en-AU'); // Australian time format
        option.textContent = 'Saved at ' + formattedDate + ' ' + time;
        versionSelector.appendChild(option);
    });
}

    // Function to delete versions older than 30 minutes
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

    // Load the most recent version
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

    // Save data every 10 seconds
    setInterval(saveCurrentVersion, saveInterval);
});

function changeVersion(delta) {
    var versionSelector = document.getElementById('versionSelector');
    var currentIndex = versionSelector.selectedIndex;
    var newIndex = currentIndex + delta;

    // Check bounds
    if (newIndex >= 0 && newIndex < versionSelector.options.length) {
        versionSelector.selectedIndex = newIndex; // Change the selected index
        loadSelectedVersion(); // Load the selected version
    }
}

// Event listeners for the buttons
document.getElementById('prevVersion').addEventListener('click', function() {
    changeVersion(-1); // Previous version
});

document.getElementById('nextVersion').addEventListener('click', function() {
    changeVersion(1); // Next version
});

/* Script for Departments */

var content = document.getElementById('infoContent');
var scrollButton = document.getElementById('scrollButton'); // Button for controlling scroll
var speed = 0; // Initial speed is zero (no scrolling)
var yPos = 0; // Current position

// Function to handle the scrolling animation
function scrollContent() {
    yPos -= speed;
    if (yPos < -content.offsetHeight / 2) {
        yPos = 0;
    }
    content.style.transform = 'translateY(' + yPos + 'px)';
    requestAnimationFrame(scrollContent);
}

// Duplicate the content to create a continuous loop
document.addEventListener('DOMContentLoaded', function() {
    content.innerHTML += content.innerHTML; // Duplicate the content
    requestAnimationFrame(scrollContent); // Start the animation
});

// Adjust the speed when hovering over the button
scrollButton.onmouseover = function() { speed = 1; }; // Set a positive speed
scrollButton.onmouseout = function() { speed = 0; }; // Stop the scrolling
