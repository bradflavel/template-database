var data = [];
var currentFilteredData = [];
var currentPage = 1;
var rowsPerPage = 4;

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
        (row[0] && typeof row[0] === 'string' && row[0].toLowerCase().includes(filter)) ||
        (row[2] && typeof row[2] === 'string' && row[2].toLowerCase().includes(filter))
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

// PDF Generation Function
document.getElementById('generate-pdf').addEventListener('click', function() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 10;
    const contentWidth = pageWidth - 2 * margin;

    // Get current date in Australian format DD/MM/YYYY
    const today = new Date();
    const dateString = today.getDate().toString().padStart(2, '0') + '/' + 
                       (today.getMonth() + 1).toString().padStart(2, '0') + '/' + 
                       today.getFullYear();

    // Set the background color for the entire page
    const setPageBackground = () => {
        doc.setFillColor('#143200'); // Fern color
        doc.rect(0, 0, pageWidth, pageHeight, 'F');
    };

    // Add a new page with background
    const addNewPageWithBackground = () => {
        doc.addPage();
        setPageBackground();
    };

    // Set initial page background
    setPageBackground();

    // Add header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor('#EEEAD9'); // Sand color
    doc.text('Team Global Express', margin, 20);
    doc.text(`Chat Transcript - ${dateString}`, margin, 30);

    // Set text color to black for content readability
    doc.setTextColor('#000000'); // Black color for text
    doc.setFont("helvetica", "normal"); // Ensure proper font encoding
    doc.setFontSize(11); // Reduce font size to 70%

    // Prepare transcript text
    const transcriptText = document.getElementById('transcript-input').value;
    const lines = transcriptText.split('\n').map(line => ({ text: line }));

    // Colors for background of User, Agent, and Bot text (lighter shades for readability)
    const colors = {
        USER: '#F7F7F7', // Very light grey
        AGENT: '#E8E8E8', // Light grey
        BOT: '#DCDCDC' // Slightly darker grey
    };

    const getColor = (text) => {
        if (text.startsWith('USER:')) return colors.USER;
        if (text.startsWith('AGENT:')) return colors.AGENT;
        if (text.startsWith('BOT:')) return colors.BOT;
        return '#FFFFFF';
    };

    // Ensure the text does not overflow the page and wraps correctly
    const splitText = (text) => {
        return doc.splitTextToSize(text, contentWidth - 20); // Adjusted to fit inside the container
    };

    // Add the sand-colored container with rounded edges
    const addSandContainer = (height) => {
        doc.setFillColor('#EEEAD9'); // Sand color for container padding
        doc.roundedRect(margin, margin + 40, contentWidth, height, 5, 5, 'F'); // Rounded rectangle for chat background
    };

    // Calculate the total height needed for the chat text
    const totalHeight = lines.reduce((sum, line) => sum + (splitText(line.text).length * 7) + 7, 0);

    // Add the sand-colored container
    addSandContainer(totalHeight);

    // Add the chat text inside the sand-colored container
    let yPosition = 50; // Start position for the content
    lines.forEach((line, index) => {
        const textLines = splitText(line.text);
        const color = getColor(line.text);

        // Set the background color for the current text block
        doc.setFillColor(color);
        const blockHeight = textLines.length * 7 + 7; // Estimate height with padding

        if (yPosition + blockHeight > pageHeight - margin) {
            addNewPageWithBackground();
            addSandContainer(totalHeight - yPosition + 50); // Adjust the container height for the new page
            yPosition = margin + 50;
        }

        doc.rect(margin + 5, yPosition, contentWidth - 10, blockHeight, 'F'); // Background rectangle inside the sand container
        doc.text(textLines, margin + 10, yPosition + 7); // Text with padding
        yPosition += blockHeight; // Adjust yPosition for the next block
    });

    // Save the PDF
    doc.save('transcript.pdf');
});
