export function setupNotepad() {
    const notePad = document.getElementById('notePad');
    const versionSelector = document.getElementById('versionSelector');
    const saveInterval = 30 * 1000; 
    const deleteAfter = 60 * 60 * 1000; 
    populateVersionSelector();
    loadMostRecentVersion();

    setInterval(saveCurrentVersion, saveInterval);

    document.getElementById('prevVersion').addEventListener('click', () => changeVersion(-1));
    document.getElementById('nextVersion').addEventListener('click', () => changeVersion(1));
    versionSelector.addEventListener('change', loadSelectedVersion);

    function saveCurrentVersion() {
        const currentText = notePad.value;
        const mostRecentKey = getMostRecentKey();
        const mostRecentText = mostRecentKey ? localStorage.getItem(mostRecentKey) : null;

        if (currentText === mostRecentText) return;

        const timestamp = Date.now();
        localStorage.setItem(`textData_${timestamp}`, currentText);
        deleteOldVersions();
        populateVersionSelector();
    }

    function deleteOldVersions() {
        const now = Date.now();
        Object.keys(localStorage)
            .filter(key => key.startsWith('textData_'))
            .forEach(key => {
                const timestamp = parseInt(key.split('_')[1], 10);
                if (now - timestamp > deleteAfter) {
                    localStorage.removeItem(key);
                }
            });
    }

    function populateVersionSelector() {
        versionSelector.innerHTML = '';
        const versions = Object.keys(localStorage)
            .filter(key => key.startsWith('textData_'))
            .map(key => parseInt(key.split('_')[1], 10))
            .sort((a, b) => b - a);

        versions.forEach(timestamp => {
            const option = document.createElement('option');
            const date = new Date(timestamp);
            option.value = `textData_${timestamp}`;
            option.textContent = `Saved at ${date.toLocaleDateString('en-AU')} ${date.toLocaleTimeString('en-AU')}`;
            versionSelector.appendChild(option);
        });
    }

    function loadSelectedVersion() {
        const selectedKey = versionSelector.value;
        if (selectedKey && localStorage.getItem(selectedKey)) {
            notePad.value = localStorage.getItem(selectedKey);
        }
    }

    function loadMostRecentVersion() {
        const mostRecentKey = getMostRecentKey();
        if (mostRecentKey) {
            notePad.value = localStorage.getItem(mostRecentKey);
        }
    }

    function getMostRecentKey() {
        let mostRecentTime = 0;
        let mostRecentKey = null;

        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('textData_')) {
                const timestamp = parseInt(key.split('_')[1], 10);
                if (timestamp > mostRecentTime) {
                    mostRecentTime = timestamp;
                    mostRecentKey = key;
                }
            }
        });

        return mostRecentKey;
    }

    function changeVersion(delta) {
        const newIndex = versionSelector.selectedIndex + delta;
        if (newIndex >= 0 && newIndex < versionSelector.options.length) {
            versionSelector.selectedIndex = newIndex;
            loadSelectedVersion();
        }
    }
}
