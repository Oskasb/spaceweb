define(["EventList"], function(eventList) {

    var element = document.createElement('div');
    var events = {};

    var listeners = {};


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

    var TinyEvent = function(type) {
        this.type = type;
        this.arguments = {};
    };

    TinyEvent.prototype.setArgs = function(args) {
        this.arguments = args;
    };

    var setupEvent = function(event) {

        if (!events[event.type]) {
            listeners[event.type] = [];
            events[event.type] = new TinyEvent(event.type);
        }
    };

    var generateEvent = function(event, arguments) {
    //    validateEventArguments(event, arguments);
        setupEvent(event);
        setEventArgs(event, arguments);
        return events[event.type];
    };

    var setEventArgs = function(e, args) {
        events[e.type].setArgs(args);
    };

    var eventArgs = function(e) {
        return events[e.type].arguments;
    };

    var dispatchEvent = function(event) {
        for (var i = 0; i < listeners[event.type].length; i++) {
            listeners[event.type][i](event);
        }
    };

    var fireEvent = function(event, arguments) {
        dispatchEvent(event, generateEvent(event, arguments));
    //    element.dispatchEvent(generateEvent(event, arguments));
    };

    var registerListener = function(event, callback) {
        setupEvent(event);
        listeners[event.type].push(callback);
     //   element.addEventListener(event.type, callback);
    };

    var removeListener = function(event, callback) {

        if (!listeners[event.type]) {
            console.log("No listener yet?", event.type);
            return;
        }
        console.log("Remove Listener? pre:", event.type, listeners, listeners[event.type].indexOf(callback));

        if (listeners[event.type].indexOf(callback) == -1) return;
        listeners[event.type].splice(listeners[event.type].indexOf(callback), 1);

        console.log("Remove Listener? post:", event.type, listeners[event.type], listeners[event.type].indexOf(callback));

	//	element.removeEventListener(event.type, callback, null)
    };


    return {
        removeListener:removeListener,
        on:registerListener,
        args:eventArgs,
        fire:fireEvent,
        list:list
    };

});