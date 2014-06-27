chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.active) {
        chrome.browserAction.setIcon({tabId: sender.tab.id, path: 'src/images/sg-active.png'});
    }
    else {
        chrome.browserAction.setIcon({tabId: sender.tab.id, path: 'src/images/sg-inactive.png'});
    }
});
