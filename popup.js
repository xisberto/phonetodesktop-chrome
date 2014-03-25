var oauth = chrome.extension.getBackgroundPage().oauth;

function saveListId() {
    var url = "https://www.googleapis.com/tasks/v1/users/@me/lists";
    var request = {
        'method': 'GET'
    };
    var oauth_callback = function(resp, xhr) {
        resp = JSON.parse(resp);
        var lists = resp.items;
        for (i in lists) {
            console.log("Lista: "+lists[i].title);
            if (lists[i].title == "PhoneToDesktop") {
                localStorage.setItem('list_id', lists[i].id);
            }
        }
        console.log('lista salva no localStorage: '+localStorage.getItem('list_id'));
        if (localStorage.getItem('list_id') == null) {
            alertNoList();
        }
    };
    oauth.sendSignedRequest(url, oauth_callback, request);
}

function reset_configuration() {
    localStorage.removeItem('list_id');
    oauth.clearTokens();
    var background_page = chrome.extension.getBackgroundPage();
    chrome.runtime.reload();
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
        saveListId();
        return;
    } else {
        chrome.extension.getBackgroundPage().removeEventListener("storage", handle_list_id_updated, false);
        var url = "https://www.googleapis.com/tasks/v1/lists/"+list_id+"/tasks";
        var request = {
            'method': 'GET'
        };
        var callback = function(resp, xhr) {
            if (xhr.status == 200) {
                resp = JSON.parse(resp);
                listTasks(resp.items);
            } else {
                alertNoList();
            }
        }
        oauth.sendSignedRequest(url, callback, request);
    }
}

function delete_item(event){
    var parent = $(this).parent().parent();
    var list_id = localStorage.getItem('list_id');
    var task_id = parent.attr("id");
    var url = "https://www.googleapis.com/tasks/v1/lists/"+list_id+"/tasks/"+task_id;
    var request = {
        'method': 'DELETE'
    };
    var callback = function(resp, xhr){
        if (resp) {
            parent.slideDown(300, function(){
                parent.addClass('min_height');
            });
        } else {
            parent.remove();
        }
    };
    parent.removeClass('min_height');
    parent.slideUp(300, function(){
        oauth.sendSignedRequest(url, callback, request);
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
    button_reset = $("<a class='btn'>");
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
    for (j in tasks) {
        if (tasks[j].title=="") {
            continue;
        }
        var item = $("<div class='linear_layout min_height'>");
        item.attr("id", tasks[j].id);
        
        var div_btns = $("<div class='btns'>");
        div_btns.appendTo(item);
        
        var div_text = $("<div class='task_text'>")
        div_text.text(tasks[j].title).appendTo(item);
        div_text.linkify({
            target: "_blank"
        });
        
        var btn_del = $("<a class='btn'>");
        btn_del.append("<i class='icon-trash'></i>");
        btn_del.click(delete_item);
        btn_del.appendTo(div_btns);
        
        item.appendTo($("#task_list"));
    }
    $("#actionbar_tab a[href='#tab_list']").tab('show');
}

function prepareHTMLTexts(){
    $("a[href='#tab_list'] span").text(chrome.i18n.getMessage("tab_list"));
    $("a[href='#tab_about'] span").text(chrome.i18n.getMessage("tab_about"));
    $("#btn_reset").text(chrome.i18n.getMessage("reset_configuration"));
    $("<p>")
        .text(chrome.i18n.getMessage("about_message1"))
        .linkify({
            target: "_blank"
        })
        .appendTo($("#about_message"));
    $("<p>")
        .text(chrome.i18n.getMessage("about_message2"))
        .linkify({
            target: "_blank"
        })
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
