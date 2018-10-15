/** -- Development Workspace -- [www.khanacademy.org/cs/_/4760822004088832] **/
var Inertia = {}, $in, Define, require; // Inertia Entry Point
// Changes: [Event, UIEvent, Node]

// Module System V2 [www.khanacademy.org/cs/_/5049435683323904]
(function() {
    $in = Inertia; // Inertia Shortform
    Inertia.$Modules = {}; // Cache / List of all Modules
    Inertia.$Required = []; // All Modules Required
    Inertia.$Root = null; // Cache / List of all Modules
    
    /* Turn Strings into Arrays of little paths
        eg: toArray("obj.key.val") // ["obj", "key", "val"] */
    var toArray = Inertia.toArray = function (arr, tru) {
        return arr.toString().split(/[\.\/\\\[\]\,]/g);
    };
    
    /* Check if a value is defined
        eg: isDef("Defined") // true */
    var isDef = Inertia.isDef = function (val)
        { return typeof val !== "undefined"; };
        
    /* Utility method to get and set Objects that may or may not exist */
    var Find = Inertia.Find = function(path, obj) {
		var result = obj, i = 0, $path;
		while (isDef(result) && ($path = path[i ++])) {
            if (!($path in result))
                { Inertia.$Required.push(path); }
            result = $path in result ? result[$path] : result[$path] = {};
        }
        return result;
    };
    
    // Async Object for Module Loading Based on the Async Module
    Inertia.Async = function(rate) {
        this._class = "Async"; // Class Name
        this.tasks = []; this.indx = 0; // Tasks Array & Task Index
        this.loopThru = this.complete = false;
        this.rate = rate || 100;
        this.prev = millis();
        this.progress = 0;
    };
    
    // Prototype in Object form
    Inertia.Async.prototype = {
        readyFn: function () {},
        loadFn: function () {
            background(255);
            fill(230);
            noStroke();
            rect(100, 200, 200, 3, 5);
                
            fill(150);
            rect(100, 200, this.progress / 100 * 200, 3, 5);
                
            fill(50);
            textAlign(CENTER, CENTER);
            textFont(createFont("Century Gothic Bold"), 25);
            text("Loading! \"" + this.tasks[this.indx][1] + "\" \n " +
                this.indx + " / " + (this.tasks.length - 1), 50, - 56, 300, 400);
        },
        
        // Set Rate
        setRate: function (rate) {
            this.rate = rate || 100;
            return this;
        },
        
        // Add New Tasks
        then: function(module, fn) {
            this.tasks.push([fn || function() {}, module || "Module"]);
            return this;
        },
        
        // On Load
        load: function (fn) {
            this.loadFn = fn || function () {};
            return this;
        },
            
        // Ready
        ready: function (fn) {
            this.readyFn = fn || function () {};
            return this;
        },
        
        // Set Loop Thru
        thruLoop: function (thru) {
            this.loopThru = thru || true;
            return this;
        },
    
        // Run Async
        run: function() {
            if (this.tasks.length <= 0) { return this; }
            if (this.loopThru) {
                while ((millis() - this.prev) > this.rate) {
                    if (this.complete) { return this.clear(); }
                    this.tasks[this.indx][0](); this.indx++;
                    this.prev = millis();
                }
            } else {
                for (var i = 0; i < this.tasks.length; i ++) {
                    if (this.complete) { return this.clear(); }
                    this.indx = i; this.tasks[this.indx][0]();
                }
            }
            return this;
        },
        
        // Creates a Loop for Loading
        loop: function () {
            var window = (0, eval)("this");
            var _draw = function(timestamp) {
                this.run();
                if (this.complete) { this.readyFn(); } 
                else { this.loadFn(); }
                window.requestAnimationFrame(_draw);
            }.bind(this);
            window.requestAnimationFrame(_draw);
            return this;
        },
    
        // Clear
        clear: function() {
            this.indx = 0; this.tasks = [];
            return this;
        },
    };
    
    // More Info
    Object.defineProperties(Inertia.Async.prototype, {
        // Complete
       complete: {
            get: function()
                { return this.indx >= this.tasks.length; }
        },
    
        // Progress
        progress: {
            get: function()
                { return this.indx / (this.tasks.length - 1) * 100; }
        },
    });
    
    // Inertia's Load Manager
    Inertia.Manager = new Inertia.Async();

    // Creates new Modules When Called
    Define = Inertia.define = Inertia.Define =  function(paths, fn, multi) {
        var Define = function (path, fn) {
            Inertia.Manager.then(path, function () {
                var paths = toArray(path), Module = paths.pop(), Temp = {},
                    result = Find(paths, Inertia.$Modules);
                
                Temp[Module] = { exports: {} };
                fn = fn.call(Inertia.$Modules, Temp[Module]) || Temp[Module].exports;
                return result && Module ? (result[Module] = fn) : undefined;
            });
        };
        
        if (Array.isArray(paths) && multi) {
            paths.forEach(function (path) { Define(path, fn); });
        } else { return Define(paths, fn); }
    };

    // Module Accessor better yet known as require
    require = Inertia.require = Inertia.Require = function(path) {
        try {
            var result = Find(toArray(path), Inertia.$Modules);
            return result;
        } catch (e) { throw "Cannot find module " + path; }
    };
})();