"use strict";

var gameUtil;

require.config({
    paths: {

    }
});



require(["application/Client"], function(Client) {
	var client = new Client();

    client.initiateClient();
});
