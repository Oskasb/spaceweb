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
            fireEvent(list().MONITOR_STATUS, {EVENT_TYPES:getEventCount()});
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
        fireEvent(list().MONITOR_STATUS, {EVENT_LISTENERS:getListenerCount()});
    };


    var spliceListener = function(listener, callback) {
        var asynchifySplice = function(list, cb) {
            setTimeout(function() {
                list.splice(list.indexOf(cb), 1);
            }, 0)
        };
        asynchifySplice(listener, callback);
    };

    var eventCount = 0;
    var listenerCount = 0;
    var getListenerCount = function() {
        eventCount = 0;
        listenerCount = 0;
        for (var key in listeners) {
            eventCount++;
            listenerCount += listeners[key].length;
        }
        return listenerCount
    };

    var getEventCount = function() {
        return eventCount;
    };

    var removeListener = function(event, callback) {

        if (!listeners[event.type]) {
            return;
        }

        if (listeners[event.type].indexOf(callback) == -1) return;
        spliceListener(listeners[event.type], callback);
        fireEvent(list().MONITOR_STATUS, {EVENT_LISTENERS:getListenerCount()});
    };


    return {
        getListenerCount:getListenerCount,
        getEventCount:getEventCount,
        removeListener:removeListener,
        on:registerListener,
        args:eventArgs,
        fire:fireEvent,
        list:list
    };

});