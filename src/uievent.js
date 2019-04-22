(function() {
    // Inertia's UI Event Module V2 [www.khanacademy.org/cs/_/6433526873882624]
    Define(["Event.UIEvent", "UIEvent"], function() {
        var Class = require("Class"), Event = require("Event"), Emit;
        // Creates Events with a Prefix before the Event is Called
        return function(_class) {
            // A Modified Extension of The Event Emitter `Inertia.Event`
            return Class(Event, {
                _class: _class || "UIEvent", // Set Class Name
                // Add a Listener / Function For a Given Event
                on: $in.Event[["on"]],
                add: $in.Event[["on"]],
                bind: $in.Event[["on"]],
                // Add a One - Time Listener / Function For a Given Event
                once: $in.Event[["once"]],
                // Remove a Listener / Function For a Given Event
                off: $in.Event[["off"]],
                remove: $in.Event[["off"]],
                unbind: $in.Event[["off"]],
                // List's All Listeners / Function's For a Given Event
                listeners: $in.Event[["listeners"]],
                callback: $in.Event[["listeners"]],
                // Call All Function(s) Within An Event
                emit: $in.Event[["emit"]],
                fire: $in.Event[["emit"]],
                trigger: $in.Event[["emit"]],
                // Clear all Events
                clear: $in.Event[["clear"]]
            }) (); // A New Instance
        };
    }, true);
})(); // UI Event