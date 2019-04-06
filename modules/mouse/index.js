(function() {
    // Inertia's Mouse Module V2 [www.khanacademy.org/cs/_/5686343358775296]
    Define("Mouse", function() {
        var UIEvent = require("UIEvent"), Event = Inertia.Event,
            Env = require("Core.Env"), Mouse, Emit, Prefix;
        // UIEvent Object
        Mouse = UIEvent("Mouse");
        // Define Updating Initialized Mouse Properties
        Object.defineProperties(Mouse, {
            // Are Mouse Events Disabled
            Disabled: { value: false },
            x: { get: Env("return this.mouseX;") }, // MouseX
            y: { get: Env("return this.mouseY;") }, // MouseY
            // Mouse x & y Axises as Vector Points
            Pos: {
                get: function() {
                    return new PVector(this.x, this.y);
                }
            },
            xPrev: { get: Env("return this.pmouseX;") }, // PMouseX
            yPrev: { get: Env("return this.pmouseY;") }, // PMouseY
            // Pervious Mouse x & y Axises as Vector Points
            Prev: {
                get: function() {
                    return new PVector(this.xPrev, this.yPrev);
                }
            },
            // Calculate distance between Mouse and PMouse on the x Axis
            xDist: { get: Env("return this.x - this.xPrev", Mouse) },
            // Calculate distance between Mouse and PMouse on the y Axis
            yDist: { get: Env("return this.y - this.yPrev", Mouse) },
            // Mouse Is Pressed
            Press: {
                get: function() {
                    return !this.Disabled && mouseIsPressed;
                }
            },
            // Current Mouse Button Being Pressed [Left | Right]
            Btn: {
                get: function() {
                    return !this.Disabled && mouseButton;
                }
            },
            // Mouse hover over a shape, circle, or rectangle
            hover: {
                value: function(type, args) {
                    if (Array.isArray(type)) { args = type; }
                    
                    var pos = args[0], sz = args[1];
                    pos = pos.array ? pos.array() : pos;
                    sz = sz.array ? sz.array() : sz;
                    
                    if (type.indexOf("circ") > -1) {
                        pos = new PVector(pos[0], pos[1]);
                        return this.setDist(pos) <= sz / 2;
                        
                    } else {
                        return this.x >= pos[0] && this.x <= pos[0] + sz[0] && this.y >= pos[1] && this.y <= pos[1] + sz[1];
                        
                    }
                }
            },
            // Distance From the Mouse's Positon To the Mouse's Previous Position
            Dist: { get: Env("return this.Pos.dist(this.Prev)", Mouse) },
            // Distance From the Mouse's Position to Another Postion
            setDist: { get: Env("return this.Pos.dist", Mouse), },
        });
    
        // List of all Event Names
        Mouse.evtlst = Mouse.EventList = [];
        // Emit Set
        Emit = function(evt) {
            // Add Event Names to List
            Mouse.EventList.push(evt);
            return function(e) {
                if (!Mouse.Disabled) { Mouse.emit.apply(Mouse, [evt, e]); }
            };
        };
    
        // Set Prefix
        Prefix = "onMouse";
        // Emit Mouse Events
        Event.on(Prefix + "Release", Emit("Release"), Mouse);
        Event.on(Prefix + "Scroll", Emit("Scroll"), Mouse);
        Event.on(Prefix + "Click", Emit("Click"), Mouse);
        Event.on(Prefix + "Press", Emit("Press"), Mouse);
        Event.on(Prefix + "Drag", Emit("Drag"), Mouse);
        Event.on(Prefix + "Move", Emit("Move"), Mouse);
        Event.on(Prefix + "Out", Emit("Out"), Mouse);
        Event.on(Prefix + "In", Emit("In"), Mouse);
        return Mouse;
    });
})(); // Mouse