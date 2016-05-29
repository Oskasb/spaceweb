"use strict";

define(function() {
    var func = function(){};
    return {
		INIT_CLIENT:{type:'INIT_CLIENT', args:{data:{}}},
		CONNECTION_CLOSED:{type:'CONNECTION_CLOSED', args:{data:{}}},

		SEND_SERVER_REQUEST:{type:'SEND_SERVER_REQUEST', args:{data:{}}},
		MESSAGE_UI:{type:'MESSAGE_UI', args:{}},
		MESSAGE_POPUP:{type:'MESSAGE_POPUP', args:{}},


		CLIENT_TICK:{type:'CLIENT_TICK', args:{data:{}}},
		SERVER_MESSAGE:{type:'SERVER_MESSAGE', args:{data:{}}},

		CURSOR_MOVE:{type:'CURSOR_MOVE', args:{data:{}}},
		CURSOR_LINE:{type:'CURSOR_LINE', args:{data:{}}},
		CURSOR_PRESS:{type:'CURSOR_PRESS', args:{data:{}}},
		CURSOR_RELEASE:{type:'CURSOR_RELEASE', args:{data:{}}},
		CURSOR_START_DRAG:{type:'CURSOR_START_DRAG', args:{data:{}}},
		CURSOR_DRAG_TO:{type:'CURSOR_DRAG_TO', args:{data:{}}},
		CURSOR_RELEASE_FAST:{type:'CURSOR_RELEASE_FAST', args:{data:{}}},

		
		INPUT_PLAYER_CONTROL:{type:'INPUT_PLAYER_CONTROL', args:{data:{}}},
		
        CLIENT_READY:{type:'CLIENT_READY', args:{data:{}}}
    }
});
