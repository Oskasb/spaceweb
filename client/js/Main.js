"use strict";

var gameUtil;

require.config({
    paths: {
		shared:'./../../../Shared'
    }
});



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


	var socketMsgUrl = './../../../Shared/io/SocketMessages.js';

	var loadJS = function(url, implementationCode, location){
		//url is URL of external file, implementationCode is the code
		//to be called from the file, location is the location to
		//insert the <script> element

		var scriptTag = document.createElement('script');
		scriptTag.src = url;

		scriptTag.onload = implementationCode;
		scriptTag.onreadystatechange = implementationCode;

		location.appendChild(scriptTag);
	};

	var filesLoaded = function() {
		client.initiateClient(new SocketMessages());
		evt.fire(evt.list().CLIENT_READY, client);
	};

	GameScreen.registerAppContainer(document.body);

	var client = new Client(new PointerCursor(new InputState()));


	loadJS(socketMsgUrl, filesLoaded, document.body);



});
