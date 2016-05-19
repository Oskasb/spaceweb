define(["EventList"], function(eventList) {

    var element = document.createElement('div');
    var events = [];

    var eventException = function(message) {
        this.name = "EventArgumentException";
        this.message = message;
    };
    eventException.prototype = Error.prototype;

    var list = function() {
        return eventList;
    };


    var validateEventArguments = function(event, arguments) {
        if (!event) console.log("NO EVENT", event)
        for (index in arguments) {

            if (typeof(event.args[index]) != typeof(arguments[index])) {
                throw new eventException("Invalid event arguments, "+event.type+" does not match type for supplied argument: "+index);
            }
        }
    };

    var generateEvent = function(event, arguments) {
    //    validateEventArguments(event, arguments);

        return new CustomEvent(
            event.type,
            {
                detail: {arguments:arguments},
                bubbles: false,
                cancelable: false
            }
        )
    };

    var eventArgs = function(e) {
        return e.detail.arguments;
    };

    var fireEvent = function(event, arguments) {
        element.dispatchEvent(generateEvent(event, arguments));
    };

    var registerListener = function(event, callback) {
    //    events.push(callback);
        element.addEventListener(event.type, callback);
    };

    var removeListener = function(event, callback) {
	//	var evt = events.splice(events.indexOf(callback), 1)[0];
		element.removeEventListener(event.type, callback, null)
    };


    var test = function(e) {
        alert("test msg:"+eventArgs(e).msg)
    };

 //   registerListener(list().TEST_EVENT, test);

    return {
        removeListener:removeListener,
        on:registerListener,
        args:eventArgs,
        fire:fireEvent,
        list:list
    };

});