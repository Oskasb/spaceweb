"use strict";

define(function() {
    var func = function(){};
    return {
		INIT_CLIENT:{type:'INIT_CLIENT', args:{data:{}}},

		SEND_SERVER_REQUEST:{type:'SEND_SERVER_REQUEST', args:{data:{}}},


		CLIENT_TICK:{type:'CLIENT_TICK', args:{data:{}}},
		SERVER_MESSAGE:{type:'SERVER_MESSAGE', args:{data:{}}},
		CURSOR_MOVE:{type:'CURSOR_MOVE', args:{data:{}}},
		CURSOR_LINE:{type:'CURSOR_LINE', args:{data:{}}},
		CURSOR_PRESS:{type:'CURSOR_PRESS', args:{data:{}}},
		CURSOR_START_DRAG:{type:'CURSOR_START_DRAG', args:{data:{}}},
		CURSOR_DRAG_TO:{type:'CURSOR_DRAG_TO', args:{data:{}}},
        CLIENT_READY:{type:'CLIENT_READY', args:{data:{}}}
    }
});
