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
    // Object Module [all] the Native Object's with some additions
    // Inertia's Object Modules V2 [www.khanacademy.org/computer-programming/_/5993936052584448]
    Define("Object", function() {
        var Core = require("Core"), Util = require("Util"), args = Util.args, 
            _ = Util._, $Map, MapFunc = Util.MapArr, $JSON = Core.JSON,
            Native = Core.Object, $indx = -1;
        // Map Of Names And Functions
        $Map = _.reduce(_.keys(_), function (acc, val, i) {
            return !["toArray"].includes(val) ?
                    acc.concat([ [val, _[val]] ]) : acc;
        }, [])
        .concat([
            // Nth Element in an Object
            [["nth", "indx"], function(obj, id) {
                return _.isNumber(id) ? _.values(obj)[id] :
                        Object.path(obj, id);
            }],
            // First Element in an Object
            [["first"], function(obj) { return Object.nth(obj, 0); }],
            // Last Element in an Object
            [["last"], function(obj) { return Object.nth(obj, _.size(obj) - 1); }],
            // Check if an Object is Array Like
            [["isArrayLike"], function(obj) {
                var len = _.isNumber(obj.length) && obj.length;
                return len === 0 || len > 0 && (len - 1) in obj;
            }],
            // Clear an Object of all it's contents
            [["remove", "empty"], function(obj) {
                for (var i in obj) { delete obj[i]; }
                return obj;
            }],
            // Inline Stringify Function
            [["str", "stringify"], function(obj, short) {
                var fns = [], json;
                try {
                    if (typeof obj !== "undefined") {
                        if (short) { return $JSON.stringify(obj); }
                        json = $JSON.stringify(obj, function(key, val) {
                            if (_.isFunction(val))
                                { fns.push(val.toStr ? val.toStr() : val.toString()); return "_"; }
                            return val;
                        }, 2);
                        json = json.replace(/\"_\"/g,
                            function($) { return fns.shift(); });
                    } else { json = "The arguments for method `[str, stringify]` is not defined."; }
                    return json;
                } catch (e) { return "JSON Error (" + e.message + ")"; }
            }],
            // Clone An Object
            [["clone", "copy"], function(obj) {
                return $JSON.parse($JSON.stringify(
                        _.extend.apply({}, [{}]
                            .concat(Array.from(arguments)))));
            }],
            // Finds value of a path in an Object
            [["path", "prop"], Util.path],
            // A more efficient `new` keyword that allows for arrays to be passed as Arguments
            [["new"], Util.new],
            // Prev Value in Object
            [["prev"], function(obj) {
                return $indx > 0 ? {
                    key: Object.keys(obj)[$indx--],
                    value: Object.nth(obj, $indx),
                    done: false
                } : { done: true };
            }],
            // Even Indexed Values in an Object
            [["even"], function(obj) {
                    return Object.filter(obj,
                        function(val, i) { return i % 2 === 1; });
            }],
            // Odd Indexed Values in an Object
            [["odd"], function(obj) {
                return Object.filter(obj,
                    function(val, i) { return i % 2 === 0; });
            }],
            // Next Value in Object
            [["next"], function(obj) {
                return $indx < _.size(obj) ? {
                    key: Object.keys(obj)[$indx++],
                    value: Object.nth(obj, $indx),
                    done: false
                } : { done: true };
            }],
            // Sum of all values in an Object
            [["sum"], function (obj, id, deep) {
                return Object.reduce(obj, function (acc, val, i) {
                    var _val;
                    if ($in.isDef(id)) {
                        _val = Object.path(obj, $in.toArray(i + "." + id));
                    } else if (_.isObject(val) || _.isArray(val)) {
                        _val = deep ? Object.sum(val, id, deep) : 0;
                    } else if (_.isFunction(id)) {
                        _val = id(val);
                    } else { _val = val; }
                    acc += _val;
                    return acc;
                }, 0);
            }],
            // Average
            [["average", "avg"], function (obj, id) {
                if (Inertia.isDef(id)) {
                    return Object.pluck(obj, id).sum(null, true) / Object.size(obj);
                }
                return Object.sum(
                    Inertia.isDef(id) ? Object.pluck(obj, id) : obj,
                null, true) / Object.size(obj);
            }],
            // Median
            [["median", "med"], function (obj, id) {
                var _obj = Object.values(obj);
                var len = Object.size(_obj);
                if (id === undefined) {
                    if (len % 2 === 0) 
                        { return (_obj[(len / 2) - 1] + 
                                  _obj[len / 2]) / 2; }
                    return _obj[floor(len / 2)];
                }
                if (len % 2 === 0) 
                    { return (_obj[(len / 2) - 1][id] + 
                              _obj[len / 2][id]) / 2; }
                return _obj[floor(len / 2)][id];
            }],
            // Find the Mode (the most repeated element) of an Object
            [["mode", "repeated"], function (obj, id) {
                return Object.countBy(
                    $in.isDef(id) ? Object.pluck(obj, id) : obj
                ).pairs().max(Object.last).head();
            }],
            // Split an Object into smaller pieces 
            [["chunk"], function(obj, size, split) {
                var chunks = [], index = 0;
                if (typeof obj === "string") {
                    chunks = Object.chunk(obj.split(split || ""), size);
                } else if (Array.isArray(obj) || typeof obj === 'object') {
                    var _keys = Object.keys(obj), _obj, Chunkkeys;
                    // Used a function outside, can't define a function in a loop :(
                    var fn = function () {
                        Chunkkeys = _keys.slice(index, index + size);
                        _obj = {};
                        Object.forEach(Chunkkeys, function(_key) { 
                            _obj[_key] = obj[_key]; 
                        }, obj);
                    };
                    do { 
                        if (!Array.isArray(obj)) { fn(); } 
                        else { _obj = obj.slice(index, index + size); }
                        chunks.push(_obj); index += size; 
                    } while (index < _keys.length);
                } else { chunks.push([obj]); }
                return chunks;
            }], 
            // Dump all values at a certain point in the Object
            [["dump", "log"], function (obj) { Core.log.apply(obj, arguments); return obj; }],
            // Set prototype methods quickly
            [["macro"], function (obj, name, fn) { 
                obj.prototype[name] = fn || Core.Fn("return this;"); 
                return obj; 
            }],
            // Instantiates the given class with Object values as a constructor
            [["mapInto"], function (obj, _class) { 
                return Object.map(obj, function (val, i) { 
                    return new _class(val, i);
                });
            }],
            // Returns the items in an Object with specified keys
            [["only"], function (obj) {
                var _args = args(arguments, 1);
                var props = Array.isArray(_args) ? _args[0] : _args;
                if (Array.isArray(obj)) {
                    return Object.filter(obj, function (item) { 
                        return props.indexOf(item) !== -1; 
                    });
                }
                return Object.reduce(obj, function(acc, val, i) {
                    if (props.indexOf(i) !== -1) { acc[i] = obj[i]; }
                    return acc;
                }, {});
            }],
            // Passes the Object to the given callback and returns the result
            [["pipe"], function (obj, fn) 
                { return (fn || Core.Fn("v", "return v;")) (obj); }]
        ]);
        // Extend Methods
        MapFunc(Native, $Map);
        MapFunc(Native.prototype, $Map, true);
        return Native;
    });
})(); // Object
(function() {
    // Inertia's Math Module V2 [www.khanacademy.org/cs/_/5805810134843392]
    // The Native Math with some additions
    Define("Math", function() {
        var Util = require("Util"), MapFunc = Util.MapArr,
            _ = Util._, Core = require("Core"), $Map,
            Func = Core.Func, Native = Core.Math;
        // Allows for multiple Arguments to solve an Equation
        var Solve = function (formula) {
            var formula = formula || "a + b",
                n = /[\/]/g.test(formula) ? 1 : 0;
            return function () {
                var args = arguments;
                return _.reduce(Util.args(args, n),
                    Func("a", "b", "return Number(" + formula + ");"),
                    /[\*\/]/g.test(formula) ? (n ? args[0] : 1) : 0);
            };
        };

        // Map Of Names And Functions
        $Map = [
            // Pretty Basic But Missing
            [["Add", "add"], Solve()], // Addition
            [["Sub", "sub"], Solve("a - b")], // Subtraction
            [["Div", "div"], Solve("a / b")], // Division
            [["Mult", "mult"], Solve("a * b")], // Multplication
            [["grow", "next"], Func("a", "return a + 1;")], // Next Value
            [["prev"], Func("a", "return a - 1;")], // Prev Value
            // Scale a Value
            [["map", "scale"], function(num) {
                return Core.PJS.map.apply(this, [num]
                    .concat(Util.args(arguments, 1)));
            }],
            // Even & Odd Value
            [["iseven", "isEven", "even"], Func("num", "return num % 2 === 0;")],
            [["isodd", "isOdd", "odd"], Func("num", "return num % 2 === 1;")],
            // Allows for multiple Arguments to solve an Equation
            [["Solve", "solve"], Solve],
            // Scale two values to a percentage to create a new value
            [["lerp"], function (a, b, per) {
                var $lerp = function (a, b, per) {
                    if (typeof a === typeof b ||
                        _.isArray(a) === _.isArray(b)) {
                        if (_.isNumber(a)) { return lerp(a, b, per); }
                        else if (_.isObject(a) && !_.isString(a) &&
                                 !_.isFunction(a)) {
                            return _.reduce(a, function (acc, val, i) {
                                if (!_.isUndefined(b[i]) &&
                                    typeof a[i] === typeof b[i]) {
                                    acc[i] = $lerp(a[i], b[i], per);
                                }
                                return acc;
                            }, _.extend(_.isArray(a) && _.isArray(b) ?
                                    [] : {}, a, b));
                        }
                    }
                };
                return $lerp(a, b, per);
            }]
        ];
        // Extend Methods
        MapFunc(Native, $Map, false, Number);
        MapFunc(Number.prototype, $Map, true);
        return Native;
    });
})(); // Math
(function() {
    // String Module the Native String Objects with some additions
    // Inertia's String Module V2 [www.khanacademy.org/computer-programming/_/4845861095374848]
    Define("String", function() {
        var Util = require("Util"), Native = require("Core.String"),
            MapFunc = Util.MapArr, _ = Util._, $Map;
        // Map Of Names And Functions
        $Map = [
            // Capitalize Strings
            [["cap", "Capital"], function(str) {
                return str.slice(0, 1).toUpperCase() + str.slice(1).toLowerCase();
            }],
            
            // Iterates on a String based on a given RegExp
            [["stringEach", "forEach", "each"], function (str, search, fn) {
                var chunks, chunk, reg, result = [];
                if (_.isFunction(search)) { fn = search; reg = /[\s\S]/g; }
                else if (!search) { reg = /[\s\S]/g; }
                else if (_.isString(search)) { reg = RegExp(search, 'gi'); }
                else if (_.isRegExp(search)) {
                    reg = RegExp(search.source, search.flags || 'g');
                }
                
                // Getting the entire array of chunks up front as we need to
                // pass this into the callback function as an argument.
                if ((chunks = str.match(reg))) {
                    for (var i = 0, r; i < chunks.length; i++) {
                        chunk = chunks[i]; result[i] = chunk;
                        if (fn) {
                            r = fn.call(str, chunk, i, chunks);
                            if (r === false) { return result; }
                            else if ($in.isDef(r)) { result[i] = r; }
                        }
                    }
                }
                return result;
            }],
            
            // Each Word
            [["eachWord", "word"], function (str, fn) {
                return String.stringEach(str.trim(), /\S+/g, fn);
            }],

            // Cuts off a String that is a certain length long
            [["trunc", "Truncate"], function(str, len, end) {
                end = _.isUndefined(end) ? '...' : end; len = len || 30;
                return str.length > len ? str.substring(0, len) + end :
                        String(str);
            }],

            // Escape RegExp Meta Characters
            [["escape"], function(str) {
                if (!_.isString(str)) { return str; }
                return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
            }],

            // Swap Parts of a String that passes a truth test very Similar to Array.filter
            [["swap"], function(str, find, substi) {
                var result = ""; if (!find) { return str; }
                return str.replace(new RegExp(String.escape(find), "g"), substi);
            }],

            // Map a Sring
            [["map"], function(str, fn, contxt) {
                return str.split("").map(fn, contxt).join("");
            }],

            // Camelizes a String
            [["camel", "Camelize"], function(str) {
                return str.split(/\W+/g).map(String.cap).join(" ");
            }],

            // Create's an Array of Index for the First Letter of all Occurances of a Certain String in a Larger String
            [["occur"], function(str, find) {
                try {
                    var _find = _.isRegExp(find) ? find : RegExp(find, "g"), 
                        result, indx = [];
                    if (str && find) {
                        while ((result = _find.exec(str)))
                            { indx.push(result.index); }
                    }
                    return indx;
                } catch (e) {
                    return "There is a problem with `occur`, check the [\"" + str + "\" & " + find + "] params.";
                }
            }],

            // Creates a Template String
            [["temp", "Template"], _.template],

            // Previous Value
            [["prev"], function(str) {
                return str.slice(0, str.length - 1) +
                    String.fromCharCode(str.charCodeAt(str.length - 1) - 1);
            }],

            // Next Value
            [["grow"], function(str) {
                return str.slice(0, str.length - 1) +
                    String.fromCharCode(str.charCodeAt(str.length - 1) + 1);
            }],
            
            // Remove unesscessary space
            [["compact"], function(str) {
                return String.trim(str).replace(/([\r\n\s　])+/g, 
                    function(match, whitespace) {
                        return whitespace === '　' ? whitespace : ' ';
                    });
            }],
            
            // Template Settings
            [["TemplateSet", "tempSet"], function(sets) {
                _.extend(_.templateSettings, sets || {});
            }]
        ];

        // Set Default Template Settings
        _.templateSettings = {
            interpolate: /{=([\s\S]+?)=}/g, /* {= 2 + 2 =} // 4 */
            escape: /{{([\s\S]+?)}}/g, /* "a is {{ a }}".temp({ a: 5 }) // 5 */
            evaluate: /{-([\s\S]+?)-}/g /* "{- _.each([1, 2], function (v, i) { -}
                                                loop {{ i }},
                                            {- }) -}".temp({}) // loop 0, loop 1, */
        };

        // Extend Methods
        MapFunc(Native, $Map);
        MapFunc(Native.prototype, $Map, true);
        return Native;
    });
})(); // String
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
                _.each(Util.args(arguments), function(obj) {
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
                _.each(Util.args(arguments), function(obj) {
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
    // Inertia's Vector Module V2 [www.khanacademy.org/cs/_/5402431084593152]
    // PVector with Tweaks
    Define(["Math.Vector", "Vector", "vector", "vec"], function() {
        var Util = require("Util"), Func = require("Core.Func"), _ = Util._, 
            args = Util.args, VSolve, Static, VFn, Obj,
            Class = require("Class"), Vector,
            Chain = ["rotate", "lerp", "normalize", "limit"]; // Chainable Methods
        // Objectify a Vector for Immidiate Use
        Obj = function($this) {
            return _.isNumber($this) ? Vector($this, $this, $this) : Vector($this);
        };
        // Allows for Quick Vector Math
        VSolve = function(symbol) {
            symbol = symbol || "+";
            return function($this, $vec) {
                var $vec = Obj($vec);
                Func("$this", "$vec", "$this.x " + symbol + "= $vec.x;").call({}, $this, $vec);
                Func("$this", "$vec", "$this.y " + symbol + "= $vec.y;").call({}, $this, $vec);
                Func("$this", "$vec", "$this.z " + symbol + "= $vec.z;").call({}, $this, $vec);
                println($this);
                return $this;
            };
        };
        // Run a Vectors through a Function
        VFn = function($this, fn, args) {
            args = args || [];
            $this.x = fn.apply($this, [$this.x].concat(args));
            $this.y = fn.apply($this, [$this.y].concat(args));
            $this.z = fn.apply($this, [$this.z].concat(args));
            return $this;
        };
        // Vector Object
        Vector = Class({
            init: function () 
                { this.set.apply(this, arguments); }
        })
        // Static Methods of the Vector Object
        .static(PVector, Static = {
            // Basic Vector Math
            add: VSolve(), sub: VSolve("-"), div: VSolve("/"),
            mod: VSolve("%"), mult: VSolve("*"),
            // Invert
            invert: function ($this) { return VSolve("*") ($this, -1); },
            // Distances of Points axis'
            distX: Func("$this", "$vec", "return $this.x - $vec.x;"),
            distY: Func("$this", "$vec", "return $this.y - $vec.y;"),
            distZ: Func("$this", "$vec", "return $this.z - $vec.z;"),
            // Self Explanatory (The Slope / Intercept of two Points)
            slope: Func("$this", "$vec", "return ($this.distY($vec) / $this.distX($vec)) || 0;"),
            intercept: Func("$this", "$vec", "return $this.y - $this.slope($vec) * $this.x;"),
            // Perpendicular Slope
            perpSlope: Func("$this", "$vec", "return -1 / $this.slope($vec);"),
            // Check if 2 Vectors are In a Straight Line
            inLine: function ($this, vec) {
                var $this = $this.copy(), vec = vec.copy();
                return abs($this.cross(vec).z) <= sqrt($this.magSq() + vec.magSq()) * 1e-8;
            },
            // Perpendicular
            perp: function ($this) {
                $this.set($this.y, $this.x, $this.z);
                return $this;
            },
            // Project this vector on to another vector
            project: function (v) 
                { return this.scale(this.dot(v) / v.magSq()); },
            // Project this vector onto a vector of unit length
            projectN: function (v) 
                { return this.mult(this.dot(v)); },
            // Run a Vector through a Function
            fn: VFn,
            // Mid point of to Vectors
            mid: function ($this, $vec) {
                var $vec = Obj($vec);
                return $this.lerp($vec, 0.5);
            },
            // Turn a Vector to an Array
            arr: function (x, y, z) {
                // [x Axis, y Axis, z Axis]
                return _.isArray(x) ? [x[0] || 0, x[1] || 0, x[2] || 0] :
                       _.isObject(x) ? [x.x || 0, x.y || 0, x.z || 0] :
                       [(x || 0), (y || 0), (z || 0)];
            },
            array: Class.get("arr"),
            // Get the Quadrant of Vector
            quad: function($this) {
                return $this.x >= 0 ? $this.y >= 0 ? 1 : 4 : $this.y >= 0 ? 2 : 3;
            },
            // Copy a Vector
            copy: function($this) { return new Vector($this); },
            get: Class.get("copy"),
            // Objectify a Vector for Immidiate Use
            obj: Obj,
            // Are two Vector equal?
            equal: function($this, $vec) {
                var $this = Obj($this); var $vec = Obj($vec);
                return ($this.x === $vec.x && $this.y === $vec.y) ||
                       ($this.x === $vec.x && $this.y === $vec.y &&
                        $this.z === $vec.z);
            },
            // Find the intersection of 4 points
            intersect: function(a, b, c, d) {
                var val, abSlope, cdSlope, abIntercept, cdIntercept;
                abSlope = Static.slope(a, b);
                cdSlope = Static.slope(c, d);
                abIntercept = Static.slope(a, b);
                cdIntercept = Static.slope(c, d);
                val = (cdIntercept - abIntercept) / (abSlope - cdSlope);
                return new Vector(val, abSlope * val + abIntercept);
            },
            // Checks if a Vector is near another
            near: function($this, vec, dist) {
                return $this.dist(vec) <= dist;
            },
            // Set Value of Vector
            set: function ($this, x, y, z) {
                var VecArr = Vector.arr(x, y, z);
                PVector.apply($this, VecArr);
                return $this;
            },
            // Convert From Values to the either Objects or Arrays
            convert: function (x, y, z) {
                var arr = Vector.arr(x, y, z);
                var str = "return '{ x: ' + this.x + ', y: ' + this.y + ', z: ' + this.z + '}'";
                var obj = { x: arr[0], y: arr[1], z: arr[2], toString: Func(str) };
                return _.isArray(x) ? obj : arr;
            }
        })
        // Prototype Methods of the Vector Object
        .method(Class.alias(PVector.prototype, Chain, true),
                Class.alias(Static));
        return Vector;
    }, true);
})(); // Vector
(function() {
    // Inertia's Size Module V2  [www.khanacademy.org/cs/_/5898167898112000]
    // Size Module Basically a Vector that Supports [width & height] as [x & y]
    Define("Size", function() {
        var Class = require("Class"), Vector = require("Vector"),
            _ = require("Util")._;
        // Vector Object
        return Class(Vector, _.reduce({
                    _class: "Size", // Set Class Name & Attribute ID
                    init: function($super, x, y) {
                        $super.apply(this, [x || 0, y || 0]);
                        this.Width = this.width = this.wid = this.w = this.x;
                        this.Height = this.height = this.hei = this.h = this.y;
                    },
                    
                    // Set values of the Object
                    set: function (x, y) {
                        this.setWidth(x); this.setHeight(y || x);
                        return this;
                    },
                    
                    // Sets the width property
                    setWidth: function (val) {
                        this.Width = this.width = this.wid = this.w = val;
                        this.x = val;
                        return this;
                    },
                    
                    // Sets the height property
                    setHeight: function (val) {
                        this.Height = this.height = this.hei = this.h = val;
                        this.y = val;
                        return this;
                    }
                },
                function (obj, val, i) {
                    // Create Capital Copies of the Main Methods
                    obj[i] = obj[i.toLowerCase()] = val;
                    return obj;
                }, {})
            )
                
            // Static Methods
            .static(Vector);
    });
})(); // Size
(function() {
    // Inertia's Color Module V2 [www.khanacademy.org/cs/_/6520178064261120]
    // Color Modules A basic set of Color Utilities
    Define("Color", function() {
        var _ = require("Util")._, CssColors, Static, Fn = require("Core.Func"), Alias,
            Class = require("Class"), $lerp = require("Math.lerp"); require("String");
        // Css Color maps. Color names and their hex values
        CssColors = {
            aliceblue: '#F0F8FF', antiquewhite: '#FAEBD7', aqua: '#00FFFF', aquamarine: '#7FFFD4', azure: '#F0FFFF', beige: '#F5F5DC', bisque: '#FFE4C4', black: '#000000', blanchedalmond: '#FFEBCD', blue: '#0000FF', blueviolet: '#8A2BE2', brown: '#A52A2A', burlywood: '#DEB887', cadetblue: '#5F9EA0', chartreuse: '#7FFF00', chocolate: '#D2691E', coral: '#FF7F50', cornflowerblue: '#6495ED', cornsilk: '#FFF8DC', crimson: '#DC143C', cyan: '#00FFFF', darkblue: '#00008B', darkcyan: '#008B8B', darkgoldenrod: '#B8860B', darkgray: '#A9A9A9', darkgrey: '#A9A9A9', darkgreen: '#006400', darkkhaki: '#BDB76B', darkmagenta: '#8B008B', darkolivegreen: '#556B2F', darkorange: '#FF8C00', darkorchid: '#9932CC', darkred: '#8B0000', darksalmon: '#E9967A', darkseagreen: '#8FBC8F', darkslateblue: '#483D8B', darkslategray: '#2F4F4F', darkslategrey: '#2F4F4F', darkturquoise: '#00CED1', darkviolet: '#9400D3', deeppink: '#FF1493', deepskyblue: '#00BFFF', dimgray: '#696969', dimgrey: '#696969', dodgerblue: '#1E90FF', firebrick: '#B22222', floralwhite: '#FFFAF0', forestgreen: '#228B22', fuchsia: '#FF00FF', gainsboro: '#DCDCDC', ghostwhite: '#F8F8FF', gold: '#FFD700', goldenrod: '#DAA520', gray: '#808080', grey: '#808080', green: '#008000', greenyellow: '#ADFF2F', honeydew: '#F0FFF0', hotpink: '#FF69B4', indianred: '#CD5C5C', indigo: '#4B0082', ivory: '#FFFFF0', khaki: '#F0E68C', lavender: '#E6E6FA', lavenderblush: '#FFF0F5', lawngreen: '#7CFC00', lemonchiffon: '#FFFACD', lightblue: '#ADD8E6', lightcoral: '#F08080', lightcyan: '#E0FFFF', lightgoldenrodyellow: '#FAFAD2', lightgray: '#D3D3D3', lightgrey: '#D3D3D3', lightgreen: '#90EE90', lightpink: '#FFB6C1', lightsalmon: '#FFA07A', lightseagreen: '#20B2AA', lightskyblue: '#87CEFA', lightslategray: '#778899', lightslategrey: '#778899', lightsteelblue: '#B0C4DE', lightyellow: '#FFFFE0', lime: '#00FF00', limegreen: '#32CD32', linen: '#FAF0E6', magenta: '#FF00FF', maroon: '#800000', mediumaquamarine: '#66CDAA', mediumblue: '#0000CD', mediumorchid: '#BA55D3', mediumpurple: '#9370D8', mediumseagreen: '#3CB371', mediumslateblue: '#7B68EE', mediumspringgreen: '#00FA9A', mediumturquoise: '#48D1CC', mediumvioletred: '#C71585', midnightblue: '#191970', mintcream: '#F5FFFA', mistyrose: '#FFE4E1', moccasin: '#FFE4B5', navajowhite: '#FFDEAD', navy: '#000080', oldlace: '#FDF5E6', olive: '#808000', olivedrab: '#6B8E23', orange: '#FFA500', orangered: '#FF4500', orchid: '#DA70D6', palegoldenrod: '#EEE8AA', palegreen: '#98FB98', paleturquoise: '#AFEEEE', palevioletred: '#D87093', papayawhip: '#FFEFD5', peachpuff: '#FFDAB9', peru: '#CD853F', pink: '#FFC0CB', plum: '#DDA0DD', powderblue: '#B0E0E6', purple: '#800080', rebeccapurple: '#663399', red: '#FF0000', rosybrown: '#BC8F8F', royalblue: '#4169E1', saddlebrown: '#8B4513', salmon: '#FA8072', sandybrown: '#F4A460', seagreen: '#2E8B57', seashell: '#FFF5EE', sienna: '#A0522D', silver: '#C0C0C0', skyblue: '#87CEEB', slateblue: '#6A5ACD', slategray: '#708090', slategrey: '#708090', snow: '#FFFAFA', springgreen: '#00FF7F', steelblue: '#4682B4', tan: '#D2B48C', teal: '#008080', thistle: '#D8BFD8', tomato: '#FF6347', turquoise: '#40E0D0', violet: '#EE82EE', wheat: '#F5DEB3', white: '#FFFFFF', whitesmoke: '#F5F5F5', yellow: '#FFFF00', yellowgreen: '#9ACD32'
        };
    
        // Create Aliases for Default Color Functions
        Alias = function(fn, chain) {
            return function() {
                if (!_.isUndefined(chain)) {
                    fn.apply(this, [this.value]
                        .concat(Array.from(arguments)));
                    return this;
                } else {
                    return fn.apply(this, [this.value]
                        .concat(Array.from(arguments)));
                }
            };
        };
    
        // Color Object
        return Class({
            _class: "Color", // Set Class Name
            init: function() {
                // Initial Value
                this.initVal = Array.from(arguments);

                // Use Percent
                var _last = Fn("arr", "return arr[arr.length - 1]");
                var args = _last(this.initVal);
                this.percent = _.isBoolean(args) && args;

                // Color Value
                return (this.value = Static.parse
                    .apply(this, arguments));
            }
        })

        // Static Methods of the Color Object
        .static(CssColors, Static = {
                // Default Color Converter Functions
                alpha: Alias(alpha), green: Alias(green),
                blue: Alias(blue), red: Alias(red),
                
                // Linear interpoliation
                lerp: function (a, b, per) {
                    return $lerp.apply(null,
                        Static.parse(a), Static.parse(b), per);
                },
                
                // Is value a color?
                isColor: _.isColor,

                // Parser For Color HexCodes
                torgb: function(hex, opacity, percent) {
                    var _last = Fn("arr", "return arr[arr.length - 1]");
                    var args = _last(Array.from(arguments));
                    var fn = Fn("v", "return v + v");
                    hex = hex.replace(/#/g, "");
                    this.percent = _.isBoolean(args) && args;
                    var rgb = color.toArray("0xFF" +
                        (hex.length === 3 ? hex.map(fn) : hex));
                    rgb[3] = _.isUndefined(opacity) ? 255 :
                        (this.percent ? opacity * 255 : opacity);
                    return rgb;
                },

                // String Colors to Rgba
                str_rgb: function(clr) {
                    if (clr.includes("rgb")) {
                        // Rgb | Rgba
                        clr = clr.replace(/rgb?a|[^\d\.\,]/g, "");
                        return clr.split(",");
                    } else if (clr.includes("hsb")) {
                        // Hsb
                        clr = clr.replace(/hsb?a|[^\d\.\,]/g, "").split(",");
                        colorMode(HSB); var $clr = color.apply({}, clr);
                        colorMode(RGB);
                        return [red($clr), green($clr), blue($clr), alpha($clr)];
                    } else if (clr.includes("hsl")) {
                        // Hsl
                        clr = clr.replace(/hsl?a|[^\d\.\,]/g, "").split(",");
                        colorMode(HSB); var temp = clr[2];
                        clr[2] = temp - clr[1] / 2;
                        var $clr = color.apply({}, clr);
                        colorMode(RGB);
                        return [red($clr), green($clr), blue($clr), alpha($clr)];
                    } else { return Static.torgb.apply({}, arguments); }
                },

                // Color to Rgba Array
                clr_rgb: function() {
                    var _args = Array.from(arguments), clr;
                    _args = _.isArray(_args[0]) ? _args[0] : _args;
                    clr = color.apply({}, (_.isString(_args[0]) ?
                        Static.str_rgb.apply({}, _args) : _args));
                    return [red(clr), green(clr), blue(clr), alpha(clr)];
                },

                // Parse the Color inputed into an RGBA Array
                parse: function(clr) {
                    var args = Array.from(arguments);
                    clr = (clr + "").toLowerCase();
                    return Static.clr_rgb.apply(this,
                        _.keys(CssColors).includes(clr) ? [CssColors[clr]]
                        .concat(args.slice(1)) : args);
                },
                
                // Is color dark?
                isDark: function () {
                    // YIQ equation from http://24ways.org/2010/calculating-color-contrast
                    var rgb = Static.parse.apply(null, arguments);
                    var yiq = (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000;
                    return yiq < 128;
                },
                
                // Is color light?
                isLight: function ()
                    { return Static.isDark.apply(null, arguments); },
                
                // Parse the Color inputed into an RGBA String
                tostr: function(clr) {
                    var arr = Static.parse.apply(this, arguments);
                    var obj = {
                        r: arr[0], g: arr[1],  b: arr[2], a: arr[3] / 255
                    };

                    return "rgba({{r}}, {{g}}, {{b}}, {{a}})".temp(obj);
                },

                // Stronger Version Of The fill function that allows hexCodes & other color schemes
                fill: function() {
                    fill.apply(this,
                        Static.parse.apply(this, arguments));
                },

                // Stronger Version Of The stroke function that allows hexCodes & other color schemes
                stroke: function() {
                    stroke.apply(this,
                        Static.parse.apply(this, arguments));
                },

                // Stronger Version Of The background function that allows hexCodes & other color schemes
                background: function() {
                    background.apply(this,
                        Static.parse.apply(this, arguments));
                }
            })

        // Prototype Methods of the Color Object
        .addto(_.reduce(Static, function(obj, val, i) {
            if (i !== "fill" && i !== "stroke" && i !== "background")
                { obj[i] = Alias(val, false); }
            else { obj[i] = Alias(val); }
            return obj;
        }, {}));
    });
})(); // Color
(function() {
    // Inertia's Ease Module V2 [www.khanacademy.org/cs/_/--]
    // Ease Modules a basic set of Easing Utilities
    Define("Ease", function() {
        var _ = require("Util")._, Static, Elastic, BounceOut, BounceIn, Ease;
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
        
        // Easing Default
        Ease = function (strt, end, vel) {
            vel = vel || 12;
            return _.isString(strt) ?
                    Ease[strt.toString().toLowerCase()]
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
            
            return function(t) {
                return polyBez([bez[0], bez[1]], [bez[2], bez[3]]) (constrain(t / 1, 0, 1));
            };
        };
        
        // Easing Equations
        Ease.fn = {}; // Function Form
        Ease.eq = Ease.equations = {
            ease: [0.25, 0.1, 0.25, 1], /* Ease */
            linear: [0.250, 0.250, 0.750, 0.750],
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
            if (_.isArray(obj)) {
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
(function() {
    // Inertia's Key Module V2 [www.khanacademy.org/cs/_/5009088521469952]
    Define("Key", function() {
        var UIEvent = require("UIEvent"), Event = Inertia.Event,
            _ = require("Util._"), Key, Emit, Prefix, Special;
        // A Map of Special Keys & Characters with all Their Keys & Key Codes
        // Based on MouseTrap [github.com/ccampbell/mousetrap/blob/master/mousetrap.js]
        Special = {
            // Map of Special Key Codes & Keys
            Key: {
                "backspace": "8",
                "pagedown": "34",
                "capslock": "20",
                "pageup": "33",
                "right": "39",
                "space": "32",
                "shift": "16",
                "enter": "13",
                "meta": "91",
                "down": "40",
                "left": "37",
                "home": "36",
                "ctrl": "17",
                "del": "46",
                "ins": "45",
                "end": "35",
                "esc": "27",
                "alt": "18",
                "tab": "9",
                "up": "38"
            },
            
            // Different Naming for Keys
            Alias: {
                'option': 'alt',
                'command': 'meta',
                'return': 'enter',
                'escape': 'esc',
                'plus': '+',
            }
        };
    
        // Event Object
        Key = UIEvent("Key");
        // Define Updating, Initialized, Key Properties
        Object.defineProperties(Key, {
            // Are Keyboard Events Disabled
            Disabled: { value: false },
            // Key Is Pressed
            Press: {
                get: function() { return !this.Disabled && keyIsPressed; }
            },
            // Key Code of the Current Key Being Pressed
            Code: {
                get: function() {
                    return !this.Disabled && (key.code === CODED ? keyCode : key.code);
                }
            },
            // Current Key Being Pressed
            Btn: { get: function() { return !this.Disabled && key; } },
        });
    
        // Key Letter Properties
        _.each(_.range(30, 125), function(num) {
            // Create Each Key
            Key[String.fromCharCode(num)] = this.Btn === num;
            // Store All Keys And Their Key Codes
            Special.Key[String.fromCharCode(num)] = num;
        }, Key);
    
        // List of all Event Names
        Key.evtlst = Key.EventList = [];
        // Special Keys
        Key.key = Key.Key = Special.Key;
        // List of Keys Pressed as KeyCode or as a String
        Key.lst = Key.List = [].concat(Key.lststr = Key.ListStr = []);
        // Emit Set
        Emit = function(evt, fn) {
            // Add Event Names to List
            Key.EventList.push(evt);
            return function(e) {
                if (!Key.Disabled) {
                    (fn || function() {}).apply(Key, arguments);
                    Key.emit.apply(Key, [evt, e]);
                }
            };
        };
        
        // Change Array of Key Name's to KeyCodes
        Key.toCode = function (_key) {
            var aliasKey = _.keys(Special.Alias);
            var keyMap = _.keys(Special.Key);
            var arr = _.isArray(_key) ? _key : (_key || "").split(" ");
            return _.reduce(arr, function (acc, i) {
                var val = i;
                if (aliasKey.includes(i))
                    { val = Special.Key[Special.Alias[i]]; }
                else if (keyMap.includes(i))
                    { val = Special.Key[i]; }
                else if (_.isNumber(Number(i)) && Number(i) > 9)
                    { val = i; }
                acc.push(Number(val));
                return acc;
            }, []).sort();
        };
        
        // Check is Certain Key are being Pressed
        Key.Equal = function (a, b) {
            return _.isEqual(Key.toCode(a), Key.toCode(b));
        };
        
        // Checks for Which Keys Are Being Pressed
        Key.onBind = function (_key, fn) {
            return Key.on("Press", function () {
                if (Key.Equal(_key, Key.List, true)) {
                    return (fn || function () {}).apply(this, arguments);
                }
            });
        };
    
        // Set Prefix
        Prefix = "onKey";
        // Emit Key Events
        Event.on(Prefix + "Type", Emit("Type"), Key);
        Event.on(Prefix + "Release", Emit("Release", function() {
            Key[Key.Code] = Key[key.toString()] = false;
            Key.ListStr = Inertia.Key.ListStr;
            Key.List = Inertia.Key.List;
        }), Key);
    
        Event.on(Prefix + "Press", Emit("Press", function() {
            Key[Key.Code] = Key[key.toString()] = true;
            Key.ListStr = Inertia.Key.ListStr;
            Key.List = Inertia.Key.List;
        }), Key);
        return Key;
    });
})(); // Key
(function() {
    // Inertia's Touch Module V2 [www.khanacademy.org/cs/_/4951327923011584]
    Define("Touch", function() {
        var UIEvent = require("UIEvent"), Event = $in.Event,
            Env = require("Core.Env"), Touch, Emit, Prefix;
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
                if (!Touch.Disabled) 
                    { Touch.emit.apply(Touch, [evt, e]); }
            };
        };
        
        Prefix = "onTouch"; // Set Prefix
        // Emit Touch Events
        Event.on(Prefix + "Cancel", Emit("Cancel"), Touch);
        Event.on(Prefix + "Start", Emit("Start"), Touch);
        Event.on(Prefix + "Move", Emit("Move"), Touch);
        Event.on(Prefix + "End", Emit("End"), Touch);
        return Touch;
    });
})(); // Touch
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
                        if (this.complete) { this.readyFn.call($in.pjs); } 
                        else { this.loadFn(); }
                    } catch (e) { this.errFn(e); }
                }, this);
                return this;
            },
        });
    });
})(); // Async 
(function() {
    // Inertia's Accum Module V2 [www.khanacademy.org/cs/_/5750787651436544]
    Define("Accum", function() {
        var To, Func = require("Core.Func"), _ = require("Util")._, To,
            Eq = function (sy) // Equation
                { return Func("a", "b", "return a" + (sy || "+") + "b"); };
        return _.reduce({
            To: (To = function(obj, n, func, start) {
                /* Calculates The Total Value Of An Object Until
                   It Reaches The Index That Has Been Set */
                return _.reduce(obj.slice(0, n), func,
                    typeof start === "undefined" ? 0 : start);
            }),

            // Defaults
            Add: function(obj, n) { return To(obj, n, Eq(), 0); },
            Sub: function(obj, n) { return To(obj, n, Eq("-"), 0); },
            Div: function(obj, n) { return To(obj, n, Eq("/"), 1); },
            Mult: function(obj, n) { return To(obj, n, Eq("*"), 1); },
        }, function (obj, val, i) {
            // Capitals and Lowercases 
            obj[i.toLowerCase()] = obj[i] = val;
            return obj;
        }, {});
    });
})(); // Accum
(function() {
    // Inertia's Range Module V2 [www.khanacademy.org/cs/_/5953955266068480]
    // Range Module create an Array full of a Range of Objects
    Define("Range", function() {
        var _ = require("Util")._; require("Math"); require("String");
        // Range Function
        return function(strt, end, inc, exclude) {
            var _include, arr = [], value = strt;
            // Use Uderscore's Default
            if (_.isNumber(strt) || _.isNumber(end)) {
                strt = arguments.length === 1 ? 0 : strt;
                end = arguments.length === 1 ? strt : end;
                return _.range.apply({}, [strt, exclude ? end : end + 1, inc]);
            }

            // Check if the last Value of the Range is Included
            _include = function(val) {
                if (inc) { return val < this.End; }
                if (val < strt) { return false; }
                return val <= end;
            };

            // Iterate through the Range
            while (_include(value)) {
                arr.push(value);
                value = value.next();
            }
            return arr;
        };
    });
})(); // Range
(function() {
    // Heavily based on Chaijs [chaijs.com]
    Define("Error", function () {
        var Core = require("Core"), Util = require("Util"), Fn = require("Fn"), 
            Class = require("Class"), $JSON = Core.JSON, Proxy = Core.Proxy, 
            Reflect = Core.Reflect, _ = Util._, $Err, Static, fnLenDesc;
        // Length descriptor
        fnLenDesc = Object.getOwnPropertyDescriptor(function () {}, 'length');
        Static = { // Static methods
            // Get or set a flag value on an object [github.com/chaijs/chai/blob/058ddadb8422238b418d0c3e8f92e4f757289abd/lib/chai/utils/flag.js]
            flag: function (obj, key, val) {
                var flags = obj.__flags || (obj.__flags = {});
                return Util.path(flags, key, val);
            },
            
            // Transfer all the flags for `assertion` to `object`. [github.com/chaijs/chai/blob/058ddadb8422238b418d0c3e8f92e4f757289abd/lib/chai/utils/transferFlags.js]
            transferFlags: function (assert, obj, all) {
                var flags = assert.__flags || (assert.__flags = {});
                if (!obj.__flags) { obj.__flags = {}; }
                all = $in.isDef(all) ? all : true;
            
                for (var _flag in flags) {
                    if (all ||
                        (_flag !== 'object' && _flag !== 'message')) {
                        obj.__flags[_flag] = flags[_flag];
                    }
                }
            },
            
            // Return a proxy of given object that. [github.com/chaijs/chai/blob/058ddadb8422238b418d0c3e8f92e4f757289abd/lib/chai/utils/proxify.js]
            proxify: function (obj, staticMethod) {
                var proxyGetter, builtIn = ['__flags', '__methods', '_obj', 'assert'];
                return Proxy(obj, {
                    get: (proxyGetter = function (target, prop) { 
                        // This check is here because we should not throw errors on Symbol properties such as `Symbol.toStringTag`.  The values for which an error should be thrown can be configured using the `config.proxyExcludedKeys` setting.
                        if (_.isString(prop) && !Reflect.has(target, prop)) {
                            // Special message for invalid property access of non-chainable methods.
                            if (staticMethod) {
                                throw 'Invalid Debug property: ' + staticMethod + '.' + prop + '. See api for proper usage of "' + staticMethod + '".';
                            }
            
                            // If the property is reasonably close to an existing property, suggest that property to the user. Only suggest properties with a distance less than 4.
                            var suggestion = null;
                            Util.allKeys(target).forEach(function(_prop) {
                                if (!_.has(Object, _prop) && builtIn.indexOf(_prop) === -1 && target.indexOf(_prop) > -1) {
                                    suggestion = (suggestion || []).concat(_prop);
                                }
                            });
            
                            if (suggestion !== null) {
                                throw 'Invalid property: ' + prop + '. Did you mean "' + suggestion + '"?';
                            } else { throw 'Invalid property: ' + prop; }
                        }
                        return Reflect.get(target, prop);
                    })
                });
            },
            
            // Echoes the value of a value. Tries to print the value out in the best way possible given the different types. [github.com/chaijs/chai/blob/058ddadb8422238b418d0c3e8f92e4f757289abd/lib/chai/utils/inspect.js]
            inspect: function(obj, showHidden, depth) {
                var show = showHidden, seen = [];
                var FormatProp, FormatVal;
                return (FormatVal = function(obj, depth) {
                        var output = [], vKeys, aKeys, keys, length, base = '', 
                            braces = _.isArray(obj) ? ['[', ']'] : ['{', '}'];
    
                        // Primitive types cannot have properties
                        switch (typeof obj) {
                            case 'undefined': return 'undefined';
                            case 'string':
                                return '\'' + Core.JSON.stringify(obj).replace(/^"|"$/g, '')
                                    .replace(/'/g, "\\'")
                                    .replace(/\\"/g, '"') + '\'';
                            case 'number':
                                if (obj === 0 && (1 / obj) === -Infinity) { return '-0'; }
                                return '' + obj;
                            case 'boolean':  return '' + obj;
                            case 'symbol': return obj.toString();
                        }
                        if (obj === null) { return 'null'; } // For some reason typeof null is an "object", so special case here.
    
                        // Look up the keys of the object.
                        vKeys = _.keys(obj); // Visible keys 
                        aKeys = function () { 
                            return _.without(Util.allKeys(obj), 'caller', 'callee', 'arguments'); 
                        }; // All keys, visible & hidden (excluding caller, callee, and arguments, KA doesn't allow these)
                        keys = show ? aKeys() : vKeys; // Display either all keys or only visible keys based on `showHidden`
                        
                        // Make [these] state what they are
                        if (_.isFunction(obj)) { 
                            // `.toStr` removes any added code during runtime
                            base = obj.toStr ? obj.toStr() : obj.toString(); 
                        } 
                        if (_.isRegExp(obj)) { base = obj.toString(); }
                        if (_.isDate(obj)) { base = obj.toUTCString(); }
    
                        // Some type of object without properties can be shortcut.
                        if (keys.length === 0 && !_.isArray(obj)) { return base; }
                        if (keys.length === 0 && (!_.isArray(obj) || obj.length === 0)) 
                            { return braces[0] + base + braces[1]; }
                        if (depth < 0) {
                            return _.isRegExp(obj) ? obj.toString() : '[Object]';
                        }
    
                        seen.push(obj);
                        if (_.isArray(obj)) {
                            // Format Array
                            output = [];
                            for (var i = 0, $key; i < obj.length; ++i) {
                                output.push(_.has(obj, $key = String(i)) ? 
                                    FormatProp(obj, depth, vKeys, $key, true) : '');
                            }
                            keys.forEach(function(_key) {
                                if (!_key.match(/^\d+$/)) 
                                    { output.push( FormatProp(obj, depth, vKeys, _key, true) ); }
                            });
                        } else {
                            output = keys.map(function(_key) {
                                return FormatProp(obj, depth, vKeys, _key, _.isArray(obj));
                            });
                        }
                        seen.pop();
    
                        // Compile all data into final output
                        return (function() {
                            length = output.reduce(function(prev, cur) {
                                return prev + cur.length + 1;
                            }, 0);
                            if (length > 60) {
                                return braces[0] + "\n " + (base === '' ? '' : base + '\n ') + ' ' + output.join(',\n  ') + ' \n' + braces[1];
                            }
                            return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
                        })();
                    }),
                    (FormatProp = function(obj, depth, vKeys, _key, arr) {
                        var propDescriptor = Object.getOwnPropertyDescriptor(obj, _key),
                            name, str;
                        if (propDescriptor) {
                            if (propDescriptor.get) {
                                if (propDescriptor.set) { str = '[Getter/Setter]'; }
                                else { str = '[Getter]'; }
                            } else {
                                if (propDescriptor.set) { str = '[Setter]'; }
                            }
                        }
                        if (vKeys.indexOf(_key) < 0) { name = '[' + _key + ']'; }
                        if (!str) {
                            if (seen.indexOf(obj[_key]) < 0) {
                                if (depth === null) { str = FormatVal(obj[_key], null); }
                                else { str = FormatVal(obj[_key], depth - 1); }
                                if (str.indexOf('\n') > -1) {
                                    if (arr) {
                                        str = str.split('\n').map(function(line) {
                                            return '  ' + line;
                                        }).join('\n').substr(2);
                                    } else {
                                        str = str.split('\n').map(function(line) {
                                            return '  ' + line;
                                        }).join('\n').substr(2);
                                    }
                                }
                            } else { str = '[Circular]'; }
                        }
                        if (typeof name === 'undefined') {
                            if (arr && _key.match(/^\d+$/)) { return str; }
                            name = Core.JSON.stringify('' + _key);
                            if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
                                name = name.substr(1, name.length - 2);
                            } else {
                                name = name.replace(/'/g, "\\'")
                                    .replace(/\\"/g, '"')
                                    .replace(/(^"|"$)/g, "'");
                            }
                        }
                        return name + ': ' + str;
                    }),
                    FormatVal(obj, (typeof depth === 'undefined' ? 3 : depth));
            },
            
            // Determines if an object or an array matches criteria to be inspected in-line for error messages or should be truncated. [github.com/chaijs/chai/blob/058ddadb8422238b418d0c3e8f92e4f757289abd/lib/chai/utils/objDisplay.js]
            display: function (obj) {
                var str = Static.inspect(obj);
                if (str.length >= 40) {
                    if (_.isFunction(obj)) {
                        return !obj.name || obj.name === '' ?
                            '[Function]' : '[Function: ' + obj.name + ']';
                    } else if (_.isArray(obj)) 
                        { return '[ Array(' + obj.length + ') ]'; }
                    else if (_.isObject(obj)) {
                        var keys = Object.keys(obj);
                        return '{ Object (' + keys.length > 2 ?
                            keys.splice(0, 2).join(', ') + ', ...' :
                            keys.join(', ') + ') }';
                    } else { return str; }
                } else { return str; }
            },
            
            // Construct the error message based on flags and template tags. [github.com/chaijs/chai/blob/058ddadb8422238b418d0c3e8f92e4f757289abd/lib/chai/utils/getMessage.js]
            getMessage: function (obj, args) {
                var  actual = args.length > 4 ? args[4] : obj._obj,
                    flagMsg = Static.flag(obj, 'message'),
                    negate = Static.flag(obj, 'negate'),
                    val = Static.flag(obj, 'object'),
                    msg = negate ? args[2] : args[1], 
                    expected = args[3];
                if (_.isFunction(msg)) { msg = msg(); }
                msg = (msg || '')
                    .replace(/#\{this\}/g, Static.display(val))
                    .replace(/#\{act\}/g, Static.display(actual))
                    .replace(/#\{exp\}/g, Static.display(expected));
                return flagMsg ? flagMsg + ' - ' + msg : msg;
            },
            
            // Define `length` as a getter on the given uninvoked method assertion. [github.com/chaijs/chai/blob/058ddadb8422238b418d0c3e8f92e4f757289abd/lib/chai/utils/addLengthGuard.js]
            lengthGuard: function (fn, assertionName, isChainable) {
                if (!fnLenDesc.configurable) { return fn; }
                Object.defineProperty(fn, 'length', {
                    get: function() {
                        if (isChainable) {
                            throw 'Invalid Debug property: ' + assertionName + '.length. Due to a compatibility issue, "length" cannot directly follow "' + assertionName + '". Use "' + assertionName + '.lengthOf" instead.';
                        }
                        throw 'Invalid Debug property: ' + assertionName + '.length. See docs for proper usage of "' + assertionName + '".';
                    }
                });
                return fn;
            },
        
            // Adds a property to the prototype of an object. [github.com/chaijs/chai/blob/058ddadb8422238b418d0c3e8f92e4f757289abd/lib/chai/utils/addProperty.js]
            addProperty: function(name, fn) {
                fn = _.isUndefined(fn) ? function() {} : fn;
                (_.isArray(name) ? name : [name]).forEach(function (val) {
                    Object.defineProperty(this.prototype, val, {
                        get: function () {
                            var result = fn.call(this);
                            if (result !== undefined) { return result; }
                            return this;
                        },
                        configurable: true
                    });
                }, this);
            },
            
            // Adds a method to the prototype of an object. [github.com/chaijs/chai/blob/058ddadb8422238b418d0c3e8f92e4f757289abd/lib/chai/utils/addMethod.js]
            addMethod: function(name, fn) {
                var methodWrapper = function() {
                    var result = fn.apply(this, arguments);
                    if (result !== undefined) { return result; }
                    return this;
                };
                (_.isArray(name) ? name : [name]).forEach(function (val) {
                    Static.lengthGuard(methodWrapper, val, false);
                    this.prototype[name] = Static.proxify(methodWrapper, val);
                }, this);
            },
            
            // Adds a method to an object, such that the method can also be chained. [github.com/chaijs/chai/blob/058ddadb8422238b418d0c3e8f92e4f757289abd/lib/chai/utils/addChainableMethod.js]
            addChainableMethod: function (name, method, role) {
                // Check whether `Object.setPrototypeOf` is supported
                var ctx = this.prototype;
                // Cache `Function` properties
                var call = Core.Func.prototype.call,
                    apply = Core.Func.prototype.apply;
                if (!_.isFunction(role)) { role = function() {}; }
                var behave = { method: method, role: role };
            
                // Save the methods so we can overwrite them later, if we need to.
                if (!ctx.__methods) { ctx.__methods = {}; }
                (_.isArray(name) ? name : [name]).forEach(function (val) {
                    ctx.__methods[val] = behave;
                    Object.defineProperty(ctx, val, {
                        get: function () {
                            behave.role.call(this);
                            var MethodWrapper = function() {
                                var result = behave.method.apply(this, arguments);
                                if (result !== undefined) { return result; }
                                return this;
                            };
                            Static.lengthGuard(MethodWrapper, val, true);
                            // Inherit all properties from the object by replacing the `Function` prototype
                            var prototype = Object.create(this);
                            // Restore the `call` and `apply` methods from `Function`
                            prototype.call = call; prototype.apply = apply;
                            Object.setPrototypeOf(MethodWrapper, prototype);
                            Static.transferFlags(this, MethodWrapper);
                            return Static.proxify(MethodWrapper);
                        },
                        configurable: true
                    });
                }, this);
            },
            
            /*** - Interfaces - ***/
            // Expect Interface [github.com/chaijs/chai/blob/058ddadb8422238b418d0c3e8f92e4f757289abd/lib/chai/interface/expect.js]
            expect: function(val, message) {
                return $Err(val, message);
            },
            
            // Should Interface [github.com/chaijs/chai/blob/058ddadb8422238b418d0c3e8f92e4f757289abd/lib/chai/interface/should.js]
            should: function () {
                // Modify Object.prototype to have `should`
                Object.defineProperty(Core.Object.prototype, 'should', {
                    set: function(value) {
                        // See https://github.com/chaijs/chai/issues/86: this makes
                        // `whatever.should = someValue` actually set `someValue`, which is
                        // especially useful for `global.should = require('chai').should()`.
                        // Note that we have to use [[DefineProperty]] instead of [[Put]]
                        // since otherwise we would trigger this very setter!
                        Object.defineProperty(this, 'should', {
                            value: value,
                            enumerable: true,
                            configurable: true,
                            writable: true
                        });
                    },
                    get: function() {
                        if (this instanceof Core.String ||
                            this instanceof Core.Number ||
                            this instanceof Core.Boolean ||
                            typeof Core.Symbol === 'function' && this instanceof Core.Symbol) {
                            return Static.expect(this.valueOf(), null);
                        }
                        return Static.expect(this, null);
                    },
                    configurable: true
                });
                return {};
            },
        };
        
        // Error Class
        $Err = Class({ 
            init: function (obj, msg) {
                Static.flag(this, 'object', obj);
                Static.flag(this, 'message', msg);
                return Static.proxify(this);
            },
            
            // Executes an expression and check expectations. Throws Error for reporting if test doesn't pass.
            assert: function(expr, msg, negateMsg) {
                var args = Util.args(arguments);
                var ok = Static.flag(this, 'negate') ? !args[0] : args[0];
                if (!ok) {
                    msg = Static.getMessage(this, arguments);
                    throw Core.Error(msg);
                }
            },
            
            // Quick reference to stored `actual` value.
            _obj:  {
                get: function() 
                    { return Static.flag(this, 'object'); },
                set: function(val) 
                    { Static.flag(this, 'object', val); }
            }
        })
        // Static Properties / Methods
        .static(Static);
        
        // Language chains [github.com/chaijs/chai/blob/058ddadb8422238b418d0c3e8f92e4f757289abd/lib/chai/core/assertions.js]
        (function () {
            var SameValueZero, compatibleConstructor, isSubsetOf, assertProperty;
            // The following are provided as chainable getters to improve the readability of your assertions. These don't affect anything.
            ['to', 'be', 'been', 'is', 'and', 'has', 'have', 'with', 'that', 'which', 'at', 'of', 'same', 'but', 'does'].forEach(function(chain) {
                $Err.addProperty(chain);
            });
            // Negates all assertions that follow in the chain.
            $Err.addProperty('not', function() {
                Static.flag(this, 'negate', true);
            });
            // Causes all `.equal`, `.include`, `.members`, `.keys`, and `.property` assertions that follow in the chain to use deep equality instead of strict (`===`) equality.
            $Err.addProperty('deep', function() {
                Static.flag(this, 'deep', true);
            });
            // Enables dot- and bracket-notation in all `.property` and `.include` assertions that follow in the chain.
            $Err.addProperty('nested', function() {
                Static.flag(this, 'nested', true);
            });
            // Causes all `.property` and `.include` assertions that follow in the chain to ignore inherited properties.
            $Err.addProperty('own', function() {
                Static.flag(this, 'own', true);
            });
            // Causes all `.members` assertions that follow in the chain to require that members be in the same order.
            $Err.addProperty('ordered', function() {
                Static.flag(this, 'ordered', true);
            });
            // Causes all `.keys` assertions that follow in the chain to only require that the target have at least one of the given keys. This is the opposite of `.all`, which requires that the target have all of the given keys.
            $Err.addProperty('any', function() {
                Static.flag(this, 'any', true);
                Static.flag(this, 'all', false);
            });
            // Causes all `.keys` assertions that follow in the chain to require that the target have all of the given keys. This is the opposite of `.any`, which only requires that the target have at least one of the given keys.
            $Err.addProperty('all', function() {
                Static.flag(this, 'all', true);
                Static.flag(this, 'any', false);
            });
            // Asserts that the target's type is equal to the given string `type`. Types are case insensitive. `.a` accepts an optional `msg` argument which is a custom error message to show when the assertion fails. The message can also be given as the second argument to `expect`.
            $Err.addChainableMethod(['an', 'a'], function (type, msg) {
                type = type.toLowerCase();
                if (msg) { Static.flag(this, 'message', msg); }
                var obj = Static.flag(this, 'object'),
                    article = ~['a', 'e', 'i', 'o', 'u'].indexOf(type.charAt(0)) ? 'an ' : 'a ';
                this.assert(type === typeof obj, 'expected #{this} to be ' + article + type, 'expected #{this} not to be ' + article + type);
            });
            
            // When the target is a string, `.include` asserts that the given string `val` is a substring of the target.
            SameValueZero = function (a, b) {
                return (_.isNaN(a) && _.isNaN(b)) || a === b;
            };
            // Checks if two constructors are compatible. This function can receive either an error constructor or an error instance as the `errorLike` argument. Constructors are compatible if they're the same or if one is an instance of another. [github.com/chaijs/check-error/blob/master/index.js]
            compatibleConstructor = function (thrown, errorLike) {
                if (errorLike instanceof Error) {
                    // If `errorLike` is an instance of any error we compare their constructors
                    return thrown.constructor === errorLike.constructor || thrown instanceof errorLike.constructor;
                } else if (errorLike.prototype instanceof Error || errorLike === Error) {
                    // If `errorLike` is a constructor that inherits from Error, we compare `thrown` to `errorLike` directly
                    return thrown.constructor === errorLike || 
                           thrown instanceof errorLike;
                }
                return false;
            };
            $Err.addChainableMethod(['include', 'contain', 'contains', 'includes', ], function (val, msg) {
                    if (msg) { Static.flag(this, 'message', msg); }
                    var obj = Static.flag(this, 'object'), objType = typeof obj,
                        flagMsg = Static.flag(this, 'message'),
                        negate = Static.flag(this, 'negate'),
                        isDeep = Static.flag(this, 'deep'),
                        descriptor = isDeep ? 'deep ' : '';
                    flagMsg = flagMsg ? flagMsg + ': ' : '';
                    var included = false;
                    switch (objType) {
                        case 'string': included = obj.indexOf(val) !== -1; break;
                        case 'weakset':
                            if (isDeep) { throw Core.Error(flagMsg + 'unable to use .deep.include with WeakSet'); }
                            included = obj.has(val);
                        break;
                        case 'map':
                            var isEql = isDeep ? _.isEqual : SameValueZero;
                            obj.forEach(function(item) {
                                included = included || isEql(item, val);
                            });
                        break;
                        case 'set':
                            if (isDeep) {
                                obj.forEach(function(item) {
                                    included = included || _.isEqual(item, val);
                                });
                            } else { included = obj.has(val); }
                        break;
                        case 'array':
                            if (isDeep) {
                                included = obj.some(function(item) {
                                    return _.isEqual(item, val);
                                });
                            } else { included = obj.indexOf(val) !== -1; }
                        break;
                        default:
                            // This block is for asserting a subset of properties in an object. `_.expectTypes` isn't used here because `.include` should work with objects with a custom `@@toStringTag`.
                            if (val !== Object(val)) {
                                throw Core.Error(flagMsg + 'object tested must be an array, a map, an object, a set, a string, or a weakset, but ' + objType + ' given');
                            }
                            var props = Object.keys(val), firstErr = null, numErrs = 0;
                            props.forEach(function(prop) {
                                var propAssertion = new $Err(obj);
                                Static.transferFlags(this, propAssertion, true);
                                if (!negate || props.length === 1) {
                                    propAssertion.property(prop, val[prop]);
                                    return;
                                }
                                try { propAssertion.property(prop, val[prop]); } 
                                catch (err) {
                                    if (!compatibleConstructor(err, Error)) { throw err; }
                                    if (firstErr === null) { firstErr = err; }
                                    numErrs++;
                                }
                            }, this);
            
                            // When validating .not.include with multiple properties, we only want to throw an assertion error if all of the properties are included, in which case we throw the first property assertion error that we encountered.
                            if (negate && props.length > 1 && numErrs === props.length) 
                                { throw firstErr; }
                            return;
                    }
            
                    // Assert inclusion in collection or substring in a string.
                    this.assert(included, 'expected #{this} to ' + descriptor + 'include ' + Static.inspect(val), 'expected #{this} to not ' + descriptor + 'include ' + Static.inspect(val));
                }, 
                function () {
                    Static.flag(this, 'contains', true);
                });
            // Asserts that the target is a truthy value (considered `true` in boolean context). However, it's often best to assert that the target is strictly (`===`) or deeply equal to its expected value.
            $Err.addProperty('ok', function() {
                this.assert(Static.flag(this, 'object'), 'expected #{this} to be truthy', 'expected #{this} to be falsy');
            });
            // Asserts that the target is strictly (`===`) equal to `true`.
            $Err.addProperty('true', function() {
                this.assert(Static.flag(this, 'object') === true, 'expected #{this} to be true', 'expected #{this} to be false', Static.flag(this, 'negate') ? false : true);
            });
            // Asserts that the target is strictly (`===`) equal to `false`.
            $Err.addProperty('false', function() {
                this.assert(Static.flag(this, 'object') === false, 'expected #{this} to be false', 'expected #{this} to be true', Static.flag(this, 'negate') ? true : false);
            });
            // Asserts that the target is strictly (`===`) an `object`.
            $Err.addProperty('object', function() {
                this.assert(typeof Static.flag(this, 'object') === 'object', 'expected #{this} to be an object', 'expected #{this} to not be an object');
            });
            // Asserts that the target is strictly (`===`) an `array`.
            $Err.addProperty('array', function() {
                this.assert(_.isArray(Static.flag(this, 'object')), 'expected #{this} to be an array', 'expected #{this} to not be an array');
            });
            // Asserts that the target is strictly (`===`) a `function`.
            $Err.addProperty('function', function() {
                this.assert(_.isFunction(Static.flag(this, 'object')), 'expected #{this} to be a function', 'expected #{this} to not be a function');
            });
            // Asserts that the target is strictly (`===`) a `string`.
            $Err.addProperty('string', function() {
                this.assert(_.isString(Static.flag(this, 'object')), 'expected #{this} to be a string', 'expected #{this} to not be a string');
            });
            // Asserts that the target is strictly (`===`) a `number`.
            $Err.addProperty('number', function() {
                this.assert(_.isNumber(Static.flag(this, 'object')), 'expected #{this} to be a number', 'expected #{this} to not be a number');
            });
            // Asserts that the target is strictly (`===`) equal to `null`.
            $Err.addProperty('null', function() {
                this.assert(Static.flag(this, 'object') === null, 'expected #{this} to be null', 'expected #{this} not to be null');
            });
            // Asserts that the target is strictly (`===`) equal to `undefined`.
            $Err.addProperty('undefined', function() {
                this.assert(Static.flag(this, 'object') === undefined, 'expected #{this} to be undefined', 'expected #{this} not to be undefined');
            });
            // Asserts that the target is exactly `NaN`.
            $Err.addProperty('NaN', function() {
                this.assert(_.isNaN(Static.flag(this, 'object')), 'expected #{this} to be NaN', 'expected #{this} not to be NaN');
            });
            // Asserts that the target is not strictly (`===`) equal to either `null` or `undefined`. However, it's often best to assert that the target is equal to its expected value.
            $Err.addProperty('exist', function() {
                var val = Static.Static.flag(this, 'object');
                this.assert(val !== null && val !== undefined, 'expected #{this} to exist', 'expected #{this} to not exist');
            });
            // When the target is a string or array, `.empty` asserts that the target's `length` property is strictly (`===`) equal to `0`.
            $Err.addProperty('empty', function() {
                var val = Static.flag(this, 'object'),
                    flagMsg = Static.flag(this, 'message'),
                    itemsCount;
                flagMsg = flagMsg ? flagMsg + ': ' : '';
                switch ((typeof val).toLowerCase()) {
                    case 'array': case 'string': itemsCount = val.length; break;
                    case 'map': case 'set': itemsCount = val.size; break;
                    case 'weakmap': case 'weakset':
                        throw Core.Error(flagMsg + '.empty was passed a weak collection');
                    case 'function':
                        var msg = flagMsg + '.empty was passed a function';
                        throw Core.Error(msg.trim());
                    default:
                        if (val !== Object(val)) {
                            throw Core.Error(flagMsg + '.empty was passed non-string primitive ' + Static.inspect(val));
                        }
                        itemsCount = Object.keys(val).length;
                }
                this.assert(itemsCount === 0, 'expected #{this} to be empty', 'expected #{this} not to be empty');
            });
            // Asserts that the target is an `arguments` object.
            $Err.addProperty(['arguments', 'Arguments'], function () {
                var obj = Static.flag(this, 'object'), type = typeof(obj);
                this.assert('Arguments' === type, 'expected #{this} to be arguments but got ' + type, 'expected #{this} to not be arguments'
                );
            });
            // Asserts that the target is deeply equal to the given `obj`. 
            $Err.addMethod(['eql', 'eqls'], function (obj, msg) {
                if (msg) { Static.flag(this, 'message', msg); }
                this.assert(
                    _.isEqual(obj, Static.flag(this, 'object')), 'expected #{this} to deeply equal #{exp}', 'expected #{this} to not deeply equal #{exp}', obj, this._obj, true
                );
            });
            // Asserts that the target is strictly (`===`) equal to the given `val`.
            $Err.addMethod(['equal', 'equals', 'eq'], function (val, msg) {
                if (msg) { Static.flag(this, 'message', msg); }
                var obj = Static.flag(this, 'object');
                if (Static.flag(this, 'deep')) {
                    this.eql(val);
                } else {
                    this.assert(val === obj, 'expected #{this} to equal #{exp}', 'expected #{this} to not equal #{exp}', val, this._obj, true);
                }
            });
            // Asserts that the target is a number or a date greater than the given number or date `n` respectively. However, it's often best to assert that the target is equal to its expected value.
            $Err.addMethod(['above', 'gt', 'greaterThan'], function (n, msg) {
                if (msg) { Static.flag(this, 'message', msg); }
                var obj = Static.flag(this, 'object'),
                    doLength = Static.flag(this, 'doLength'),
                    flagMsg = Static.flag(this, 'message'),
                    msgPrefix = ((flagMsg) ? flagMsg + ': ' : ''),
                    objType = typeof(obj).toLowerCase(),
                    nType = typeof(n).toLowerCase(),
                    errorMessage, shouldThrow = true;
        
                if (doLength && objType !== 'map' && objType !== 'set') {
                    new $Err(obj, flagMsg).to.have.property('length');
                }
        
                if (!doLength && (objType === 'date' && nType !== 'date')) {
                    errorMessage = msgPrefix + 'the argument to above must be a date';
                } else if (nType !== 'number' && (doLength || objType === 'number')) {
                    errorMessage = msgPrefix + 'the argument to above must be a number';
                } else if (!doLength && (objType !== 'date' && objType !== 'number')) {
                    var printObj = (objType === 'string') ? "'" + obj + "'" : obj;
                    errorMessage = msgPrefix + 'expected ' + printObj + ' to be a number or a date';
                } else { shouldThrow = false; }
        
                if (shouldThrow) { throw Core.Error(errorMessage); }
                if (doLength) {
                    var descriptor = 'length', itemsCount;
                    if (objType === 'map' || objType === 'set') {
                        descriptor = 'size';
                        itemsCount = obj.size;
                    } else { itemsCount = obj.length; }
                    this.assert(
                        itemsCount > n, 'expected #{this} to have a ' + descriptor + ' above #{exp} but got #{act}', 'expected #{this} to not have a ' + descriptor + ' above #{exp}', n, itemsCount
                    );
                } else {
                    this.assert(obj > n, 'expected #{this} to be above #{exp}', 'expected #{this} to be at most #{exp}', n);
                }
            });
            // Asserts that the target is a number or a date greater than or equal to the given number or date `n` respectively. However, it's often best to assert that the target is equal to its expected value.
            $Err.addMethod(['least', 'gte'], function (n, msg) {
                if (msg) { Static.flag(this, 'message', msg); }
                var obj = Static.flag(this, 'object'),
                    doLength = Static.flag(this, 'doLength'),
                    flagMsg = Static.flag(this, 'message'),
                    msgPrefix = ((flagMsg) ? flagMsg + ': ' : ''),
                    objType = typeof(obj).toLowerCase(),
                    nType = typeof(n).toLowerCase(),
                    errorMessage, shouldThrow = true;
        
                if (doLength && objType !== 'map' && objType !== 'set') {
                    new $Err(obj, flagMsg).to.have.property('length');
                }
        
                if (!doLength && (objType === 'date' && nType !== 'date')) {
                    errorMessage = msgPrefix + 'the argument to least must be a date';
                } else if (nType !== 'number' && (doLength || objType === 'number')) {
                    errorMessage = msgPrefix + 'the argument to least must be a number';
                } else if (!doLength && (objType !== 'date' && objType !== 'number')) {
                    var printObj = (objType === 'string') ? "'" + obj + "'" : obj;
                    errorMessage = msgPrefix + 'expected ' + printObj + ' to be a number or a date';
                } else { shouldThrow = false; }
        
                if (shouldThrow) { throw Core.Error(errorMessage); }
                if (doLength) {
                    var descriptor = 'length', itemsCount;
                    if (objType === 'map' || objType === 'set') {
                        descriptor = 'size';  itemsCount = obj.size;
                    } else { itemsCount = obj.length; }
                    this.assert(itemsCount >= n, 'expected #{this} to have a ' + descriptor + ' at least #{exp} but got #{act}', 'expected #{this} to have a ' + descriptor + ' below #{exp}', n, itemsCount);
                } else {
                    this.assert(
                        obj >= n, 'expected #{this} to be at least #{exp}', 'expected #{this} to be below #{exp}', n
                    );
                }
            });
            // Asserts that the target is a number or a date less than the given number or date `n` respectively. However, it's often best to assert that the target is equal to its expected value.
            $Err.addMethod(['below', 'lt', 'lessThan'], function (n, msg) {
                if (msg) { Static.flag(this, 'message', msg); }
                var obj = Static.flag(this, 'object'),
                    doLength = Static.flag(this, 'doLength'),
                    flagMsg = Static.flag(this, 'message'),
                    msgPrefix = ((flagMsg) ? flagMsg + ': ' : ''),
                    objType = typeof(obj).toLowerCase(),
                    nType = typeof(n).toLowerCase(),
                    errorMessage, shouldThrow = true;
        
                if (doLength && objType !== 'map' && objType !== 'set') {
                    new $Err(obj, flagMsg).to.have.property('length');
                }
        
                if (!doLength && (objType === 'date' && nType !== 'date')) {
                    errorMessage = msgPrefix + 'the argument to below must be a date';
                } else if (nType !== 'number' && (doLength || objType === 'number')) {
                    errorMessage = msgPrefix + 'the argument to below must be a number';
                } else if (!doLength && (objType !== 'date' && objType !== 'number')) {
                    var printObj = (objType === 'string') ? "'" + obj + "'" : obj;
                    errorMessage = msgPrefix + 'expected ' + printObj + ' to be a number or a date';
                } else { shouldThrow = false; }
        
                if (shouldThrow) { throw new Core.Error(errorMessage); }
                if (doLength) {
                    var descriptor = 'length', itemsCount;
                    if (objType === 'map' || objType === 'set') {
                        descriptor = 'size'; itemsCount = obj.size;
                    } else { itemsCount = obj.length; }
                    this.assert(itemsCount < n, 'expected #{this} to have a ' + descriptor + ' below #{exp} but got #{act}', 'expected #{this} to not have a ' + descriptor + ' below #{exp}', n, itemsCount);
                } else {
                    this.assert(obj < n, 'expected #{this} to be below #{exp}', 'expected #{this} to be at least #{exp}', n);
                }
            });
            // Asserts that the target is a number or a date less than or equal to the given number or date `n` respectively. However, it's often best to assert that the target is equal to its expected value.
            $Err.addMethod(['most', 'lte'], function (n, msg) {
                if (msg) { Static.flag(this, 'message', msg); }
                var obj = Static.flag(this, 'object'),
                    doLength = Static.flag(this, 'doLength'),
                    flagMsg = Static.flag(this, 'message'),
                    msgPrefix = ((flagMsg) ? flagMsg + ': ' : ''),
                    objType = typeof(obj).toLowerCase(),
                    nType = typeof(n).toLowerCase(),
                    errorMessage, shouldThrow = true;
        
                if (doLength && objType !== 'map' && objType !== 'set') {
                    new $Err(obj, flagMsg).to.have.property('length');
                }
        
                if (!doLength && (objType === 'date' && nType !== 'date')) {
                    errorMessage = msgPrefix + 'the argument to most must be a date';
                } else if (nType !== 'number' && (doLength || objType === 'number')) {
                    errorMessage = msgPrefix + 'the argument to most must be a number';
                } else if (!doLength && (objType !== 'date' && objType !== 'number')) {
                    var printObj = (objType === 'string') ? "'" + obj + "'" : obj;
                    errorMessage = msgPrefix + 'expected ' + printObj + ' to be a number or a date';
                } else { shouldThrow = false; }
        
                if (shouldThrow) { throw new Core.Error(errorMessage); }
                if (doLength) {
                    var descriptor = 'length', itemsCount;
                    if (objType === 'map' || objType === 'set') {
                        descriptor = 'size'; itemsCount = obj.size;
                    } else { itemsCount = obj.length; }
                    this.assert(itemsCount <= n, 'expected #{this} to have a ' + descriptor + ' at most #{exp} but got #{act}', 'expected #{this} to have a ' + descriptor + ' above #{exp}', n, itemsCount);
                } else {
                    this.assert(obj <= n, 'expected #{this} to be at most #{exp}', 'expected #{this} to be above #{exp}', n);
                }
            });
            // Asserts that the target is a number or a date greater than or equal to the given number or date `start`, and less than or equal to the given number or date `finish` respectively. However, it's often best to assert that the target is equal to its expected value.
            $Err.addMethod('within', function(start, finish, msg) {
                if (msg) { Static.flag(this, 'message', msg); }
                var obj = Static.flag(this, 'object'),
                    doLength = Static.flag(this, 'doLength'),
                    flagMsg = Static.flag(this, 'message'),
                    msgPrefix = ((flagMsg) ? flagMsg + ': ' : ''),
                    objType = typeof(obj).toLowerCase(),
                    startType = typeof(start).toLowerCase(),
                    finishType = typeof(finish).toLowerCase(),
                    errorMessage, shouldThrow = true,
                    range = (startType === 'date' && finishType === 'date') ?
                    start.toUTCString() + '..' + finish.toUTCString() :
                    start + '..' + finish;
        
                if (doLength && objType !== 'map' && objType !== 'set') {
                    new $Err(obj, flagMsg).to.have.property('length');
                }
        
                if (!doLength && (objType === 'date' && (startType !== 'date' || finishType !== 'date'))) {
                    errorMessage = msgPrefix + 'the arguments to within must be dates';
                } else if ((startType !== 'number' || finishType !== 'number') && (doLength || objType === 'number')) {
                    errorMessage = msgPrefix + 'the arguments to within must be numbers';
                } else if (!doLength && (objType !== 'date' && objType !== 'number')) {
                    var printObj = (objType === 'string') ? "'" + obj + "'" : obj;
                    errorMessage = msgPrefix + 'expected ' + printObj + ' to be a number or a date';
                } else { shouldThrow = false; }
        
                if (shouldThrow) { throw new Core.Error(errorMessage); }
                if (doLength) {
                    var descriptor = 'length', itemsCount;
                    if (objType === 'map' || objType === 'set') {
                        descriptor = 'size'; itemsCount = obj.size;
                    } else { itemsCount = obj.length; }
                    this.assert(itemsCount >= start && itemsCount <= finish, 'expected #{this} to have a ' + descriptor + ' within ' + range, 'expected #{this} to not have a ' + descriptor + ' within ' + range);
                } else {
                    this.assert(obj >= start && obj <= finish, 'expected #{this} to be within ' + range, 'expected #{this} to not be within ' + range);
                }
            });
            // Asserts that the target is an instance of the given `constructor`.
            $Err.addMethod(['instanceof', 'instanceOf'], function (constructor, msg) {
                if (msg) { Static.flag(this, 'message', msg); }
                var target = Static.flag(this, 'object');
                var flagMsg = Static.flag(this, 'message');
                var isInstanceOf;
        
                try { isInstanceOf = target instanceof constructor; } 
                catch (err) {
                    if (err instanceof TypeError) {
                        flagMsg = flagMsg ? flagMsg + ': ' : '';
                        throw flagMsg + 'The instanceof assertion needs a constructor but ' +
                            typeof(constructor) + ' was given.';
                    }
                    throw err;
                }
                this.assert(
                    isInstanceOf, 'expected #{this} to be an instance of an unnamed constructor, expected #{this} to not be an instance of an unnamed constructor'
                );
            });
            // Asserts that the target has a property with the given key `name`.
            $Err.addMethod('property', assertProperty = function (name, val, msg) {
                if (msg) { Static.flag(this, 'message', msg); }
                var isNested = Static.flag(this, 'nested'),
                    isOwn = Static.flag(this, 'own'),
                    flagMsg = Static.flag(this, 'message'),
                    obj = Static.flag(this, 'object'), 
                    nameType = typeof name;
                flagMsg = flagMsg ? flagMsg + ': ' : '';
                if (isNested) {
                    if (nameType !== 'string') {
                        throw Core.Error(flagMsg + 'the argument to property must be a string when using nested syntax');
                    }
                } else {
                    if (nameType !== 'string' && nameType !== 'number' && nameType !== 'symbol') {
                        throw Core.Error(flagMsg + 'the argument to property must be a string, number, or symbol');
                    }
                }
        
                if (isNested && isOwn) {
                    throw Core.Error(flagMsg + 'The "nested" and "own" flags cannot be combined.');
                }
                if (obj === null || obj === undefined) {
                    throw Core.Error(flagMsg + 'Target cannot be null or undefined.');
                }
                var isDeep = Static.flag(this, 'deep'),
                    negate = Static.flag(this, 'negate'),
                    pathInfo = isNested ? Util.path(obj, name) : null,
                    value = isNested ? pathInfo : obj[name];
                var descriptor = '';
                if (isDeep) { descriptor += 'deep '; }
                if (isOwn) { descriptor += 'own '; }
                if (isNested) { descriptor += 'nested '; }
                descriptor += 'property ';
                
                var hasProperty;
                if (isOwn) { hasProperty = Object.prototype.hasOwnProperty.call(obj, name); }
                else if (isNested) { hasProperty = $in.isDef(pathInfo); }
                else { hasProperty = _.has(obj, name); }
        
                // When performing a negated assertion for both name and val, merely having
                // a property with the given name isn't enough to cause the assertion to
                // fail. It must both have a property with the given name, and the value of
                // that property must equal the given val. Therefore, skip this assertion in
                // favor of the next.
                if (!negate || arguments.length === 1) {
                    this.assert(hasProperty, 'expected #{this} to have ' + descriptor + Static.inspect(name), 'expected #{this} to not have ' + descriptor + Static.inspect(name));
                }
        
                if (arguments.length > 1) {
                    this.assert(hasProperty && (isDeep ? _.isEqual(val, value) : val === value), 'expected #{this} to have ' + descriptor + Static.inspect(name) + ' of #{exp}, but got #{act}', 'expected #{this} to not have ' + descriptor + Static.inspect(name) + ' of #{act}', val, value);
                }
                Static.flag(this, 'object', value);
            });
            $Err.addMethod(['ownProperty', 'haveOwnProperty'], function (name, value, msg) {
                Static.flag(this, 'own', true);
                assertProperty.apply(this, arguments);
            });
            // Asserts that the target has its own property descriptor with the given key `name`. Enumerable and non-enumerable properties are included in the search.
            $Err.addMethod(['ownPropertyDescriptor', 'haveOwnPropertyDescriptor'], function (name, descriptor, msg) {
                if (typeof descriptor === 'string') {
                    msg = descriptor;
                    descriptor = null;
                }
                if (msg) { Static.flag(this, 'message', msg); }
                var obj = Static.flag(this, 'object');
                var actualDescriptor = Object.getOwnPropertyDescriptor(Object(obj), name);
                if (actualDescriptor && descriptor) {
                    this.assert(
                        _.isEqual(descriptor, actualDescriptor), 'expected the own property descriptor for ' + Static.inspect(name) + ' on #{this} to match ' + Static.inspect(descriptor) + ', got ' + Static.inspect(actualDescriptor), 'expected the own property descriptor for ' + Static.inspect(name) + ' on #{this} to not match ' + Static.inspect(descriptor), descriptor, actualDescriptor, true
                    );
                } else {
                    this.assert(
                        actualDescriptor, 'expected #{this} to have an own property descriptor for ' + Static.inspect(name), 'expected #{this} to not have an own property descriptor for ' + Static.inspect(name)
                    );
                }
                Static.flag(this, 'object', actualDescriptor);
            });
            // Asserts that the target's `length` or `size` is equal to the given number `n`.
            $Err.addChainableMethod(['length', 'lengthOf'], function (n, msg) {
                    n = Number(n);
                    if (msg) { Static.flag(this, 'message', msg); }
                    var obj = Static.flag(this, 'object'),
                        objType = typeof(obj).toLowerCase(),
                        flagMsg = Static.flag(this, 'message'),
                        descriptor = 'length', itemsCount;
                    switch (objType) {
                        case 'map':
                        case 'set':
                            descriptor = 'size';
                            itemsCount = obj.size;
                        break;
                        default:
                            new $Err(obj, flagMsg).to.have.property('length');
                            itemsCount = obj.length;
                    }
                    this.assert(itemsCount === n, 'expected #{this} to have a ' + descriptor + ' of #{exp} but got #{act}', 'expected #{this} to not have a ' + descriptor + ' of #{act}', n, itemsCount
                    );
                }, 
                function () {
                    Static.flag(this, 'doLength', true);
                });
            // Asserts that the target matches the given regular expression `re`.
            $Err.addMethod(['match', 'matches'], function (re, msg) {
                if (msg) { Static.flag(this, 'message', msg); }
                var obj = Static.flag(this, 'object');
                this.assert(
                    re.exec(obj), 'expected #{this} to match ' + re, 'expected #{this} not to match ' + re
                );
            });
            // Asserts that the target string contains the given substring `str`.
            $Err.addMethod(['substr', 'substring'], function(str, msg) {
                if (msg) { Static.flag(this, 'message', msg); }
                var obj = Static.flag(this, 'object'),
                    flagMsg = Static.flag(this, 'message');
                new $Err(obj, flagMsg).is.a('string');
                this.assert(~obj.indexOf(str), 'expected #{this} to contain ' + Static.inspect(str), 'expected #{this} to not contain ' + Static.inspect(str));
            });
            // Asserts that the target object, array, map, or set has the given keys. Only the target's own inherited properties are included in the search. When the target is an object or array, keys can be provided as one or more string arguments, a single array argument, or a single object argument. In the latter case, only the keys in the given object matter; the values are ignored.
            $Err.addMethod(['keys', 'key'], function (keys) {
                var obj = Static.flag(this, 'object'),
                    objType = typeof(obj), keysType = typeof(keys),
                    isDeep = Static.flag(this, 'deep'),
                    str, deepStr = '', actual, ok = true,
                    flagMsg = Static.flag(this, 'message');
                flagMsg = flagMsg ? flagMsg + ': ' : '';
                var mixedArgsMsg = flagMsg + 'when testing keys against an object or an array you must give a single Array|Object|String argument or multiple String arguments';
                if (objType === 'Map' || objType === 'Set') {
                    deepStr = isDeep ? 'deeply ' : '';
                    actual = [];
                    // Map and Set '.keys' aren't supported in IE 11. Therefore, use .forEach.
                    obj.forEach(function(val, key) { actual.push(key); });
                    if (keysType !== 'Array') {
                        keys = Array.prototype.slice.call(arguments);
                    }
                } else {
                    actual = _.keys(obj).concat(
                        Object.getOwnPropertySymbols(obj).filter(function (sym) {
                            return Object.getOwnPropertyDescriptor(obj, sym).enumerable;
                        }));
                    switch (keysType) {
                        case 'Array':
                            if (arguments.length > 1) 
                                { throw Core.Error(mixedArgsMsg); }
                        break;
                        case 'Object':
                            if (arguments.length > 1) 
                                { throw Core.Error(mixedArgsMsg); }
                            keys = Object.keys(keys);
                        break;
                        default: keys = Util.args(arguments);
                    }
        
                    // Only stringify non-Symbols because Symbols would become "Symbol()"
                    keys = keys.map(function(val) {
                        return Fn('v', "return typeof v === 'symbol' ? v : String(v)") (val);
                    });
                }
        
                if (!keys.length) { throw Core.Error(flagMsg + 'keys to find are missing.'); }
                var len = keys.length, any = Static.flag(this, 'any'),
                    all = Static.flag(this, 'all'), expected = keys;
                if (!any && !all) { all = true; }
                // Has any
                if (any) {
                    ok = expected.some(function(expectedKey) {
                        return actual.some(function(actualKey) {
                            if (isDeep) {
                                return _.isEqual(expectedKey, actualKey);
                            } else { return expectedKey === actualKey; }
                        });
                    });
                }
        
                // Has all
                if (all) {
                    ok = expected.every(function(expectedKey) {
                        return actual.some(function(actualKey) {
                            if (isDeep) {
                                return _.isEqual(expectedKey, actualKey);
                            } else { return expectedKey === actualKey; }
                        });
                    });
                    if (!Static.flag(this, 'contains')) 
                        { ok = ok && keys.length === actual.length; }
                }
        
                // Key string
                if (len > 1) {
                    keys = keys.map(function(_key) { return Static.inspect(_key); });
                    var last = keys.pop();
                    if (all) { str = keys.join(', ') + ', and ' + last; }
                    if (any) { str = keys.join(', ') + ', or ' + last; }
                } else { str = Static.inspect(keys[0]); }
        
                // Form
                str = (len > 1 ? 'keys ' : 'key ') + str;
                // Have / include
                str = (Static.flag(this, 'contains') ? 'contain ' : 'have ') + str;
                // Assertion
                this.assert(ok, 'expected #{this} to ' + deepStr + str, 'expected #{this} to not ' + deepStr + str, expected.slice(0).sort(_.compareByInspect), actual.sort(_.compareByInspect), true);
            });
            // When the target is a non-function object, `.respondTo` asserts that the target has a method with the given name `method`. The method can be own or inherited, and it can be enumerable or non-enumerable.
            $Err.addMethod(['respondTo', 'respondsTo'], function (method, msg) {
                if (msg) { Static.flag(this, 'message', msg); }
                var obj = Static.flag(this, 'object'),
                    itself = Static.flag(this, 'itself'),
                    context = ('function' === typeof obj && !itself) ?
                    obj.prototype[method] : obj[method];
                this.assert(
                    'function' === typeof context, 'expected #{this} to respond to ' + Static.inspect(method), 'expected #{this} to not respond to ' + Static.inspect(method)
                );
            });
            // Forces all `.respondTo` assertions that follow in the chain to behave as if the target is a non-function object, even if it's a function. Thus, it causes `.respondTo` to assert that the target has a method with the given name, rather than asserting that the target's `prototype` property has a method with the given name.
            $Err.addProperty('itself', function() {
                Static.flag(this, 'itself', true);
            });
            // Invokes the given `matcher` function with the target being passed as the first argument, and asserts that the value returned is truthy.
            $Err.addMethod(['satisfy', 'satisfies'], function (matcher, msg) {
                if (msg) { Static.flag(this, 'message', msg); }
                var obj = Static.flag(this, 'object');
                var result = matcher(obj);
                this.assert(
                    result, 'expected #{this} to satisfy ' + _.objDisplay(matcher), 'expected #{this} to not satisfy' + _.objDisplay(matcher), Static.flag(this, 'negate') ? false : true, result
                );
            });
            // Asserts that the target is a number that's within a given +/- `delta` range of the given number `expected`. However, it's often best to assert that the target is equal to its expected value.
            $Err.addMethod(['closeTo', 'approximately'], function (expected, delta, msg) {
                if (msg) { Static.flag(this, 'message', msg); }
                var obj = Static.flag(this, 'object'),
                    flagMsg = Static.flag(this, 'message');
                new $Err(obj, flagMsg).is.a('number');
                if (typeof expected !== 'number' || typeof delta !== 'number') {
                    flagMsg = flagMsg ? flagMsg + ': ' : '';
                    throw Core.Error(flagMsg + 'the arguments to closeTo or approximately must be numbers');
                }
                this.assert(abs(obj - expected) <= delta, 'expected #{this} to be close to ' + expected + ' +/- ' + delta, 'expected #{this} not to be close to ' + expected + ' +/- ' + delta);
            });
            
            // Note: Duplicates are ignored if testing for inclusion instead of sameness.
            isSubsetOf = function (subset, superset, cmp, contains, ordered) {
                if (!contains) {
                    if (subset.length !== superset.length) { return false; }
                    superset = superset.slice();
                }
                return subset.every(function(elem, idx) {
                    if (ordered) { return cmp ? cmp(elem, superset[idx]) : elem === superset[idx]; }
                    if (!cmp) {
                        var matchIdx = superset.indexOf(elem);
                        if (matchIdx === -1) { return false; }
                        // Remove match from superset so not counted twice if duplicate in subset.
                        if (!contains) { superset.splice(matchIdx, 1); }
                        return true;
                    }
                    return superset.some(function(elem2, matchIdx) {
                        if (!cmp(elem, elem2)) { return false; }
                        // Remove match from superset so not counted twice if duplicate in subset.
                        if (!contains) { superset.splice(matchIdx, 1); }
                        return true;
                    });
                });
            };
            // Asserts that the target array has the same members as the given array `set`.
            $Err.addMethod('members', function(subset, msg) {
                if (msg) { Static.flag(this, 'message', msg); }
                var obj = Static.flag(this, 'object'),
                    flagMsg = Static.flag(this, 'message');
                new $Err(obj, flagMsg).to.be.an('array');
                new $Err(subset, flagMsg).to.be.an('array');
                var contains = Static.flag(this, 'contains');
                var ordered = Static.flag(this, 'ordered');
                var subject, failMsg, failNegateMsg;
                if (contains) {
                    subject = ordered ? 'an ordered superset' : 'a superset';
                    failMsg = 'expected #{this} to be ' + subject + ' of #{exp}';
                    failNegateMsg = 'expected #{this} to not be ' + subject + ' of #{exp}';
                } else {
                    subject = ordered ? 'ordered members' : 'members';
                    failMsg = 'expected #{this} to have the same ' + subject + ' as #{exp}';
                    failNegateMsg = 'expected #{this} to not have the same ' + subject + ' as #{exp}';
                }
                var cmp = Static.flag(this, 'deep') ? _.isEqual : undefined;
                this.assert(isSubsetOf(subset, obj, cmp, contains, ordered), failMsg, failNegateMsg, subset, obj, true);
            });
            // Asserts that the target is a member of the given array `list`. However, it's often best to assert that the target is equal to its expected value.
            $Err.addMethod('oneOf', function (list, msg) {
                if (msg) { Static.flag(this, 'message', msg); }
                var expected = Static.flag(this, 'object'),
                    flagMsg = Static.flag(this, 'message');
                new $Err(list, flagMsg).to.be.an('array');
                this.assert(list.indexOf(expected) > -1, 'expected #{this} to be one of #{exp}', 'expected #{this} to not be one of #{exp}', list, expected);
            });
            // When one argument is provided, `.change` asserts that the given function `subject` returns a different value when it's invoked before the target function compared to when it's invoked afterward. However, it's often best to assert that `subject` is equal to its expected value.
            $Err.addMethod(['change', 'changes'], function (subject, prop, msg) {
                if (msg) { Static.flag(this, 'message', msg); }
                var fn = Static.flag(this, 'object'),
                    flagMsg = Static.flag(this, 'message');
                var initial;
                new $Err(fn, flagMsg).is.a('function');
                if (!prop) {
                    new $Err(subject, flagMsg).is.a('function');
                    initial = subject();
                } else {
                    new $Err(subject, flagMsg).to.have.property(prop);
                    initial = subject[prop];
                }
                fn();
                var final = prop === undefined || prop === null ? subject() : subject[prop];
                var msgObj = prop === undefined || prop === null ? initial : '.' + prop;
                // This gets flagged because of the .by(delta) assertion
                Static.flag(this, 'deltaMsgObj', msgObj);
                Static.flag(this, 'initialDeltaValue', initial);
                Static.flag(this, 'finalDeltaValue', final);
                Static.flag(this, 'deltaBehavior', 'change');
                Static.flag(this, 'realDelta', final !== initial);
                this.assert(initial !== final, 'expected ' + msgObj + ' to change', 'expected ' + msgObj + ' to not change');
            });
            // When one argument is provided, `.increase` asserts that the given function `subject` returns a greater number when it's invoked after invoking the target function compared to when it's invoked beforehand. `.increase` also causes all `.by` assertions that follow in the chain to assert how much greater of a number is returned. It's often best to assert that the return value increased by the expected amount, rather than asserting it increased by any amount.
            $Err.addMethod(['increase', 'increases'], function (subject, prop, msg) {
                if (msg) { Static.flag(this, 'message', msg); }
                var fn = Static.flag(this, 'object'),
                    flagMsg = Static.flag(this, 'message');
                var initial;
                new $Err(fn, flagMsg).is.a('function');
                if (!prop) {
                    new $Err(subject, flagMsg).is.a('function');
                    initial = subject();
                } else {
                    new $Err(subject, flagMsg).to.have.property(prop);
                    initial = subject[prop];
                }
                // Make sure that the target is a number
                new $Err(initial, flagMsg).is.a('number'); fn();
                var final = prop === undefined || prop === null ? subject() : subject[prop];
                var msgObj = prop === undefined || prop === null ? initial : '.' + prop;
                Static.flag(this, 'deltaMsgObj', msgObj);
                Static.flag(this, 'initialDeltaValue', initial);
                Static.flag(this, 'finalDeltaValue', final);
                Static.flag(this, 'deltaBehavior', 'increase');
                Static.flag(this, 'realDelta', final - initial);
                this.assert(final - initial > 0, 'expected ' + msgObj + ' to increase', 'expected ' + msgObj + ' to not increase');
            });
            // When one argument is provided, `.decrease` asserts that the given function `subject` returns a lesser number when it's invoked after invoking the target function compared to when it's invoked beforehand. `.decrease` also causes all `.by` assertions that follow in the chain to assert how much lesser of a number is returned. It's often best to assert that the return value decreased by the expected amount, rather than asserting it decreased by any amount.
            $Err.addMethod(['decrease', 'decreases'], function (subject, prop, msg) {
                if (msg) { Static.flag(this, 'message', msg); }
                var fn = Static.flag(this, 'object'),
                    flagMsg = Static.flag(this, 'message');
                var initial;
                new $Err(fn, flagMsg).is.a('function');
                if (!prop) {
                    new $Err(subject, flagMsg).is.a('function');
                    initial = subject();
                } else {
                    new $Err(subject, flagMsg).to.have.property(prop);
                    initial = subject[prop];
                }
                // Make sure that the target is a number
                new $Err(initial, flagMsg).is.a('number'); fn();
                var final = prop === undefined || prop === null ? subject() : subject[prop];
                var msgObj = prop === undefined || prop === null ? initial : '.' + prop;
                Static.flag(this, 'deltaMsgObj', msgObj);
                Static.flag(this, 'initialDeltaValue', initial);
                Static.flag(this, 'finalDeltaValue', final);
                Static.flag(this, 'deltaBehavior', 'decrease');
                Static.flag(this, 'realDelta', initial - final);
                this.assert(final - initial < 0, 'expected ' + msgObj + ' to decrease', 'expected ' + msgObj + ' to not decrease');
            });
            // When following an `.increase` assertion in the chain, `.by` asserts that the subject of the `.increase` assertion increased by the given `delta`.
            $Err.addMethod('by', function (delta, msg) {
                if (msg) { Static.flag(this, 'message', msg); }
                var msgObj = Static.flag(this, 'deltaMsgObj');
                var initial = Static.flag(this, 'initialDeltaValue');
                var final = Static.flag(this, 'finalDeltaValue');
                var behavior = Static.flag(this, 'deltaBehavior');
                var realDelta = Static.flag(this, 'realDelta');
                var expression;
                if (behavior === 'change') {
                    expression = Math.abs(final - initial) === Math.abs(delta);
                } else { expression = realDelta === Math.abs(delta); }
                this.assert(
                    expression, 'expected ' + msgObj + ' to ' + behavior + ' by ' + delta, 'expected ' + msgObj + ' to not ' + behavior + ' by ' + delta
                );
            });
            // Asserts that the target is a number, and isn't `NaN` or positive/negative `Infinity`.
            $Err.addProperty('finite', function(msg) {
                var obj = Static.flag(this, 'object');
                this.assert(typeof obj === 'number' && isFinite(obj), 'expected #{this} to be a finite number', 'expected #{this} to not be a finite number');
            });
        }) ();
        return $Err;
    });
})(); // Error
(function() {
    // Inertia's Animate Module V2 [www.khanacademy.org/cs/_/--]
    Define("Animate", function() {
        var Util = require("Util"), _ = Util._, Class = require("Class"),
            Default, Event = require("Event"), Fn = require("Func"), AnimArr,
            $Math = require("Math"), Ease = require("Ease");
            
        // List of Animate Objects
        AnimArr = [];
        
        // Default Loops
        Default = {
            complete: Fn("cb", "return cb.call(this)"),
            progress: Fn("x", "return x")
        };
        
        var _prevTime = Date.now(), _time, _delta; // Temp. variables
        Inertia.Event.on("draw", function () {
            _time = Date.now();
            _delta = _time - _prevTime;
        
            for (var i = 0; i < AnimArr.length; i++) {
                if (!AnimArr[i].completed) {
                    AnimArr[i](_delta, Date.now() - AnimArr[i].start_time);
                } 
            }
            _prevTime = _time;
        });

        // Animate Object [Based on Between.js - https://github.com/sasha240100/between.js]
        return Class(Event, {
            end: 0, start: 0, progress: 0,
            localTime: 0, duration: 1000,
            paused: false,
            loopFn: Default,
            loopMode: 'once',
            completed: false,
            ease: Fn("x", "return x"),
            init: function (strt, end) {
                this.value = _.isArray(strt) ? [].concat(strt) :
                        (_.isObject(strt) ? _.extend({}, strt) : strt);
                this.start = strt; this.end = end;
                this.start_time = Date.now();
                switch ((this.type = typeof strt)) {
                    case 'number':
                    case 'array':
                    case 'object':
                        this._updateValue = function (per) {
                            this.value = $Math.lerp(this.start, this.end, per);
                            return this;
                        };
                    break;
                    default:
                        this._updateValue = Fn("return null");
                        println('Animate: Start Value type was unrecognized.');
                }
            
                AnimArr.push(this.update.call(this));
            },
            
            isPaused: Class.get("paused"),
            easing: function (eas) {
                this.ease = _.isString(eas) || _.isArray(eas) ?
                    Ease.fn[eas.toString().toLowerCase()] || Ease.bezier(eas) : eas;
                return this;
            },
            time: Fn("dur", "this.duration = dur; return this"),
            pause: function () {
                this.emit('pause', this.value, this, _delta);
                this.paused = true;
                return this;
            },
            play: function () {
                this.emit('play', this.value, this, _delta);
                this.paused = false;
                return this;
            },
            reset: Fn("this.completed = false; this.localTime = 0; return this;"),
            restart: Fn("this.reset().play(); return this;"),
            toggle: Fn("this.paused = !this.paused; return this;"),
            loop: function (mode, args) {
                mode = mode || 'once'; args = Util.args(args || [], 1);
                var loopFnName = "__loop_" + mode;
        
                this.loopFn = loopFnName in this ?
                    _.extend({}, Default, this[loopFnName].apply(this, args)) :
                    Default;
                return this;
            },
            set: function (val) {
                this.localTime = (val || 0) * this.duration; 
                this._updateValue(this.ease( // Progress
                    this.progress = this.loopFn.progress(
                        Math.min(1, this.localTime / this.duration)
                    )
                ));
                this.completed = false; 
                return this;
            },
            update: function () {
                return function (delta, time) {
                    var prog;
                    if (!this.completed && !this.paused) { 
                        if (this.localTime === 0) {
                            this.emit('start', this.value, this);
                        }
                        
                        this._updateValue(this.ease( // Progress
                            this.progress = this.loopFn.progress(
                                Math.min(1, (time || this.localTime) / this.duration)
                            )
                        ));
                        
                        this.emit('update', this.value, this, delta);
                        if (this.localTime >= this.duration) {
                            this.loopFn.complete.call(this, function () {
                                this.completed = true;
                                this.emit('complete', this.value, this);
                            });
                        }
                        this.localTime += delta;
                    }
                }.bind(this);
            },
        
            __loop_repeat: function (times) {
                var maxTimes = times; this.times = 0;
                return {
                    complete: function (callback) {
                        this.localTime = 0;
                        if (Number.isInteger(maxTimes) &&
                            ++this.times === maxTimes) { callback.call(this); }
                        else if (!Number.isInteger(maxTimes))
                            { ++this.times; }
                    }.bind(this)
                };
            },
            
            __loop_bounce: function (times) {
                var maxTimes = times, bounceDir = 1;
                this.times = 0;
                return {
                    complete: function (callback) {
                        this.localTime = 0; bounceDir = -bounceDir;
                        if (Number.isInteger(maxTimes) &&
                            ++this.times === maxTimes) { callback.call(this); }
                        else if (!Number.isInteger(maxTimes))
                            { ++this.times; }
                    }.bind(this),
                    progress: function (x)
                        { return bounceDir > 0 ? x : 1 - x; },
                };
            },
        })
        
        .static({
            new: function ()
                { return Fn.new(this, arguments); },
            default: Default
        });
    });
})(); // Animate