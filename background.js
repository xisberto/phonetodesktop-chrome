function contextMenuClick(onClickData, tab) {
    console.log(onClickData);
    console.log(tab.url);
    if (onClickData.menuItemId == "link" || onClickData.menuItemId == "page") {
        var task_title;
        if (onClickData.linkUrl != undefined) {
            console.log("enviando link");
            task_title = onClickData.linkUrl;
        } else if (onClickData.selectionText != undefined) {
            console.log("enviando texto selecionado");
            task_title = onClickData.selectionText;
        } else if (onClickData.pageUrl != undefined) {
            console.log("enviando url");
            task_title = onClickData.pageUrl;
        }

        if (task_title == undefined) {
            return;
        }

        var list_id = localStorage.getItem("list_id");
        var url = "https://www.googleapis.com/tasks/v1/lists/"+list_id+"/tasks";
        var request = {
            'method': 'POST',
            'headers': {
                'content-type': 'application/json'
            },
            'body': '{"title": "'+task_title+'"}'
        };
        var callback = function(resp, xhr) {
            chrome.browserAction.setBadgeText({"text": ""});
            if (xhr.status == 200) {
                console.log("OK");
                console.log(resp);
            } else {
                console.log("Error");
                console.log(resp);
            }
        }
        chrome.browserAction.setBadgeText({"text": "…"});
        oauth.sendSignedRequest(url, callback, request);
    }
    
}

chrome.contextMenus.onClicked.addListener(contextMenuClick);

chrome.runtime.onInstalled.addListener(function() {
    console.log("Running on installation");
    
    chrome.browserAction.setBadgeBackgroundColor({"color": "#669900"});
    
    chrome.contextMenus.create({
        title: chrome.i18n.getMessage("send_to_mobile"),
        contexts: ["link", "selection"],
        id: "link"
    });
    chrome.contextMenus.create({
        title: chrome.i18n.getMessage("send_page_to_mobile"),
        contexts: ["page"],
        id: "page"
    });
});