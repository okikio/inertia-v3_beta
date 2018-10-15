(function() {
    // A Base Event Emmitter
    var Event = require("Event"), Emit, Core = require("Core");
    Inertia.Event = new Event(); // Inertia Event
    draw = function() { Inertia.Event.emit("draw"); }; // Global Draw Event

    // Emit An Event
    Emit = function(evt, fn) {
        fn = fn || function() {};
        return function() {
            fn();
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