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