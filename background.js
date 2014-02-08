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
	get = function() {
		var list_id = localStorage.getItem('list_id');
		if (!navigator.onLine || !list_id) return;
	
		oauth.sendSignedRequest(
			"https://www.googleapis.com/tasks/v1/lists/"+list_id+"/tasks",
			function(resp) {
				resp = JSON.parse(resp);
				var j,
					tasks = resp.items;
				for(j in tasks) {
					if(tasks[j].title === "" || displayed[tasks[j].id]) {
						continue;
					}
					chrome.tabs.create({'url': tasks[j].title.split(' ')[0]});
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
