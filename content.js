// This script is meant to run as a Chrome Extension

const separator = ';';
const endElement = '\n';

window.onload = function onload() {
    // 1. Check whether we are indeed on google translate
    const domain = window.location.href;
    const gt_domain_include = "translate.google";
    if (domain.includes(gt_domain_include)) {
        // prepare for some sort of trigger? 
        // ... wait or listen?

        // We open the popup which might have a button to start downloading all the translations
        // TODO: evaluate why the below doesn't work.
        // chrome.action.openPopup();

        // The Popup triggers the start of the download.

    }
}

chrome.runtime.onMessage.addListener((message, sender, addResponse) => {
    if (message.action === "download_csv") {
        list = getTranslateHistoryAsList();
        file = formatListAsCSV(list);
        downloadFile(file);
    }
});

// Requires that all child translations that want to be downloaded are loaded on the page
function getTranslateHistoryAsList() {
    container_selector = '[jsname="dJDgTb"]';
    // alternative -> '[role="list"]'

    container = document.querySelector(container_selector);
    console.log("container: " + container);
    c_children = container.children;

    list = [];

    // c_children only contains these history terms
    // but they are each labelled with class "vvNkBd"
    for (child of c_children) {
        // TODO: set these selectors as constants
        org = child.querySelector('[jsname="stQz5"]');
        dest = child.querySelector('[jsname="TyJMm"]');

        list.push([org.innerText, dest.innerText]);
        console.log("amended " + org + " : " + dest);
    }

    console.log("list!");
    console.log(list);

    return list;
}

// returns a single content-string for the list.
function formatListAsCSV(list) {
    out = "";
    for (translation of list) {
        out += translation[0];
        out += separator;
        out += translation[1];
        out += separator;
        out += endElement;
    }
    console.log(out);
    return out;
}

// Hacky solution; creating a hyperlink element
function downloadFile(file) {
    const blob = new Blob([file], {type: 'text/csv'});
    const url = URL.createObjectURL(blob);

    const hyperlink = document.createElement('a');
    hyperlink.href = url;
    hyperlink.download = 'translations.txt';
    hyperlink.style.display = 'none';
    document.body.appendChild(hyperlink);
    hyperlink.click();

    // once the download has finished, we should destroy the element.
    document.body.removeChild(hyperlink);
    URL.revokeObjectURL(blob);
}