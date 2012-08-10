phonetodesktop-chrome
=====================

Phone to Desktop opensource project - Chrome/Chromium extension

Refer to https://github.com/xisberto/phonetodesktop as the Android app related.

Note on non-free files
----------------------

This repository doesn't contains some files that are included or used on the final build of the app. These are instructions that can help you to recreate these files.

* File credentials.js
  
It's a list of javascript variables that only defines the API key for Google Tasks API. The correct content for this file should be:

		var oauth_consumer_key = "API key";
		var oauth_consumer_secret = "Client secret";
		var clientId = 'Client ID';
		var scopes = 'https://www.googleapis.com/auth/tasks';

