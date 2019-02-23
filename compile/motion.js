/** -- Development Workspace -- [www.khanacademy.org/cs/_/4760822004088832] **/
var Inertia = {}, $in, Define, require; // Inertia Entry Point
// Module System V2 [www.khanacademy.org/cs/_/5049435683323904]
(function() {
    $in = Inertia; // Inertia Shortform
    Inertia.$Modules = {}; // Cache / List of all Modules
    Inertia.$req = Inertia.$Required = []; // All Modules Required
    
    /* Turn Strings into Arrays of little paths
        eg: toArray("obj.key.val") // ["obj", "key", "val"] */
    var toArray = Inertia.toArray = function (arr) {
        return arr.toString().split(/[\.\,]/g);
    };
    
    /* Check if a value is defined
        eg: isDef("Defined") // true */
    var isDef = Inertia.isDef = function (val)
        { return typeof val !== "undefined" && val !== null; };
        
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
    
    // Window Object
    $in.global = $in.window = (0, eval)("this");
    
    // Cnavas Object
    $in.canvas = $in.PJS = $in.pjs = (function(prop) {
        setup = function() { return this; };
        return setup();
    })();
    
    // Inertia Event Emit
    Inertia.evtemit = Inertia.EventEmitter = (function () {
        var _ = $in.global._, EventEmitter;
        (EventEmitter = function () { })
            .prototype = {
                _class: "Event", // Set Class Name
                _eventCount: 0, _events: {}, // Event Info.
                _emit: [], // Store events set to be Emitted
                // Prepare the Event
                preEvent: function(evt) {
                    if (!this._events[evt]) // List Of Event's
                        { this._events[evt] = []; }
                    return this._events[evt];
                },
                // Event Application
                eventApp: function(callback, scope, event) {
                    return {
                        callback: callback,
                        scope: scope || this,
                        event: event
                    };
                },
                // Add a Listener / Function For a Given Event
                on: function(evt, callback, scope) {
                    if (_.isUndefined(evt)) { return; } // If There is No Event Break
                    if (!_.isArray(evt) && !_.isObject(evt)) { evt = [evt]; } // Set Evt to an Array
                    _.each(evt, function($evt, key) {
                        var $Evt;
                        if (_.isObject(evt) && !_.isArray(evt)) {
                            $Evt = this.eventApp($evt, callback || this, key);
                            this.preEvent(key).push($Evt); // Set Event List
                        } else {
                            $Evt = this.eventApp(callback, scope, $evt);
                            this.preEvent($evt).push($Evt); // Set Event List
                        }
                    }, this);
                    // Length Of Events
                    this._eventCount = _.keys(this._events).length;
                    // Name Of All Event's
                    this.names = _.keys(this._events);
                    return this;
                },
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

    // Module Accessor better yet known as require
    require = Inertia.require = Inertia.Require = function(path) {
        try {
            var result = Find(toArray(path), Inertia.$Modules);
            return result;
        } catch (e) { throw "Cannot find module(s) " + Inertia.$Required; }
    };
})();
(function() {
    // Inertia's Core Objects V2 [www.khanacademy.org/cs/_/6109672016216064]
    Define("Core", function() {
        var Core = {}; // Export
        // Window Object
        Core.global = Core.window = function(path) {
            return function() { return this[path] || this; }();
        }; 
        Core.canvas = Core.PJS = Core.pjs = $in.pjs; // Canvas Object
        Core.EVAL = Core[["eval"]] = Core.window("eval"); // Eval Function
        Core.FUNCTION = Core.Function = Core.Func = Core.Fn = Core.window("Function"); // Function Object
        Core.JSON = Core.Json = Core.window("JSON"); // Json Object
        Core.STRING = Core.String = Core.window("String"); // String Object
        Core.REGEXP = Core.RegExp = Core.window("RegExp"); // RegExp Object
        Core.OBJECT = Core.Object = Core.window("Object"); // Object Object [Confusing Eh]
        Core.NUMBER = Core.Number = Core.window("Number"); // Number Object
        Core.ARRAY = Core.Array = Core.window("Number"); // Array Object
        Core.BOOLEAN = Core.Boolean = Core.window("Boolean"); // Boolean Object
        Core.MATH = Core.Math = Core.window("Math"); // Math Object
        Core.ERROR = Core.Error = Core.window("Error"); // Error Object
        Core.DATE = Core.Date = Core.window("Date"); // Date Object
        Core.PROMISE = Core.Promise = Core.window("Promise"); // Promise Object
        Core.SYMBOL = Core.Symbol = Core.window("Symbol"); // Symbol Object
        Core.MAP = Core.Map = Core.window("Map"); // Map Object
        Core.WEAKMAP = Core.WeakMap = Core.window("WeakMap"); // WeakMap Object
        Core.SET = Core.Set = Core.window("Set"); // Set Object
        Core.WEAKSET = Core.WeakSet = Core.window("WeakSet"); // WeakSet Object
        Core.WEBASSEMBLY = Core.WebAssembly = Core.window("WebAssembly"); // WebAssembly Object
        Core.GENERATOR = Core.Generator = Core.window("Generator"); // Generator Object
        Core.GENERATORFUNCTION = Core.GeneratorFunction = Core.window("GeneratorFunction"); // GeneratorFunction Object
        Core.PROXY = Core.Proxy = Core.Fn("o", "h", "return new Proxy(o, h)"); // Proxy Object
        Core.REFLECT = Core.Reflect = Core.window("Reflect"); // Reflect Object
        // Logger / Print to Console
        Core.log = Core.LOG = function() {
            var _args = Array.from(arguments);
            _args.forEach(function(val) { println(val); });
        };

        // Create Function's With Enviroment (PJS) Context
        Core.Env = Core.env = Core.Func("fn", "ctxt", "try { " +
                "var last = 'with (this) {' +" +
                    "(Array.isArray(fn) ? fn.pop() : fn) +" +
                "'}';" +
                "return Function.apply(ctxt," +
                    "Array.isArray(fn) ? fn.concat(last): [last])" +
                ".bind(ctxt || this.PJS);" +
            "} catch (e) { this.log(e); }").bind(Core);
        return Core;
    });
})(); // Core
(function() {
    // Inertia's Util Modules V2 [www.khanacademy.org/cs/_/4952324744708096]
    Define("Util", function() {
        var Util, Core = require("Core"), _ = Core.window("_");
        // Util Object
        Util = {
            _: _, each: _.each, map: _.map,
            // Pick between two value the defined Value
            pick: Core.Func('a', 'b', 'return a !== undefined ? a : b'),
            // Collect Functions Arguments into an Array
            args: function($this) {
                var restArg = [].slice.call(arguments, 1);
                return [].slice.apply($this, restArg);
            },
            // All Keys in an Object
            allKeys: function (obj) {
                var result = Object.getOwnPropertyNames(obj), addProperty;
                addProperty = function(property) {
                    if (result.indexOf(property) === -1) { result.push(property); }
                };
            
                var proto = Object.getPrototypeOf(obj);
                while (proto !== null) {
                    Object.getOwnPropertyNames(proto).forEach(addProperty);
                    proto = Object.getPrototypeOf(proto);
                }
                return result;
            },
            // All Enumerable Keys in Object
            enumKeys: function(obj) {
                var _keys = [];
                for (var _key in obj) { _keys.push(_key); }
                return _keys;
            },
            // Maps An Array to an Object
            MapArr: function(host, obj, type, extra) {
                var result = {}, _ = Core.window("_");
                // Iterate Map
                _.each(obj, function(arr) {
                    // Iterate In Each Element Of the Array
                    _.each(arr, function(ele) {
                        // Iteration of each Array
                        _.each((_.isArray(arr[0]) ? arr[0] : [ele]), function(name) {
                            // Set [name] of the [obj] Object to the Array Function
                            result[name] = type && _.isFunction(arr[1]) ? function() {
                                return arr[1].apply(this, [this]
                                        .concat(Array.from(arguments)));
                            } : arr[1];

                            if (type && _.isFunction(arr[1])) {
                                result[name].toString = arr[1].toString.bind(arr[1]);
                                result[name].valueOf = arr[1].valueOf.bind(arr[1]);
                            }
                        }, this);
                    }, this);
                }, this);
                
                _.extend(extra || {}, result);
                for (var i in result) {
                    host[i] = (!_.has(host, i) ? result : host)[i];
                }
            },
            // Find a value in an Object based on it's path
            path: function(obj, path, val) {
                var Path = function(obj, path, lvl, init, val) {
                    var curr, path = $in.toArray(path), _keys;
                    init = init || [].concat(path);
                    lvl = Math.max(lvl, 0) || 0; 
                    _keys = Object.keys(obj);
                    
                    try {
                        // Returns the path left to travel 
                        var pathLeft = _.rest(path); 
                        curr = path[0]; ++ lvl; // For error checking
                        // Check if value is given
                        if ($in.isDef(val)) {
                            // Wild Cards "..|.." or "(...)" or "[...]" and "* or abc*"
                            if (/[\(\[]([\s\S]+?)[\)\]]/g.test(curr) || 
                                /[\|\^\$]/g.test(curr) || /\*/g.test(curr)) {
                                // This is for multiple wildcards
                                _.each(obj, function ($, idx) {
                                    var toReg = (/\$$/.test(curr) ? "" : "^") + 
                                        curr.replace(/\|/g, "$|^")
                                            .replace(/\*/g, "(.*?)") + 
                                    (/^\^/.test(curr) ? "" : "$");
                                    var regex = RegExp(toReg, "g");
                                    // Finds all the subpaths for the wildcard
                                    var subPath = [idx].concat(pathLeft); 
                                    if (regex.test(idx)) 
                                        { Path(obj, subPath, lvl, init, val); }
                                });
                            } else if (path.length > 1) {
                                Path(obj[curr], pathLeft, lvl, init, val);
                            } else { obj[curr] = val; }
                            return obj;
                        } else {
                            // Wild Cards "..|.." or "(...)" or "[...]" and "* or abc*"
                            if (/[\(\[]([\s\S]+?)[\)\]]/g.test(curr) || 
                                /[\|\^\$]/g.test(curr) || /\*/g.test(curr)) {
                                obj = _(obj).filter(function ($, idx) {
                                    var toReg = (/\$$/.test(curr) ? "" : "^") + 
                                        curr.replace(/\|/g, "$|^")
                                            .replace(/\*/g, "(.*?)") + 
                                    (/^\^/.test(curr) ? "" : "$");
                                    return RegExp(toReg, "g").test(idx);
                                }).map(function ($, idx) {
                                    // Find Keys of filtered Object
                                    idx = _keys[idx]; 
                                    // Finds all the subpaths for the wildcard
                                    var subPath = [idx].concat(pathLeft); 
                                    return Path(obj, subPath, lvl, init);
                                });
                            } else if (path.length > 1) {
                                obj = Path(obj[curr], pathLeft, lvl, init);
                            } else { obj = obj[curr]; }
                            return obj;
                        }
                    } catch (e) { 
                        Core.log("Error! - Path [" + init  + "] is stuck on level: `" + lvl + "`, Current Position: `" + curr + "`,\n----------------\nMessage: " + e.message); 
                    }
                    return obj;
                };
                return Path(obj, path, 0, path, val);
            },
            // Take a Function as a Value
            FnVal: function(val, arg, ctxt) {
                if (!Util._.isFunction(val)) { return val; }
                return val.apply(ctxt, arg);
            },
            // A more efficient `new` keyword that allows for arrays to be passed as Arguments
            new: Core.Func("ctor", "args",
                "var F = function() { return ctor.apply(this, args); };" +
                "F.prototype = ctor.prototype;" +
                "return new F")
        };
        _.allKeys = Util._.allKeys = Util.allKeys;
        _.enumKeys = Util._.enumKeys = Util.enumKeys;
        _.isDefined = Util._.isDefined = Inertia.isDef;
        _.isColor = Util._.isColor = function (val) {
            return !Util._.isUndefined(val) && (/^\#|^rgb|^hsl|^hsb/g.test(val) ||
                    (Util._.isArray(val) && Util._.isNumber(val[0])) ||
                        Util._.isNumber(val) || val.value);
        };
        return Util;
    });
    // Underscore specific functionality
    Define("_", function() { return require("Util._"); }); 
    // Type Testing Functions
    Define(["is", "Util.is"], function() {
        var _ = require("_");
        // Type Check Functions
        return ['Symbol', 'Map', 'WeakMap', 'Set', 'WeakSet', 'Object', 'Array', 'Arguments', 'Function', 'String', 'Number', 'Boolean', 'Date', 'RegExp', 'Undefined', 'Null', 'Equal', 'Empty', 'Finite', 'NaN'].reduce(function(obj, name) {
            obj[name.toLowerCase()] = obj[name] = _[["is" + name]] ? 
                _[["is" + name]] : _[["is" + name]] = function(obj) {
                return Object.prototype.toString.call(obj) === '[object ' + name + ']';
            };
            return obj;
        }, {
            // Check whether an object has a given set of key:value pairs
            isMatch: function (obj, attrs) {
                var keys = _.keys(attrs), length = keys.length;
                if (obj === null) { return !length; }
                obj = Object(obj);
                for (var i = 0; i < length; i++) {
                    var key = keys[i];
                    if (attrs[key] !== obj[key] || !(key in obj)) 
                        { return false; }
                }
                return true;
            },
            // Test if an Object is simmilar to an Array
            ArrayLike: function(obj) {
                var len = _.isNumber(obj.length) && obj.length;
                return len === 0 || len > 0 && (len - 1) in obj;
            }
        });
    }, true);
})(); // Util
(function() {
    // Inertia's Function Module V2 [www.khanacademy.org/cs/_/5415663367127040]
    // Function Module adds to the Native Function Object
    Define(["Func", "Function", "Fn"], function() {
        var Core = require("Core"), Util = require("Util"), _ = Util._, 
            MapFunc = Util.MapArr, Native = Core.Func, $Map;
        // Map Of Names And Functions
        $Map = [
            [["args"], Util.args], // Turn the Arguments Object into an Array
            [["new"], Util.new], // A more efficient `new`
            // Empty / Noop / Dummy function
            [["empty", "noop", "dummy"], Native()],
            // List all the Names of a Functions Arguments
            [["argNames"], function(fn) {
                var args = fn.toString()
                    .match(/^[\s\(]*function[^(]*\(([^)]*)\)/)[1]
                    .replace(/\/\/.*?[\r\n]|\/\*(?:.|[\r\n])*?\*\//g, '')
                    .replace(/\s+/g, '').split(',');
                return args.length === 1 && !args[0] ? [] : args;
            }],
            // Remove extra code in a Stringifed Function
            [["toStr"], function(fn) {
                var $fn = fn.toString().trim()
                    .replace(/(__)env__\.\$(\w+) = /g, "const $$$2 = ")
                    .replace(/(__)env__\.\$(\w+)/g, "$$$2")
                    .replace(/var\s+\$(\w+)/g, "const $$$1")
                    .replace(/(__)env__\.KAInfiniteLoopProtect\(.*\);/g, "")
                    .replace(/(__)env__\.KAInfiniteLoopCount = 0;/g, "")
                    .replace(/(__)env__\.KAInfiniteLoopCount > 1000/g, "")
                    .replace(/(__)env__\.KAInfiniteLoopCount\+\+;\s+if \(\) {\s+}\n/g, "")
                    .replace(/(__)env__\.KAInfiniteLoopSetTimeout\(\d+\);\n/g, "")
                    .replace(/__env__\./g, ""), copy;
                copy = $fn.replace(/{\s+/g, '{ ').replace(/\s+}/, " }");
                return $fn.match(/[\n]/g).length <= 2 ? copy : $fn;
            }]
        ];
        // Extend Methods
        MapFunc(Native, $Map);
        MapFunc(Native.prototype, $Map, true);
        return Native;
    }, true);
})(); // Function
(function() {
    // Inertia's Class Module V2 [www.khanacademy.org/cs/_/5398825551822848]
    // Class Module acts like the ES6 `class` keyword replacement
    Define("Class", function() {
        var Util = require("Util"), Fn = require("Func"), 
            _ = Util._, args = Util.args, Class, Static;
        // Set Static Methods
        Static = {
            // Add Methods to a Class
            Method: function() {
                var Parent = this.SuperClass && this.SuperClass.prototype;
                _.each(args(arguments), function(obj) {
                    var _obj = Util.FnVal(obj, [this, this.constructor], this.prototype);
                    _.each(_obj, function(val, i) {
                        var preVal = val;
                        // If a Parent Class is Present, Set any argument/params named `$super` to the `Parent`
                        if (_.isFunction(val)) {
                            if (Parent && val.argNames()[0] === "$super") {
                                val = _.wrap(function() {
                                    return function() {
                                        return (Parent[i].apply(this, arguments));
                                    };
                                }(), preVal);
                            }
                            
                            val.valueOf = preVal.valueOf.bind(preVal);
                            val.toString = preVal.toString.bind(preVal);
                        }
                        
                        this.prototype[i] = val; // Redefinition Error Fix
                        Object.defineProperty(this.prototype, i,
                            typeof val === "object" && (val.get || val.set) ? val : { value: val });
                    }, this);
                }, this);
                return this;
            },
            // Set Static Methods
            Static: function() {
                _.each(args(arguments), function(obj) {
                    obj = Util.FnVal(obj, [this, this.constructor], this.prototype);
                    _.each(obj, function(val, i) {
                        var preVal = val;
                        if (_.isFunction(val)) {
                            val.valueOf = preVal.valueOf.bind(preVal);
                            val.toString = preVal.toString.bind(preVal);
                        }
                        
                        this[i] = val; // Redefinition Error Fix
                        Object.defineProperty(this, i,
                            typeof val === "object" && (val.get || val.set) ? val : { value: val });
                    }, this);
                }, this);
                return this;
            },
            // Set Defaults or Backups for Objects
            Default: function(obj) {
                return function() {
                    var result;
                    _.each(args(arguments).reverse(), function(val) {
                        if (!_.isUndefined(Util.path(obj, val.split(".")[0])))
                            { result = Util.path(obj, val); }
                    }, this);
                    return result;
                }.bind(this);
            },
            // Create an Alias/Copy of a Static Method that can function as a Prototype Method
            Alias: function(obj, chainable, notStatic) {
                var result = {};
                chainable = chainable || [];
                _.each(obj, function(val, i) {
                    result[i] = function() {
                        var _args = notStatic ? Array.from(arguments) : [this]
                            .concat(Array.from(arguments));
                        if (chainable.includes(i)) {
                            val.apply(this, _args);
                            return this;
                        }
                        return val.apply(this, _args);
                    };

                    var toStr = val.toString.bind(val);
                    result[i].toString = chainable.includes(i) ?
                        Fn('return ' + toStr() + '+"return this;";') : toStr;
                    result[i].valueOf = val.valueOf.bind(val);
                });
                return result;
            },
            // Access Attributes and Properties of a Class (It has many Uses)
            Attr: function(path, val) {
                if (_.isObject(path) && !_.isArray(path))
                    { return _.extend(this, path); }
                else if (_.isArray(path)) {
                    if (_.isUndefined(val)) {
                        return _.map(path, function(key) {
                            return Util.path(this, key);
                        }, this);
                    } else {
                        _.each(path, function(key) {
                            Util.path(this, key, val);
                        }, this);
                    }
                } else if (path && val) { this[path] = val; }
                else {  return Util.path(this, path); }
                return this;
            },
            // Create Classes
            Create: function () {
                var Class, SubClass, Parent, arg = args(arguments);
                // SubClass Constructor
                SubClass = function() {};
    
                // Set Parent Constructor here is any
                if (arg[0] && _.isFunction(arg[0]) ||
                    (this && _.isArray(this.SubClasses))) {
                    if (_.isArray(this.SubClasses)) { Parent = this; }
                    else { Parent = arg.shift(); }
                }
                    
                // Class Object
                Class = function() {
                    // Current Class
                    if (!(this instanceof Class))
                        { return Fn.new(Class, arguments); }
                    this._args = arguments; // Arguements
                    
                    // Initialize Class
                    return this.init.apply(this, arguments);
                };
    
                // Extend Parent Class If any
                if (Parent) {
                    Parent.prototype.constructor = Parent;
                    SubClass.prototype = Parent.prototype;
                    Class.prototype = new SubClass();
                    void(Parent.SubClasses && Parent.SubClasses.push(Class));
                }
                
                Class.SuperClass = Parent; // Current Class's Parent if any
                Class.SubClasses = []; // List of SubClasses
                _.extend(Class, Static); // Extend Static Class
                _.extend(Class.prototype, Fn, Static, Class); // Give Chainability
    
                // Add Methods to Class
                Class.Method.apply(Class, arg);
    
                // Set Current Class Type
                if (!Class.prototype._class)
                    { Class.prototype._class = "Object"; }
    
                // Set Class Constructor
                Class.prototype.constructor = Class;
                if (!Class.prototype.init)
                    { Class.prototype.init = function() {}; }
                else {
                    // Set toString & toValue
                    Class.toString = Class.prototype.init.toString;
                    Class.toValue = Class.prototype.init.toValue;
                }
    
                // Call Super Class Methods
                Class.prototype.CallSuper = function(method) {
                    var _Parent = null, $ = this, arg = args(arguments, 1),
                        _const = $, _super = _const.SuperClass;
                    // Climb prototype chain to find method not equal to callee's method
                    while (_super) {
                        var Method = _super.prototype[method];
                        if ($[method] !== _super.prototype[method]) {
                            _Parent = _super.prototype[method];
                            break;
                        }
                        $ = _super.prototype;
                        _const = $.constructor;
                        _super = _const.SuperClass;
                    }
    
                    if (!_Parent) {
                        println(method + ', method not found in prototype chain.');
                        return;
                    }
                    return (arg.length > 0) ?
                        _Parent.apply(this, arg) : _Parent.bind(this) ();
                };
                return Class;
            },
            // Easy Access to Configurable attributes
            get: function (val) {
                var _val = Object.constructor("with (this) return " + val);
                _val.toString = val.toString;
                return { get: _val };
            },
            set: function (val) {
                var _val = Object.constructor("with (this) return " + val);
                _val.toString = val.toString;
                return { set: _val };
            }
        };
        // Alias Methods
        _.extend(Static, {
            Extends: Static.Create, // Extend from another Class
            // Add Prototype Methods to Class
            Method: Static.Method,
            AddTo: Static.Method,
            Prop: Static.Method,
        });
        // Create lowercase alias Methods
        _.each(Static, function (val, i) {
            Static[i.toLowerCase()] = val;
        });
        // Class Object
        Class = Static.Create; _.extend(Class, Static);
        return Class;
    });
})(); // Class
(function() {
    // Inertia's Ease Module V2 [www.khanacademy.org/cs/_/--]
    // Ease Modules a basic set of Easing Utilities
    Define("Ease", function() {
        var _ = require("Util")._, Static, Elastic, BounceOut, BounceIn, Ease, Steps;
        // Elastic easing based on animejs [github.com/juliangarnier/anime/blob/master/anime.js]
        Elastic = function (t, p) {
            p = p || 0.3;
            return t === 0 || t === 1 ? t : -pow(2, 10 * (t - 1)) *
                Math.sin((((t - 1) - (p / (PI * 2.0) * asin(1))) * (PI * 2)) / p );
        };
        
        // Bounce Out based on TweenJS [www.createjs.com/docs/tweenjs/files/tweenjs_Ease.js.html#l388]
        BounceOut = function(t) {
	        if (t < 1/2.75) {
		        return (7.5625*t*t);
	        } else if (t < 2/2.75) {
		        return (7.5625*(t-=1.5/2.75)*t+0.75);
	        } else if (t < 2.5/2.75) {
		        return (7.5625*(t-=2.25/2.75)*t+0.9375);
	        } else {
		        return (7.5625*(t-=2.625/2.75)*t +0.984375);
	        }
        };
        // Bouse In
        BounceIn = function (t) 
            { return 1 - BounceOut(1 - t); };
        
        // Basic step implementation
        Steps = function (t, steps) {
            steps = steps || 10;
            return round(t * steps) * (1 / steps);
        };
        
        // Easing Default
        Ease = function (strt, end, vel) {
            vel = vel || 12;
            return _.isString(strt) ?
                    Ease.fn[strt.toString().toLowerCase()]
                         .apply({}, [].slice.call(arguments, 1))
                     : strt + (end - strt) / vel;
        };
        
        // Cubic Bezier Function
        Ease.cubic = Ease.bezier = function(bez) {
            if (typeof bez === 'function') { return bez; }
            var polyBez = function(p1, p2) {
                var A = [null, null], B = [null, null], C = [null, null],
                    bezCoOrd = function(t, ax) {
                        C[ax] = 3 * p1[ax];
                        B[ax] = 3 * (p2[ax] - p1[ax]) - C[ax];
                        A[ax] = 1 - C[ax] - B[ax];
                        return t * (C[ax] + t * (B[ax] + t * A[ax]));
                    },
                    xDeriv = function(t)
                        { return C[0] + t * (2 * B[0] + 3 * A[0] * t); },
                    xForT = function(t) {
                        var x = t, i = 0, z;
                        while (++i < 14) {
                            if (abs(z = bezCoOrd(x, 0) - t) < 1e-3)
                                { break; }
                            x -= z / xDeriv(x);
                        }
                        return x;
                    };
                return function(t) { return bezCoOrd(xForT(t), 1); };
            };
            
            return function(t, f) {
                return pow(polyBez([bez[0], bez[1]], [bez[2], bez[3]]) (constrain(t / 1, 0, 1)), f || 1);
            };
        };
        
        // Easing Equations
        Ease.fn = {}; // Function Form
        Ease.eq = Ease.equations = {
            ease: [0.25, 0.1, 0.25, 1], /* Ease */
            linear: [0.250, 0.250, 0.750, 0.750],
            steps: Steps, step: Steps,
            in: {
                quad: [0.550, 0.085, 0.680, 0.530], /* InQuad */
                cubic: [0.550, 0.055, 0.675, 0.190], /* InCubic */
                quart: [0.895, 0.030, 0.685, 0.220], /* InQuart */
                quint: [0.755, 0.050, 0.855, 0.060], /* InQuint */
                sine: [0.470, 0.000, 0.745, 0.715], /* InSine */
                expo: [0.950, 0.050, 0.795, 0.035], /* InExpo */
                circ: [0.600, 0.040, 0.980, 0.335], /* InCirc */
                back: [0.600, -0.280, 0.735, 0.045], /* InBack */
                ease: [0.42, 0, 1, 1], /* InEase */
                poly: function (t, e) { return pow(t, +e || 1); }, /* InPoly */
                elastic: Elastic, /* InElastic */
                bounce: BounceIn, /* InBounce */
            },
            out: {
                quad: [0.250, 0.460, 0.450, 0.940], /* OutQuad */
                cubic: [0.215, 0.610, 0.355, 1.000], /* OutCubic */
                quart: [0.165, 0.840, 0.440, 1.000], /* OutQuart */
                quint: [0.230, 1.000, 0.320, 1.000], /* OutQuint */
                sine: [0.390, 0.575, 0.565, 1.000], /* OutSine */
                expo: [0.190, 1.000, 0.220, 1.000], /* OutExpo */
                circ: [0.075, 0.820, 0.165, 1.000], /* OutCirc */
                back: [0.175, 0.885, 0.320, 1.275], /* OutBack */
                ease: [0, 0, 0.58, 1], /* OutEase */
                poly: function (t, e) { return 1 - pow(1 - t, +e || 1); }, /* OutPoly */
                elastic: function (t, f)
                    { return 1 - Elastic(1 - t, f); }, /* OutElastic */
                bounce: BounceOut, /* OutBounce */
            },
            inout: {
                quad: [0.455, 0.030, 0.515, 0.955], /* InOutQuad */
                cubic: [0.645, 0.045, 0.355, 1.000], /* InOutCubic */
                quart: [0.770, 0.000, 0.175, 1.000], /* InOutQuart */
                quint: [0.860, 0.000, 0.070, 1.000], /* InOutQuint */
                sine: [0.445, 0.050, 0.550, 0.950], /* InOutSine */
                expo: [1.000, 0.000, 0.000, 1.000], /* InOutExpo */
                circ: [0.785, 0.135, 0.150, 0.860], /* InOutCirc */
                back: [0.680, -0.550, 0.265, 1.550], /* InOutBack */
                ease: [0.42, 0, 0.58, 1], /* InOutEase */
                poly: function (t, e) /* OutPoly */
                    { return ((t *= 2) <= 1 ? pow(t, e) : 2 - pow(2 - t, e)) / 2; },
                elastic: function (t, f) /* InOutElastic */
                    { return t < 0.5 ? Elastic(t * 2, f) / 2 : 1 - Elastic(t * -2 + 2, f) / 2; },
                bounce: function (t) {
                    if (t < 0.5) { return BounceIn(t * 2) * 0.5; }
                    return BounceOut(t * 2 - 1)* 0.5 + 0.5;
                }, /* InOutBounce */
            }
        };
        
        /**
            @Return [Function] - A Function that takes the `time`
                - @Param [Number] time - The Current `time` from 0 to 1
                - @Return [Number] - Contains a value from 0 to 1
            @Api Public
        **/
        
        _.each(Ease.equations, function (obj, type) {
            if (_.isArray(obj) || _.isFunction(obj)) {
                Ease[type] = Ease.fn[type] = Ease.bezier(obj);
                Ease.eq[type] = obj;
            } else {
                _.each(obj, function (arr, eq) {
                    Ease.fn[type + eq] = Ease[type + eq] = Ease.bezier(arr);
                    Ease.eq[type + eq] = arr;
                });
            }
        });
        return Ease;
    });
})(); // Ease
(function() {
    // Inertia's Event Emitter Module V2 [www.khanacademy.org/cs/_/5102490437058560]
    Define("Event", function() {
        var Event, _ = require("Util._"), Class = require("Class");
        require("Func");
        // Event Object
        return Class($in.EventEmitter, {
            // Alias for the `on` method
            add: Class.get("on"), bind: Class.get("on"),
            // Add a One - Time Listener / Function For a Given Event
            once: function(evt, callback, scope) {
                var $Fn;
                if (!evt) { return; } // If There is No Event Break
                if (!_.isArray(evt) && !_.isObject(evt)) { evt = [evt]; } // Set Evt to an Array
                $Fn = function() {
                    this.off(evt, $Fn, scope);
                    callback.apply(scope, arguments);
                };
                this.on(evt, $Fn, scope);
                return this;
            },
            // Remove a Listener / Function For a Given Event
            off: function(evt, callback, scope) {
                if (!evt) { return; } // If There is No Event Break
                if (!_.isArray(evt) && !_.isObject(evt)) { evt = [evt]; } // Set Evt to an Array
                var _off = function ($evt, callback, scope) {
                    var _Evt = this.preEvent($evt);
                    if (callback) {
                        var i, app = this.eventApp(callback, scope, $evt);
                        _.each(_Evt, function (val, _i) {
                            if (_.isEqual(val, app)) { i = _i; }
                        }, this);
                        if (i > - 1) { _Evt.splice(i, 1); }
                    } else { delete this._events[$evt]; }
                }.bind(this);
                _.each(evt, function($evt, key) {
                    if (_.isObject(evt) && !_.isArray(evt)) {
                        _off(key, $evt, scope);
                    } else { _off($evt, callback, scope); }
                }, this);
                return this;
            },
            // Alias for the `off` method
            remove: Class.get("off"),
            unbind: Class.get("off"),
            // List's All Listeners / Function's For a Given Event
            listeners: function(evt) {
                var $Evt = this.preEvent(evt);
                if (!$Evt) { return []; }
                if (!$Evt.callback) { return $Evt.callback; }
                return _.map($Evt, function(val) { return val; }, this);
            },
            // Alias for the `listeners` method
            callback: Class.get("listeners"),
            // Event Check
            check: function(evt) {
                var result;
                if (_.isArray(evt)) {
                    for (var i = 0; i < evt.length; i++) {
                        result = _.keys(this._Events).includes(evt[i]);
                    }
                } else { result = _.keys(this._Events).includes(evt); }
                return result;
            },
            // Alias for the `emit` method
            fire: Class.get("emit"),
            trigger: Class.get("emit"),
            // Clear
            clear: function () 
                { this._eventCount = 0; this._events = {}; }
        });
    });
})(); // Event
(function() {
    // Inertia's Motion Module V2 [www.khanacademy.org/cs/_/--]
    Define("Motion", function() {
        var Util = require("Util"), Class = require("Class"), Event = require("Event"), 
            Ease = require("Ease"), _ = Util._, Static, id = 0; // Used in identifing Motion Objects
        return Class(Event, {
            ver: "2.0.0", speed: 1, _startTime: 0, _lastTime: 0, _now: 0, 
            init: function (params, reset, _id) {
                this.params = (params = params || {});
                var settings = this.settings;
                
                // Remove any undefined parameters (for settings)
                var instance = this.replaceObj(settings.default, params);
                var tween = this.replaceObj(settings.tween, params);
                
                var animatables = this.getAnimatables(params.from);
                var props = this.FormatProps(tween, params);
            
                var animations = this.getAnimations(animatables, props);
                var timings = this.getTimings(animations, tween);
                
                _.extend(this, {
                    id: this.id ? this.id : id,
                    animatables: animatables,
                    animations: animations,
                    duration: timings.duration,
                    delay: timings.delay,
                    endDelay: timings.endDelay
                }, instance);
        
                if (_.isUndefined(reset) || reset) { this.reset(); }
                if (!_id) { id ++; }
                
                if (this.autoplay) { this.play(); } 
            },
            
            set: function (params, reset) { 
                var args = [_.extend({}, this.params, params), reset];
                return this.init.apply(this, args); 
            }, 
            
            toggleDir: function () {
                var dir = this.direction;
                if (dir !== "alternate") 
                    { this.direction = dir !== 'normal' ? 'normal' : 'reverse'; }
                this.reversed = !this.reversed;
                return this;
            },
            
            adjustTime: function (time) {
                return this.reversed ? this.duration - time : time;
            },
            
            resetTime: function () {
                this._lastTime = this.adjustTime(this.currentTime) / this.speed;
                this._startTime = 0; return this;
            },
            
            setAnimProgress: function (time) {
                var i = 0, anims = this.animations;
                var animsLen = anims.length;
                var fn = function (t) { return (time < t.end); };
                while (i < animsLen) {
                    var anim = anims[i], tweens = anim.tweens;
                    var animatable = anim.animatable;
                    
                    var tweenLen = tweens.length - 1;
                    var tween = tweens[tweenLen];
                    
                    // Only check for keyframes if there is more than one tween
                    if (tweenLen) { tween = _.filter(tweens, fn)[0] || tween; }
                    
                    var elapsed = time - tween.start - tween.delay;
                    elapsed = constrain(elapsed, 0, tween.duration) / tween.duration;
                    
                    var eased = isNaN(elapsed) ? 1 : tween.easing(elapsed);
                    var strs = tween.to.strings, round = tween.round;
                    var toNumsLen = tween.to.numbers.length;
                    var nums = [], progress;
                    for (var n = 0; n < toNumsLen; n++) {
                        var from = tween.from.numbers[n] || 0;
                        var to = tween.to.numbers[n];
                        var value = from + ((to - from) * eased);
                        if (round) {
                            if (!(tween.isColor && n > 2)) {
                                value = round(value * round) / round;
                            }
                        }
                        nums.push(value);
                    }
                    
                    // Manual Array.reduce for better performances
                    var strsLen = strs.length;
                    if (!strsLen) { progress = nums[0]; }
                    else {
                        progress = strs[0];
                        for (var s = 0; s < strsLen; s++) {
                            var b = strs[s + 1], n = nums[s];
                            if (!isNaN(n)) { progress += n + b; }
                        }
                    }
                    
                    this.ProgVal[anim.type](animatable, anim, progress);
                    this.value = animatable.target;
                    anim.currentValue = progress;
                    i++;
                }
                return this;
            },
            
            setFn: function (cb) {
                if (this[cb]) 
                    { this[cb](this); this.emit(cb, this); }
                return this;
            },
            
            iterate: function () {
                if (this.remaining && this.remaining !== true)
                    { this.remaining--; }
                return this;
            },
            
            setProgress: function (engineTime) {
                var dur = this.duration, delay = this.delay;
                var endDelay = dur - this.endDelay;
                var time = this.adjustTime(engineTime);
                this.progress = constrain((time / dur) * 100, 0, 100);
                if (!this.began && this.currentTime > 0) {
                    this.began = true;
                    this.setFn('begin'); 
                    this.setFn('loopBegin');
                }
                
                if (time <= delay && this.currentTime !== 0) 
                    { this.setAnimProgress(0); }
                    
                if ((time >= endDelay && this.currentTime !== dur) || !dur) 
                    { this.setAnimProgress(dur); }
                    
                if (time > delay && time < endDelay) {
                    if (!this.changeBegan) {
                        this.changeBegan = true;
                        this.changeCompleted = false;
                        this.setFn('changeBegin');
                    }
                    this.setFn('change');
                    this.setAnimProgress(time);
                } else {
                    if (this.changeBegan) {
                        this.changeCompleted = true;
                        this.changeBegan = false;
                        this.setFn('changeComplete');
                    }
                }
                
                this.currentTime = constrain(time, 0, dur);
                if (this.began) { this.setFn('update'); }
                if (engineTime >= dur) {
                    this._lastTime = 0; this.iterate();
                    if (this.remaining) {
                        this._startTime = this._now;
                        this.setFn('loopComplete');
                        this.setFn('loopBegin');
                        if (this.direction === 'alternate')
                            { this.toggleDir(); }
                    } else {
                        this.paused = true;
                        if (!this.completed) {
                            this.completed = true;
                            this.setFn('loopComplete');
                            this.setFn('complete');
                        }
                    }
                }
                return this;
            },
            
            reset: function() {
                var dir = this.direction;
                _.extend(this, {
                    began: false, changeBegan: false, completed: false,
                    changeCompleted: false, paused: true, 
                    currentTime: 0, progress: 0,
                    reversed: dir === 'reverse',
                    remaining: this.loop
                });
                
                if (this.reversed && this.loop !== true ||
                    (dir === 'alternate' && this.loop === 1))
                        { this.remaining++; }
                return this.setAnimProgress(0);
            },
            
            tick: function(t) {
                this._now = t;
                if (!this._startTime) { this._startTime = this._now; }
                return this.setProgress((this._now + (this._lastTime - this._startTime)) * this.speed);
            },
        
            seek: function(val, spec) { 
                // Spec is for scaling the value given to a very specific point in time
                var time = val * (spec ? 1 : this.duration);
                return this.setProgress(this.adjustTime(time)); 
            },
        
            pause: function() {
                this.paused = true; this.resetTime();
                return this;
            },
        
            play: function() {
                var $this = this;
                if (!this.paused) { return this; }
                if (this.completed) { this.reset(); }
                this.paused = false; this.resetTime();
                $in.draw(function () {
                    var now = $in.global.performance.now();
                    if (!$this.paused) { $this.tick(now); }
                });
                return this;
            },
            
            toggle: function () {
                if (this.paused) { this.play(); } 
                else { this.pause(); }
                return this;
            },
            
            reverse: function() {
                this.toggleDir();
                this.resetTime();
                return this;
            },
        
            restart: function() {
                this.reset(); this.play();
                return this;
            },
        }, Static = {
            // All settings
            settings: {
                default: {
                    changeComplete: null,
                    direction: 'normal',
                    loopComplete: null,
                    changeBegin: null,
                    loopBegin: null,
                    complete: null,
                    autoplay: true,
                    update: null,
                    change: null,
                    begin: null,
                    offset: 0, // For timeline alone
                    from: {},
                    speed: 1,
                    loop: 1,
                    to: {},
                },
                tween: {
                    easing: 'linear',
                    duration: 1000,
                    endDelay: 0,
                    delay: 0,
                    round: 0
                }
            },
            
            // Is property a setting?
            isSetting: function (k) {
                var def = this.settings.default, anim = this.settings.tween;
                return !_.has(def, k) && !_.has(anim, k) && k !== 'keyframes';
            },
            
            // Replace only pre-existing values in an Object
            replaceObj: function (o1, o2) {
                return _.reduce(o1, function (acc, v, i) { 
                    acc[i] = _.has(o2, i) ? o2[i] : o1[i]; 
                    return acc;
                }, _.extend({}, o1));
            },
            
            // Convert any value to an Array
            toArray: function (o) { return _.isArray(o) ? o : [o]; },
            
            // Convert the value given into an Easing function
            FormatEase: function(val) {
                var match = /\(([^)]+)\)/.exec(val);
                var _args = match ? match[1].split(',').map(function(p) {
                    return parseFloat(p);
                }) : [];
                var ease = (val + "").toLowerCase().split("(")[0];
                return function (t) {
                    var fn = _.isFunction(val) ? val : 
                        (_.isArray(val) ? Ease.bezier(val) : Ease.fn[ease]);
                    return (fn).apply({}, [t].concat(_args));
                };
            },
            
            // Finds ending values given the starting value and the values relative from the starting values (E.g. *Start* + *Relative value* or 10 + 5)
            RelativeVal: function (to, from) {
                var operator = /^(\*|\+|\-|\/)\=?/.exec(to);
                if (!operator) { return to; }
                var a = parseFloat(from.toString());
                var b = parseFloat(to.toString().replace(operator[0], ''));
                var sign = operator[0][0];
                return (0, eval) (a + sign + b);
            },
            
            // Converts functions into useable values
            FnVal: function (val, arg) { 
                return Util.FnVal(val, [arg.target, arg.id, arg.total]); 
            },
            
            // Uncover info. about value given as an Object
            inspect: function(val) {
                var rgx = /-?\d*\.?\d+/g;
                var _val = val + "";
                return {
                    original: _val,
                    numbers: _val.match(rgx) ? _val.match(rgx).map(Number) : [0],
                    strings: _.isString(val) ? _val.split(rgx) : []
                };
            },
            
            // Creates an Array of Target
            Targets: function (targets) { 
                return _.uniq(!_.isUndefined(targets) ? _.flatten( 
                    _.isArray(targets) ? targets.map(this.toArray) : this.toArray(targets)
                ) : []);
            },
            
            // Get all animatable properties
            getAnimatables: function (targets) {
                var parsed = this.Targets(targets);
                return parsed.map(function (t, i) {
                    return { target: t, id: i, total: parsed.length };
                });
            },
            
            // Creates an Array of Tweens (A tween is a change between two values)
            Tweens: function (val, tweenSettings) {
                var setting = _.extend({}, tweenSettings);
                if (_.isArray(val)) {
                    var isFromTo = (val.length === 2 && !_.isObject(val[0]));
                    if (!isFromTo) {
                        // Duration divided by the number of tweens
                        if (!_.isFunction(tweenSettings.duration)) 
                            { setting.duration = tweenSettings.duration / val.length; }
                    } else { 
                        // Transform [from, to] values shorthand to a valid tween value
                        val = { value: val }; 
                    }
                }
                
                return this.toArray(_.isObject(val) && val.value || val).map(function (v, i, valArr) {
                    // Use path object as a tween value
                    var obj = _.isObject(v) && !_.isArray(v) && 
                             !_.isFunction(v) ? v : { value: v };
                    
                    // Default delay value should only be applied to the first tween
                    if (_.isUndefined(obj.delay)) 
                        { obj.delay = !i ? tweenSettings.delay : 0; }
                        
                    // Default endDelay value should only be applied to the last tween
                    if (_.isUndefined(obj.endDelay)) { 
                        obj.endDelay = i === valArr.length - 1 ? tweenSettings.endDelay : 0; 
                    }
                    return obj;
                }).map(function (k) { return _.extend({}, setting, k); });
            },
            
            // Format `keyFrames` for multiple tweens affecting multiple properties
            Keyframes: function (keyframes) {
                return _.chain(keyframes)
                    .map(_.keys).flatten()
                    .filter(this.isSetting).uniq()
                    .reduce(function (acc, name) {
                        acc[name] = keyframes.map(function(frame) {
                            return _.reduce(frame, function(newFrame, val, prop) {
                                if (this.isSetting(prop)) { 
                                    if (prop === name) 
                                        { newFrame.value = val; } 
                                } else { newFrame[prop] = val; }
                                return newFrame;
                            }, {}, this);
                        }, this);
                        return acc;
                    }, {}, this).value();
            },
        
            // Create an Array filled with Properties to animate
            FormatProps: function (_settings, params) {
                var _from = params.from, _to = params.to, frames = params.keyframes;
                if (frames) { _to = params.to = _.extend({}, _to, this.Keyframes(frames)); } 
                
                return (_.isObject(_from) || _.isArray(_from)) ? 
                    // For Object and Array use cases
                    _.reduce(_to, function (arr, val, prop) {
                        return arr.concat({
                            name: prop,
                            tweens: this.Tweens(val, _settings)
                        });
                    }, [], this) : 
                    // For non Object use cases
                    [{ tweens: this.Tweens(_to, _settings) }];
            }, 
            
            // Add the ability to change the delay & duration of a property
            ParseVal: function (tween, animatable) {
                return _.reduce(tween, function (obj, val, i) {
                    var _val = this.FnVal(val, animatable); 
                    if (_.isArray(_val)) {
                        _val = _.map(_val, function (v) { 
                            return this.FnVal(v, animatable); 
                        }, this);
                        
                        // Fix the start point if no other values in an Array
                        if (_val.length === 1) { _val = _val[0]; }
                    }
                    
                    obj[i] = /delay|duration/.test(i) ? parseFloat(_val) : _val;
                    return obj;
                }, {}, this);
            },
            
            // Add extra details to Tweens (easing, relative value support for `to` and `from`, delay, and duration, and compiles it)
            FormatTweens: function (prop, animatable) {
                var prev; // Previous Tween
                return prop.tweens.map(function (t) {
                    var tween = this.ParseVal(t, animatable);
                    var tweenVal = tween.value;
                    
                    var to = this.FnVal(_.isArray(tweenVal) ? tweenVal[1] : tweenVal, animatable);
                    var origVal = animatable.target[prop.name] || 0;
                    var prevVal = prev ? prev.to.original : origVal;
                    var from = _.isArray(tweenVal) ? tweenVal[0] : prevVal;
                    
                    if (_.isUndefined(to)) { to = prevVal; }
                    tween.from = this.inspect(from);
                    tween.to = this.inspect(this.RelativeVal(to, from));
                    
                    // Causes tweens to occur one after the other
                    tween.start = prev ? prev.end : 0;
                    tween.end = tween.start + tween.delay + tween.duration + tween.endDelay;
                    tween.easing = this.FormatEase(tween.easing);
                    return (prev = tween);
                }, this);
            },
            
            // Animation types and how to animate them
            ProgVal: {
                native: function (t, p, v) { return (t.target = v); },
                object: function (t, p, v) { return (t.target[p.property] = v); }
            },
            
            // Create animations for each property, using tweens
            animate: function (animatable, prop) {
                var tweens = this.FormatTweens(prop, animatable);
                var lastTween = tweens[tweens.length - 1];
                var target = animatable.target;
                return _.extend({
                    type: _.isObject(target) || _.isArray(target) ? 
                            "object" : "native", // Animation type
                    animatable: animatable,
                    tweens: tweens,
                    duration: lastTween.end,
                    delay: tweens[0].delay,
                    endDelay: lastTween.endDelay
                }, !_.isUndefined(prop.name) ? { property: prop.name } : {});
            },
            
            // Crate a list of animations
            getAnimations: function (animatables, properties) {
                return _.filter(_.flatten(
                    animatables.map(function (animatable) {
                        return properties.map(function (prop) {
                            return this.animate(animatable, prop);
                        }, this);
                    }, this)
                ), function (a) { return !_.isUndefined(a); });
            },
            
            // Compute the best delay, duration, and endDelay to use for animation
            getTimings: function (animations, tweenSettings) {
                var animLen = animations.length, tween = tweenSettings;
                var _map = function (val) {
                    // `a.offset` is meant for the timeline module and allows for chaining animations one after the other
                    var Fn = Object.constructor("a", "return (a.offset ? a.offset : 0) + " + val);
                    return animations.map(Fn);
                };
                var dur = animLen ? _.max(_map("a.duration")) : tween.duration;
                return {
                    endDelay: animLen ? 
                        dur - _.max(_map("a.duration - a.endDelay")) : tween.endDelay,
                    delay: animLen ? _.min(_map("a.delay")) : tween.delay,
                    duration: dur
                };
            },
        })
        
        // Static Method
        .static(Static, {
            // Stagger is a function that allows you to animate multiple elements with overlapping action
            stagger: function (val, params) {
                params = params || {};
                params.axis = params.axis || "both";
                var dir = params.direction || 'normal';
                var easing = params.easing ? Static.FormatEase(params.easing) : null;
                var axis = _.isUndefined(params.axis) ? "both" : params.axis, 
                    grid = params.grid;
                var fromIndex = params.from || 0;
                var fromFirst = fromIndex === 'first';
                var fromCenter = fromIndex === 'center';
                var fromLast = fromIndex === 'last';
                var isRange = _.isArray(val);
                var val1 = isRange ? parseFloat(val[0]) : parseFloat(val);
                var val2 = isRange ? parseFloat(val[1]) : 0;
                var start = params.start || 0 + (isRange ? val1 : 0);
                var values = [], maxValue = 0;
                return function (el, i, t) {
                    if (fromFirst) { fromIndex = 0; }
                    if (fromCenter) { fromIndex = (t - 1) / 2; }
                    if (fromLast) { fromIndex = t - 1; }
                    if (!values.length) {
                        for (var index = 0; index < t; index++) {
                            if (!grid) {
                                values.push(abs(fromIndex - index));
                            } else {
                                var fromX = !fromCenter ? fromIndex % grid[0] : (grid[0] - 1) / 2;
                                var fromY = !fromCenter ? floor(fromIndex / grid[0]) : (grid[1] - 1) / 2;
                                var toX = index % grid[0];
                                var toY = floor(index / grid[0]);
                                var distAxis = {
                                    x: -(fromX - toX), y: -(fromY - toY),
                                    both: dist(fromX, fromY, toX, toY)
                                };
                                values.push(distAxis[axis]);
                            }
                            maxValue = _.max(values);
                        }
                        if (easing) {
                            values = values.map(function (val) {
                                return easing(val / maxValue) * maxValue;
                            });
                        }
                        if (dir === 'reverse') {
                            values = values.map(function (val) {
                                return axis ? (val < 0 ? val * -1 : -val) : abs(maxValue - val);
                            });
                        }
                    }
                    var spacing = isRange ? (val2 - val1) / maxValue : val1;
                    return start + (spacing * (round(values[i] * 100) / 100));
                };
            }
        });
    });
})(); // Motion