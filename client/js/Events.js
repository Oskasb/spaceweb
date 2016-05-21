define(["EventList"], function(eventList) {

    var element = document.createElement('div');
    var events = {};

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

    var setupEvent = function(event) {

        if (!events[event.type]) {
            events[event.type] = new CustomEvent(event.type, {
                    detail: {arguments:{}},
                    bubbles: false,
                    cancelable: false
                }
            )
        }
    }

    var generateEvent = function(event, arguments) {
    //    validateEventArguments(event, arguments);
        setupEvent(event);
        setEventArgs(event, arguments);
        return events[event.type];
    };

    var setEventArgs = function(e, args) {
        events[e.type].detail.arguments = args;
    };

    var eventArgs = function(e) {
        return events[e.type].detail.arguments;
    };

    var fireEvent = function(event, arguments) {
        element.dispatchEvent(generateEvent(event, arguments));
    };

    var registerListener = function(event, callback) {
        setupEvent(event);
        element.addEventListener(event.type, callback);
    };

    var removeListener = function(event, callback) {
		element.removeEventListener(event.type, callback, null)
    };


    return {
        removeListener:removeListener,
        on:registerListener,
        args:eventArgs,
        fire:fireEvent,
        list:list
    };

});