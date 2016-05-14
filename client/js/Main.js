"use strict";

var gameUtil;

require.config({
    paths: {

    }
});



require(["application/Client"], function(Client) {
	var client = new Client();



	var hostname = window.location.hostname+":"+SOCKET_PORT;
//	hostname = '127.9.222.1:8080'
	console.log(hostname);

    client.initiateClient(hostname);
});
