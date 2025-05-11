// Content script for a Google Chrome Extension

// cannot be const because we want to allow the user to select custom separators
separator = '';
endElement = '';

function setDefaults() {
    const defaults = {
    init: true,
    separator: ';',
    endElement: '\n',
    }

    chrome.storage.sync.get(['init'], function(result) {
        if (!result.init){
            chrome.storage.sync.set(defaults);
        }
    });

    chrome.storage.sync.get(['separator', 'endElement'], function (result) {
        separator = result.separator;
        endElement = result.endElement;
    });
}

window.onload = function onload() {

    // Continues with the job that was previously started
    chrome.storage.local.get(['working'], function (result) {
        if (result['working']) {
            console.log("detected working!");
            console.log(result);
            list = getTranslateHistoryAsList();
            file = formatListAsCSV(list);
            downloadFile(file);
            chrome.storage.local.set({working: false});
        }
    });

    // 1. Check whether we are indeed on google translate
    const domain = window.location.href;
    const gt_domain_include = "translate.google";


    if (domain.includes(gt_domain_include)) {
        setDefaults();

        chrome.runtime.onMessage.addListener((message, sender, addResponse) => {
            if (message.action === "download_csv") {
                // TODO: implement logic to handle when page is already in the correct state
                // prepPage();
                list = getTranslateHistoryAsList();
                file = formatListAsCSV(list);
                downloadFile(file);
            }
        });

    }
}

// Opens the "./history" page so that the extension can scrape the history elements
function prepPage() {
    const history_button_selector = '[href="./history"]';
    const history_page_include = "history";
    
    if (window.location.href.includes("history")) {
        return;
    }

    history_button = document.querySelector(history_button_selector);
    chrome.storage.local.set({working: true});
    history_button.click();
}

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

// TODO: rename perhaps? -> download sequence / string?
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