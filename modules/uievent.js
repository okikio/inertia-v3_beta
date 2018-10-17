(function() {
    // Inertia's UI Event Module V2 [www.khanacademy.org/cs/_/6433526873882624]
    Define(["Event.UIEvent", "UIEvent"], function() {
        var Class = require("Class"), Event = require("Event"), 
            Core = require("Core"), Emit;
        // Creates Events with a Prefix before the Event is Called
        return function(_class) {
            // A Modified Extension of The Event Emitter `Inertia.Event`
            return Class(Event, {
                _class: _class || "UIEvent", // Class Name
    
                // Add a Listener / Function For a Given Event
                on: Inertia.Event[["on"]],
                add: Inertia.Event[["on"]],
                bind: Inertia.Event[["on"]],
    
                // Add a One - Time Listener / Function For a Given Event
                once: Inertia.Event[["once"]],
    
                // Remove a Listener / Function For a Given Event
                off: Inertia.Event[["off"]],
                remove: Inertia.Event[["off"]],
                unbind: Inertia.Event[["off"]],
    
                // List's All Listeners / Function's For a Given Event
                listeners: Inertia.Event[["listeners"]],
                callback: Inertia.Event[["listeners"]],
    
                // Call All Function(s) Within An Event
                emit: Inertia.Event[["emit"]],
                fire: Inertia.Event[["emit"]],
                trigger: Inertia.Event[["emit"]],
                
                // Clear all Events
                clear: Inertia.Event[["clear"]]
            }) (); // A New Instance
        };
    }, true);
})(); // UI Event