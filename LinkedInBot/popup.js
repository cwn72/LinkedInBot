function scanHandler(e) {
    chrome.extension.sendMessage({directive: "start-scan"}, function(response) {
        this.close(); // close the popup when the background finishes processing request
    });
}

function clearDataHandler(e){
    chrome.extension.sendMessage({directive: "clear-data"}, function(response) {
        this.close(); // close the popup when the background finishes processing request
    });
}

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('start-scan').addEventListener('click', scanHandler);
    document.getElementById('clear-data').addEventListener('click', clearDataHandler);
})