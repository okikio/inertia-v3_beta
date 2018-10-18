(function() {
    // Inertia's Touch Module V2 [www.khanacademy.org/cs/_/4951327923011584]
    Define("Touch", function() {
        var UIEvent = require("UIEvent"), Event = Inertia.Event,
            Env = require("Core.Env"), Touch = UIEvent("Touch"),
            Emit, Prefix;
    
        // Event Object
        Touch = UIEvent("Touch");
    
        // Define Updating Initialized Touch Properties
        Object.defineProperties(Touch, {
            // Are Touch Events Disabled
            Disabled: { value: false },
            x: { get: Env("return this.mouseX;") }, // TouchX
            y: { get: Env("return this.mouseY;") }, // TouchY
    
            // Mouse x & y Axises as Vector Points
            Pos: {
                get: function() {
                    return new PVector(this.x, this.y);
                }
            },
    
            // Distance From the Touch's Position to Another Postion
            setDist: { get: Env("return this.Pos.dist", Touch), },
        });
    
        // List of all Touch Names
        Touch.EventList = [];
    
        // Emit Set
        Emit = function(evt) {
            // Add Event Names to List
            Touch.EventList.push(evt);
            return function(e) {
                if (!Touch.Disabled) {
                    Touch.emit.apply(Touch, [evt, e]);
                }
            };
        };
    
        // Set Prefix
        Prefix = "onTouch";
    
        // Emit Touch Events
        Event.on(Prefix + "Cancel", Emit("Cancel"), Touch);
        Event.on(Prefix + "Start", Emit("Start"), Touch);
        Event.on(Prefix + "Move", Emit("Move"), Touch);
        Event.on(Prefix + "End", Emit("End"), Touch);
        return Touch;
    });
})(); // Touch