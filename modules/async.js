(function() {
    // Inertia's Async Module V2 [www.khanacademy.org/cs/_/4638346561486848]
    Define("Async", function () {
        var Class = require("Class");
        return Class($in.Async, {
            readyFn: function () {},
            init: function (rate) {
                this.CallSuper("constructor", rate || 1000 / 60);
            },
            
            // Add New Tasks
            then: function (fn) {
                this.tasks.push(fn || function () {});
                return this;
            },
            
            // Ready
            ready: function (fn) {
                this.readyFn = fn || function () {};
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
                    this.run();
                    if (this.complete) { this.readyFn(); } 
                    else { this.loadFn(); }
                }, this);
                return this;
            },
        });
    });
})(); // Async 