"use strict";

var gameUtil;

require.config({
	paths: {
		shared:'./../../../Shared'
	}
});

var DEBUG_MONITOR = function(text) {
	document.querySelector('#monitor').innerHTML = text;
};

require([
	'application/Client',
	'ui/GameScreen',
	'io/InputState',
	'io/PointerCursor',
	'Events'
], function(
	Client,
	GameScreen,
	InputState,
	PointerCursor,
	evt
	) {

	GameScreen.registerAppContainer(document.body);

	var loadUrls = [
		'./../../../Shared/io/SocketMessages.js',
		'./../../../Shared/MATH.js',
		'./../../../Shared/MODEL.js',
		'./../../../Shared/GAME.js'
	];

	var loadJS = function(url, implementationCode, location){
		//url is URL of external file, implementationCode is the code
		//to be called from the file, location is the location to
		//insert the <script> element

		var scriptTag = document.createElement('script');
		scriptTag.src = url;

		scriptTag.onload = implementationCode;
		//	scriptTag.onreadystatechange = implementationCode;

		location.appendChild(scriptTag);
	};

	var count = 0;
	var filesLoaded = function() {
		count++;
		if (count == loadUrls.length) {
			var client = new Client(new PointerCursor(new InputState()));
			client.initiateClient(new SocketMessages());
			evt.fire(evt.list().CLIENT_READY, client);
		}

	};





	for (var i = 0; i < loadUrls.length; i++) {
		loadJS(loadUrls[i], filesLoaded, document.body);
	}


});
