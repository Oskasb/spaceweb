"use strict";

var gameUtil;

require.config({
	paths: {
		shared:'./../../../Shared',
		PipelineAPI:'./lib/data_pipeline/src/PipelineAPI',
		data_pipeline:'./lib/data_pipeline/src/'
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
	'Events',
	'PipelineAPI'
], function(
	Client,
	GameScreen,
	InputState,
	PointerCursor,
	evt,
	PipelineAPI

	) {

	GameScreen.registerAppContainer(document.body);

	var loadUrls = [
		'./../../../Shared/io/SocketMessages.js',
		'./../../../Shared/MATH.js',
		'./../../../Shared/MODEL.js',
		'./../../../Shared/GAME.js'
	];

	var jsonRegUrl = './client/json/config_urls.json';
	window.jsonConfigUrls = 'client/json/';
	
	
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

		console.log("Pipeline Ready State:", PipelineAPI.checkReadyState());

		if (count == loadUrls.length) {
			var client = new Client(new PointerCursor(new InputState()));
			client.initiateClient(new SocketMessages());
			evt.fire(evt.list().CLIENT_READY, client);
		}

	};

	var pipelineOn = true;

	var dataPipelineSetup = {
		"jsonPipe":{
			"polling":{
				"enabled":pipelineOn,
				"frequency":30
			}
		},
		"svgPipe":{
			"polling":{
				"enabled":false,
				"frequency":2
			}
		},
		"imagePipe":{
			"polling":{
				"enabled":false,
				"frequency":2
			}
		}
	};


	PipelineAPI.dataPipelineSetup(jsonRegUrl, dataPipelineSetup);


	console.log("Pipeline Ready State:", PipelineAPI.checkReadyState());


	for (var i = 0; i < loadUrls.length; i++) {
		loadJS(loadUrls[i], filesLoaded, document.body);
	}


});
