<h1 align="center">
  Inertia.js
</h1>

<h4 align="center">- A JS creators kit -</h4>

<p align="center">
  <a href="#getting-started">Getting started</a>&nbsp;|&nbsp;<a href="#table-of-content">Table of content</a>&nbsp;|&nbsp;<a href="#demos-and-examples">Demos and examples</a>&nbsp;
</p>

## Getting started
`inertia.js` is a module packaging, and sharing software. It's goal is to modularize chunks of code for easy updating and upgrading of software. I developed it for quick and sweet programming without having to search or create some crucial tools. 

#### Download
Depending on the module package you which to use, go into the compile folder, open and copy the code from the module compiled file (it has all the dependencies already there for use, to get a better understanding of each module read further).

#### Usage
`Inertia.js` can be called by using this:  
```javascript
...
Inertia.Manager.ready(function () {
    /* code here */
}).loop(100);
```
You put this after you have posted the library into your workspace. What this is doing is asyncronously loading the modules for easy on the machine loading. The `Inertia` object can also be called with the alias `$in` and the `Inertia.Manager` Object (Class) can be called using the alias `$in.mgr` so the code above can also be written as:
```javascript
...
$in.mgr.ready(function () {
    /* code here */
}).loop(100);
```
The ```}).loop(100);``` details the rate at which modules should be loaded during runtime e.g. loading a module every second and how the modules are loaded (syncronously or asyncronously) otherwise known as (all at once or once at a time). For more info: [Inertia](#inertia).

## Table of content
* [Inertia](#inertia)
* [Core](#core)
* [Util](#util)
* [Function](#function)
* [Object](#object)
* [Math](#math)
* [String](#string)
* [Class](#class)
* [Vector](#vector)
* [Size](#size)
* [Color](#color)
* [Ease](#ease)
* [Event](#event)
* [UIEvent](#uievent)
* [Mouse](#mouse)
* [Key](#key)
* [Touch](#touch)
* [Async](#async)
* [Accum](#accum)
* [Range](#range)
* [Error](#error)
* [Motion](#motion)
* [Timeline](#timeline)


## Inertia
`inertia.js` has many built in modules, designed to make other modules work effectively. The most important part of `inertia` is the **Module** component which allows for it to be built on top of. That is what allows for accessing modules, as well as creating modules. 

#### Methods & Properties
##### $Modules - [Array]
An [Array] that stores all modules created.

##### $Required ($req) - [Array]
Displays all modules missing in order to make `inertia` work
    
##### toArray  - [Function]
Converts a String into an Array, based on specific values. Meant for 
turning Strings into Arrays of little paths.
###### Params
* **[Array | String]** val - Value to convert 

###### Return
* **[Array]** Converted value

###### Example
```javascript
$in.toArray("obj.key.val") // ["obj", "key", "val"]
```

##### isDef - [Function]
Check if a value is defined.
###### Params
* **[Any]** val - Value to check

###### Return
* **[Boolean]** Whether `val` is defined

###### Example
```javascript
$in.isDef("Defined") // true
```

##### Find - [Function]
Utility method to get and set Objects that may or may not exist.
###### Params
* **[String | Array]** path - Path to follow in an Object
* **[Object]** obj - Object to find path in

###### Return
* **[Any | \*Object]** If value exists at path return value at path else return empty Object

###### Example
```javascript
var obj = {
    x: {
        y: "z"
    },
    a: {}
};
$in.Find("a.b", obj) // {}
$in.Find("x.y", obj) // "z"
```

##### global (window) - [Object]
Window Object
    
##### canvas (PJS | pjs) - [Object]
The Processing JS Object
    
##### EventEmitter (evtemit) - [Object]
* ###### eventCount - [Number]
    The total [Number] of events
* ###### _events - [Object]
    Stores all events 
* ###### _emit - [Array]
    Stores events set to be Emitted
                // Prepare the Event
* ###### on - [Function]
    Add a Listener / Function For a Given Event
    ###### Params
    * **[String | Array | Object]** evt - The name of the event being listened for
    * **[Function]** callback - The event handler function
        ###### Params
        * *(Specific)* **[Object]** $evt - If the callback has `$evt` as one of the parameters this will happen
        * **[Any]** .... - Any Argument given in the `.emit` method appear has parameters here
    * **[Object]** scope - The context for the event handler function
    ###### Return
    * **[Object]** Return the EventEmitter Object, allows other methods to be chained to this method
    
    ###### Example
    ```javascript
    var obj = { a: "b" };
    var evt = $in.evtemit();
    
    // Specifically `$evt` nothing else works
    evt.on("event", function ($evt) { 
        println(this.a + " Cool"); // "b Cool"
        println($evt); // { callback: ..., scope: ...,  event: ...}
    }, obj);
    ```
                // Call All Function(s) Within An Event
                emit: function(evt) {
                    var $Evt, arg = [].slice.call(arguments, 1);
                    if (!evt) { return; } // If There is No Event, Break
                    if (!_.isArray(evt)) { evt = [evt]; } // Set Evt to an Array
                    _.each(evt, function($evt) {
                        $Evt = this.preEvent($evt);
                        if (!this._emit.includes($evt)) 
                            { this._emit.push($evt); }
                        _.each($Evt, function(_evt) {
                            var $arg = arg;
                            if (_evt.callback.argnames &&
                                _evt.callback.argnames()[0] === "$evt")
                                { $arg = [_evt].concat(arg); }
                            _evt.callback.apply(_evt.scope, $arg);
                        }, this);
                    }, this);
                    return this;
                }
            };
        return EventEmitter;
    }) ();
    
    // Async Object for Module Loading Based on the Async Module
    Inertia.Async = (function () {
        var Async = function(rate) {
            this._class = "Async"; // Class Name
            this.tasks = []; this.indx = 0; // Tasks Array & Task Index
            this.loopThru = !(this.complete = false);
            this.rate = isDef(rate) ? rate : 500;
            this.external = false; // This tells it not to use requestAnimationFrame
            this.prev = millis();
            this.progress = 0;
        };
    
        // Prototype in Object form
        Async.prototype = {
            readyFn: function () {},
            loadFn: function () {
                background(55);
                fill(220);
                noStroke();
                rect(100, 200, 200, 4, 8);
                    
                fill(120);
                rect(100, 200, this.progress / 100 * 200, 4, 8);
                    
                fill(250);
                textAlign(CENTER, CENTER);
                textFont(createFont("Trebuchet Bold"), 35);
                text("Inertia.", 200, 200 - 50);
            },
            errFn: function (e) {
                e = e || { message: "Unidentified Error" };
                background(255, 0, 0);
                fill(255);
                textAlign(CENTER, CENTER);
                textFont(createFont("Century Gothic Bold"), 22);
                if (this.indx !== this.tasks.length) {
                    text("Loading Error! Module: " + this.tasks[this.indx][1] +
                        ". \n Message: " + e.message, 25, 0, 350, 400);
                } else { text("Error!\n Message: " + e.message, 25, 0, 350, 400); }
            },
            // Set Rate
            setRate: function (rate) {
                this.rate = isDef(rate) ? rate : 500;
                return this;
            },
            // Set External
            setExternal: function (external) {
                this.external = isDef(external) ? external : true;
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
            // Error
            error: function (fn) {
                this.errFn = fn || function () {};
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
                if (this.loopThru && !this.external) {
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
            loop: function (rate, external) {
                var window = $in.global, pjs = $in.pjs;
                this.rate = isDef(rate) ? rate : this.rate;
                this.external = isDef(external) ? external : false;
                if (this.external) { this.run(); this.readyFn.bind(pjs)(); }
                else {
                    var _draw = function() {
                        try {
                            this.run();
                            if (this.complete) { this.readyFn.bind(pjs)(); return; }
                            else { this.loadFn(); }
                            window.requestAnimationFrame(_draw);
                        } catch (e) { this.errFn(e); }
                    }.bind(this);
                    window.requestAnimationFrame(_draw);
                }
                return this;
            },
            // Clear
            clear: function() {
                this.indx = 0; this.tasks = [];
                return this;
            },
        };
        
        // More Info
        Object.defineProperties(Async.prototype, {
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
        return Async;
    }) ();
    
    // Inertia's Load Manager
    Inertia.Manager = $in.mgr = new Inertia.Async();
    // A Base Global Event Emmitter
    (function() {
        var Emit;
        $in.evt = $in.Event = new $in.EventEmitter(); // Inertia Event
        // Emit An Event
        Emit = function(evt, fn) {
            $in.Event._emit.push(evt);
            return function() {
                (fn || function() {}) ();
                try {
                    // jshint noarg: false
                    var arg = arguments.callee.caller.arguments;
                    $in.evt.emit.apply($in.evt, [evt, arg[0]]);
                } catch (e) { println(evt + " - " + e); }
            };
        };
        
        // Global Draw Event
        $in.pjs.draw = Emit("draw"); 
        // Emit Mouse Events
        $in.pjs.mouseReleased = Emit("onMouseRelease");
        $in.pjs.mouseScrolled = Emit("onMouseScroll");
        $in.pjs.mouseClicked = Emit("onMouseClick");
        $in.pjs.mousePressed = Emit("onMousePress");
        $in.pjs.mouseDragged = Emit("onMouseDrag");
        $in.pjs.mouseMoved = Emit("onMouseMove");
        $in.pjs.mouseOver = Emit("onMouseIn");
        $in.pjs.mouseOut = Emit("onMouseOut");
    
        // Emit Key Events
        var Key = $in.key = Inertia.Key = {
            List: [], ListStr: [],
        };
        Object.defineProperties(Inertia.Key, {
            list: { get: function () { return this.List; } },
            listStr: { get: function () { return this.ListStr; } },
        });
        $in.pjs.keyTyped = Emit("onKeyType");
        $in.pjs.keyReleased = Emit("onKeyRelease", function() {
            var Code = (key.code === CODED ? keyCode : key.code);
            if (Key.List.includes(Code)) {
                var _i = Key.List.indexOf(Code);
                Key.ListStr.splice(_i, 1);
                Key.List.splice(_i, 1);
            }
        });
        $in.pjs.keyPressed = Emit("onKeyPress", function() {
            var Code = (key.code === CODED ? keyCode : key.code);
            if (!Key.List.includes(Code)) {
                Key.ListStr.push(key.toString());
                Key.List.push(Code);
            }
        });
        // Emit Touch Events
        if ('ontouchstart' in (0, eval) ("this")) {
            $in.pjs.touchCancel = Emit("onTouchCancel");
            $in.pjs.touchStart = Emit("onTouchStart");
            $in.pjs.touchMove = Emit("onTouchMove");
            $in.pjs.touchEnd = Emit("onTouchEnd");
        } else {
            Inertia.Event.on("onMouseRelease", Emit("onTouchEnd"));
            Inertia.Event.on("onMousePress", Emit("onTouchStart"));
            Inertia.Event.on("onMouseDrag", Emit("onTouchMove"));
        }
        $in.evt._emit.forEach(function(val) {
            var _val = val.replace("on", "");
            _val = _val[0].toLowerCase() + _val.slice(1); // Changes `onMouseDrag` to `mouseDrag`
            $in.evt[val] = $in.evt[_val] = $in[val] = $in[_val] = function (fn, ctxt) {
                return $in.evt.on(val, fn || function () {}, ctxt);
            };
        });
    })();
    
    // Creates new Modules When Called
    Define = Inertia.define = Inertia.Define =  function(paths, fn, multi) {
        Inertia.Manager.then(paths, function () {
            var Define = function (path, fn) {
                var paths = toArray(path), Module = paths.pop(), Temp = {},
                    result = Find(paths, Inertia.$Modules);
                Temp[Module] = { exports: {} };
                fn = fn.call(Inertia.$Modules, Temp[Module]) || Temp[Module].exports;
                return result && Module ? (result[Module] = fn) : undefined;
            };
            if (Array.isArray(paths) && multi) {
                paths.forEach(function (path) { Define(path, fn); });
            } else { Define(paths, fn); }
        });
    };

#### Usage
When working with modules two methods are important: `$in.require` and `$in.define`. They are the way `inertia's` many components communicate with each other. 


