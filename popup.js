document.getElementById("btn").addEventListener('click', async function () {

    const [tab] = await chrome.tabs.query({active: true, currentWindow: true});

    if (tab.url.includes("translate.google")) {
        chrome.tabs.sendMessage(tab.id, {
            action: 'download_csv'
        });
    }
});