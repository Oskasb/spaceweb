PacketHandler = function(sys) {
	this.sys = sys;
};

PacketHandler.prototype.createPacket = function(header, data) {
	var packet = ""+header+"|"+data+"";
	return packet;
};

PacketHandler.prototype.packetDataFromArray = function(array) {
	var dataPacket = ""+array[0]+"";
	for (var i = 1; i < array.length; i++) {
		dataPacket = ""+dataPacket+"|"+array[i]+"";
	}
	return dataPacket;
};

PacketHandler.prototype.parsePacketHeader = function(packet) {
	var splitPacket = packet.split("|", 1);	
	return splitPacket[0];
};

PacketHandler.prototype.createDataWithHeader = function(header, data) {
	var msg = {
		header:header,
		data:data
	};
	return msg;
};

PacketHandler.prototype.parseDataString = function(string) {
	var splitString = string.split("|");
	var data = [];
	
	for (var i = 0; i < splitString.length; i++) {
		data.push(splitString[i]);
	}
	return data;
};

PacketHandler.prototype.parseChatData = function(string) {

	var splitString = string.split("|");
	var data = {
			actor:splitString[1],
			channel:splitString[2],
			text:splitString[3]
		};
	return data;
};