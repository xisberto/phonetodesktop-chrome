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
var displayed = JSON.parse(localStorage.getItem('list_displayed') || '{}'),
	linksReg = /((http|https|ftp)\:\/\/|\bw{3}\.)[a-z0-9\-\.]+\.[a-z]{2,3}(:[a-z0-9]*)?\/?([a-z\u00C0-\u017F0-9\-\._\?\,\'\/\\\+&amp;%\$#\=~])*/gi,
	get = function() {
		var list_id = localStorage.getItem('list_id');
		if (!navigator.onLine || !list_id) return;
	
		oauth.sendSignedRequest(
			"https://www.googleapis.com/tasks/v1/lists/"+list_id+"/tasks",
			function(resp) {
				resp = JSON.parse(resp);
				var j,
					i,
					tasks = resp.items,
					urls;
				for(j in tasks) {
					if(tasks[j].title !== "" && !displayed[tasks[j].id]) {
						urls = tasks[j].title.match(linksReg) || [];
						for(i = 0; i < urls.length; i++) {
							chrome.tabs.create({'url': urls[i]});
						}
					}
					displayed[tasks[j].id] = true;
				}
				localStorage.setItem('list_displayed', JSON.stringify(displayed));
			}, {
				'method': 'GET'
			}
		);
	};

oauth.authorize(function() {
	setInterval(get, 1e4);
});
