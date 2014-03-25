function createContextMenu() {
    chrome.contextMenus.create({
        title: chrome.i18n.getMessage("send_to_mobile"),
        contexts: ["link", "selection"],
        onclick: contextMenuClick
    });
}

function contextMenuClick(onClickData, tab) {
    console.log(onClickData);
    console.log(tab.url);
    var task_title;
    if (onClickData.linkUrl != null) {
        console.log("enviando link");
        task_title = onClickData.linkUrl;
    } else if (onClickData.selectionText != null) {
        console.log("enviando texto selecionado");
        task_title = onClickData.selectionText;
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
        if (xhr.status == 200) {
            console.log("OK");
            console.log(resp);
        } else {
            console.log("Error");
            console.log(resp);
        }
    }
    oauth.sendSignedRequest(url, callback, request);
}

var oauth = ChromeExOAuth.initBackgroundPage({
    'request_url': 'https://www.google.com/accounts/OAuthGetRequestToken',
    'authorize_url': 'https://www.google.com/accounts/OAuthAuthorizeToken',
    'access_url': 'https://www.google.com/accounts/OAuthGetAccessToken',
    'consumer_key': clientId,
    'consumer_secret': oauth_consumer_secret,
    'scope': 'https://www.googleapis.com/auth/tasks',
    'app_name': 'PhoneToDesktop',
    'callback_page': 'chrome_ex_oauth.html'
});

oauth.authorize(function(){ });
createContextMenu();
