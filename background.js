function authenticatedXhr(method, url, params, interactive, callback) {
    var access_token;

    var retry = true;

    getToken();

    function getToken() {
        chrome.identity.getAuthToken({ interactive: interactive }, function(token) {
            if (chrome.runtime.lastError) {
                callback(chrome.runtime.lastError);
                return;
            }
            
            console.log("token obtained");

            access_token = token;
            requestStart();
        });
    }

    function requestStart() {
        var xhr = new XMLHttpRequest();
        xhr.open(method, url);
        xhr.setRequestHeader("Authorization", "Bearer " + access_token);
        xhr.onload = requestComplete;
        if (params != null) {
            xhr.setRequestHeader("Content-Type", "application/json");
            xhr.send(params);
        } else {
            xhr.send();
        }
    }

    function requestComplete() {
        if (this.status == 401 && retry) {
            retry = false;
            chrome.identity.removeCachedAuthToken({ token: access_token }, 
                                                  getToken);
        } else {
            callback(null, this.status, this.response);
        }
    }
}

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
        var params = '{'+
            '   "title": "'+task_title+'"'+
            '}';
        console.log(params);
        var callback = function(error, status, resp) {
            chrome.browserAction.setBadgeText({"text": ""});
            if (status == 200) {
                console.log("OK");
                console.log(resp);
            } else {
                console.log("Error");
                console.log(resp);
            }
        }
        chrome.browserAction.setBadgeText({"text": "…"});
        authenticatedXhr('POST', url, params, false, callback)
    }
    
}

chrome.contextMenus.onClicked.addListener(contextMenuClick);

function configureContextMenus() {
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
}

chrome.runtime.onInstalled.addListener(function() {
    console.log("Running on install");
    chrome.identity.getAuthToken({ interactive: true }, function(token) {
        console.log("token obtained");
    });
    configureContextMenus();
});

chrome.runtime.onStartup.addListener(function() {
    console.log("Running on startup");
    
    chrome.browserAction.setBadgeBackgroundColor({"color": "#669900"});
    
    configureContextMenus();
});