(function() {
    // Inertia's Async Module V2 [www.khanacademy.org/cs/_/4638346561486848]
    Define("Async", function () {
        var Class = require("Class");
        return Class($in.Async, {
            init: function (rate) {
                this.CallSuper("constructor", $in.isDef(rate) ? rate : 100);
                this.loopThru = true; 
            },
            errFn: function (e) {
                e = e || { message: "Unidentified Error" };
                background(235);
                fill(50);
                textAlign(CENTER, CENTER);
                textFont(createFont("Century Gothic Bold"), 22);
                text("Loading Error! Module: " + this.indx + ". \n Message: " + e.message, 25, 0, 350, 400);
            
            },
        
            // Add New Tasks
            then: function(fn) {
                this.tasks.push(fn || function() {});
                return this;
            },
                    
            // Run Async
            run: function () {
                if (this.tasks.length <= 0) { return this; }
                if (this.loopThru) {
                    while ((millis() - this.prev) > this.rate) {
                        if (this.complete) { return this.clear(); }
                        this.tasks[this.indx] (); this.indx++;
                        this.prev = millis();
                    }
                } else {
                    for (var i = 0; i < this.tasks.length; i ++) {
                        if (this.complete) { return this.clear(); }
                        this.indx = i; this.tasks[this.indx] ();
                    }
                }
                return this;
            },
            
            // Creates a Loop for Loading
            loop: function () {
                $in.Event.on("draw", function () {
                    try {
                        this.run();
                        if (this.complete) { this.readyFn(); } 
                        else { this.loadFn(); }
                    } catch (e) { this.errFn(e); }
                }, this);
                return this;
            },
        });
    });
})(); // Async 