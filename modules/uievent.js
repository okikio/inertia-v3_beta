(function() {
    // Inertia's UI Event Module V2 [www.khanacademy.org/cs/_/6433526873882624]
    Define(["Event.UIEvent", "UIEvent"], function() {
        var Class = require("Class"), Event = require("Event"), 
            Core = require("Core"), Emit;
        
        // Default Inertia Events [www.khanacademy.org/cs/_/6433526873882624]
        (function() {
            Inertia.Event = Event(); // Inertia Event
            draw = function() {  // Global Draw Event
                if (Inertia.Event) { Inertia.Event.emit("draw"); } 
            };
        
            // Emit An Event
            Emit = function(evt, fn) {
                return function() {
                    (fn || function() {}) ();
                    try {
                        // jshint noarg: false
                        var arg = arguments.callee.caller.arguments;
                        Inertia.Event.emit
                            .apply(Inertia.Event, [evt, arg[0]]);
                    } catch (e) { Core.log(evt + " - " + e); }
                };
            };
        
            // Emit Mouse Events
            mouseReleased = Emit("onMouseRelease");
            mouseScrolled = Emit("onMouseScroll");
            mouseClicked = Emit("onMouseClick");
            mousePressed = Emit("onMousePress");
            mouseDragged = Emit("onMouseDrag");
            mouseMoved = Emit("onMouseMove");
            mouseOver = Emit("onMouseIn");
            mouseOut = Emit("onMouseOut");
        
            // Emit Key Events
            var Key = Inertia.Key = {
                List: [],
                ListStr: [],
            };
        
            keyTyped = Emit("onKeyType");
            keyReleased = Emit("onKeyRelease", function() {
                var Code = (key.code === CODED ? keyCode : key.code);
                if (Key.List.includes(Code)) {
                    var _i = Key.List.indexOf(Code);
                    Key.ListStr.splice(_i, 1);
                    Key.List.splice(_i, 1);
                }
            });
        
            keyPressed = Emit("onKeyPress", function() {
                var Code = (key.code === CODED ? keyCode : key.code);
                if (!Key.List.includes(Code)) {
                    Key.ListStr.push(key.toString());
                    Key.List.push(Code);
                }
            });
        
            // Emit Touch Events
            if ('ontouchstart' in Core.window()) {
                touchCancel = Emit("onTouchCancel");
                touchStart = Emit("onTouchStart");
                touchMove = Emit("onTouchMove");
                touchEnd = Emit("onTouchEnd");
            }
            else {
                Inertia.Event.on("onMouseRelease", Emit("onTouchEnd"));
                Inertia.Event.on("onMousePress", Emit("onTouchStart"));
                Inertia.Event.on("onMouseDrag", Emit("onTouchMove"));
            }
        })(); // Global Event Emitter

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