console.log("IN EVENT");
chrome.browserAction.onClicked.addListener(function(tab) {
    console.log(tab);
    chrome.tabs.sendMessage(tab.id, "clicked");
});
