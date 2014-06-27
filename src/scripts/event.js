var activated = new Array();

function checkForValidUrl(tabId, changeInfo, tab) {
    chrome.pageAction.show(tabId);
    activated[tabID] = false;
};

chrome.browserAction.onClicked.addListener(function(tab) {
    if(!activated[tab.id]){
        chrome.browserAction.setIcon({tabId: tab.id, path: 'src/images/sg-active.png'});
        activated[tab.id] = true;
    }else{
        chrome.browserAction.setIcon({tabId: tab.id, path: 'src/images/sg-inactive.png'});
        activated[tab.id] = false;
    }
    chrome.tabs.sendMessage(tab.id, "clicked");
});


chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.active) {
        chrome.browserAction.setIcon({tabId: sender.tab.id, path: 'src/images/sg-active.png'});
    }
    else {
        chrome.browserAction.setIcon({tabId: sender.tab.id, path: 'src/images/sg-inactive.png'});
    }
});
