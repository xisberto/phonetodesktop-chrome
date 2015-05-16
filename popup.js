function authenticatedXhr(method, url, interactive, callback) {
    var access_token;

    var retry = true;

    getToken();

    function getToken() {
        chrome.identity.getAuthToken({ interactive: interactive }, function(token) {
            if (chrome.runtime.lastError) {
                callback(chrome.runtime.lastError);
                return;
            }
            
            console.log("token: " + token);

            access_token = token;
            requestStart();
        });
    }

    function requestStart() {
        var xhr = new XMLHttpRequest();
        xhr.open(method, url);
        xhr.setRequestHeader('Authorization', 'Bearer ' + access_token);
        xhr.onload = requestComplete;
        xhr.send();
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

function saveListId(interactive) {
    var url = "https://www.googleapis.com/tasks/v1/users/@me/lists";
    authenticatedXhr('GET', url, interactive, function(error, status, response){
        if (error != undefined) {
            console.log("No list returned");
            return;
        }
        resp = JSON.parse(response);
        var lists = resp.items;
        for (i in lists) {
            console.log("Lista: " + lists[i].title);
            if (lists[i].title == "PhoneToDesktop") {
                localStorage.setItem('list_id', lists[i].id);
            }
        }
        console.log('lista salva no localStorage: '+localStorage.getItem('list_id'));
        if (localStorage.getItem('list_id') == null) {
            alertNoList();
        }
    });
}

function reset_configuration() {
    localStorage.removeItem('list_id');
    console.log("reset_configuration");
    console.log("list_id: "+localStorage.getItem("list_id"));
    loadTasks();
}

function handle_list_id_updated(e) {
    if (e.key == 'list_id') {
        loadTasks();
    }
}

function loadTasks() {
    $("#actionbar_tab a[href='#tab_wait']").tab('show');
    var list_id = localStorage.getItem('list_id');
    if (list_id == null){
        chrome.extension.getBackgroundPage().addEventListener("storage", handle_list_id_updated, false);
        saveListId(true);
        return;
    } else {
        chrome.extension.getBackgroundPage().removeEventListener("storage", handle_list_id_updated, false);
        var url = "https://www.googleapis.com/tasks/v1/lists/"+list_id+"/tasks";
        var callback = function(error, status, resp) {
            if (status == 200) {
                resp = JSON.parse(resp);
                listTasks(resp.items);
            } else {
                alertNoList();
            }
        }
        authenticatedXhr('GET', url, false, callback);
    }
}

function delete_item(event){
    var parent = $(this).parent().parent();
    var list_id = localStorage.getItem('list_id');
    var task_id = parent.attr("id");
    var url = "https://www.googleapis.com/tasks/v1/lists/"+list_id+"/tasks/"+task_id;
    var callback = function(error, status, resp){
        if (status != 204) {
            parent.slideDown(300, function(){
                parent.addClass('min_height');
            });
        } else {
            parent.remove();
        }
    };
    parent.removeClass('min_height');
    parent.slideUp(300, function(){
        authenticatedXhr('DELETE', url, false, callback);
    });
}

function alertNoList() {
    $("#task_list").empty();
    linear_layout = $("<div class='linear_layout min_height'>");
    message_authorize = $("<p>");
    message_authorize.text(chrome.i18n.getMessage("needAuthorizeApp"));
    message_authorize.linkify({
        target: "_blank"
    });
    
    message_reset = $("<p>");
    message_reset.text(chrome.i18n.getMessage("needResetConf"));
    button_reset = $("<a class='btn btn-default'>");
    button_reset.text(chrome.i18n.getMessage("reset_configuration"));
    button_reset.click(reset_configuration);
    message_reset.append(button_reset);
    
    linear_layout.append(message_authorize);
    linear_layout.append(message_reset);
    linear_layout.appendTo($("#task_list"));
    $("#actionbar_tab a[href='#tab_list']").tab('show');
}

function listTasks(tasks) {
    $("#task_list").empty();
	var autolinker = new Autolinker();
    for (j in tasks) {
        if (tasks[j].title=="") {
            continue;
        }
        var item = $("<div class='linear_layout min_height'>");
        item.attr("id", tasks[j].id);
        
        var div_btns = $("<div class='btns'>");
        div_btns.appendTo(item);
        
        var div_text = $("<div class='task_text'>");
		var task_title = autolinker.link(tasks[j].title);
        div_text.html(task_title).appendTo(item);
        
        var btn_del = $("<a class='btn btn-default'>");
        btn_del.append("<img src='images/delete.png' />");
        btn_del.click(delete_item);
        btn_del.appendTo(div_btns);
        
        item.appendTo($("#task_list"));
    }
    $("#actionbar_tab a[href='#tab_list']").tab('show');
}

function prepareHTMLTexts(){
    $("a[href='#tab_list']").text(chrome.i18n.getMessage("tab_list"));
    $("a[href='#tab_about']").text(chrome.i18n.getMessage("tab_about"));
    $("#btn_reset").text(chrome.i18n.getMessage("reset_configuration"));
	var autolinker = new Autolinker();
	var message1_text = autolinker.link(chrome.i18n.getMessage("about_message1"));
	var message2_text = autolinker.link(chrome.i18n.getMessage("about_message2"));
    $("<p>")
        .html(message1_text)
        .appendTo($("#about_message"));
    $("<p>")
        .html(message2_text)
        .appendTo($("#about_message"));
}

$(document).ready(function(){
    $("#actionbar_tab a").click(function(e){
        e.preventDefault();
        $(this).tab('show');
    });
    $("#btn_refresh").click(function(e){
        loadTasks();
    });
    $("#btn_reset").click(function(e){
        reset_configuration();
    });
    prepareHTMLTexts();
    loadTasks();
});
