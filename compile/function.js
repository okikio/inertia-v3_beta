/** -- Development Workspace -- [www.khanacademy.org/cs/_/4760822004088832] **/
var Inertia = {}, $in, Define, require; // Inertia Entry Point
// Module System V2 [www.khanacademy.org/cs/_/5049435683323904]
(function() {
    $in = Inertia; // Inertia Shortform
    Inertia.$Modules = {}; // Cache / List of all Modules
    Inertia.$req = Inertia.$Required = []; // All Modules Required
    
    // All Unused Modules
    Inertia.$Unused = Inertia.$unused = [];
    
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
        // Store unused modules
        $in.$unused.push(multi ? paths : [paths]);
        $in.$unused = $in.$unused.map(function (arr) {
            return arr.reduce(function (acc, val, i) {
                if (val.indexOf(".") < 0 || val.length === 1) {
                    acc = acc.concat(val);
                }
                return acc;
            }, []);
        });
        
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
            // When a module is accessed it is removed from the unused Array
            $in.$unused.forEach(function (dep, i) {
                if (dep.indexOf(path) > -1) {
                    $in.$unused.splice(i, 1);
                }
            });
            
            return Find(toArray(path), Inertia.$Modules);
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
            // Map An Array to an Object
            MapArr: function(obj, $map, type) {
                var _ = Core.window("_"), result;
                
                // Iterate Map
                result = _.reduce($map, function(acc, arr) {
                    // Iteration of each Array
                    _.each((_.isArray(arr[0]) ? arr[0] : [arr[0]]), function(name) {
                        // Set [name] of the [obj] Object to the Array Function
                        acc[name] = type && _.isFunction(arr[1]) ? function() {
                            return arr[1].apply(this, [this]
                                    .concat(Array.from(arguments)));
                        } : arr[1];
                    });
                    return acc;
                }, {});
                
                return _.reduce(_.keys(result), function (acc, v) {
                    if (obj[v] === undefined) { acc[v] = result[v]; }
                    return acc;
                }, {});
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
                if (!_.isFunction(val) || 
                    _.keys(val.prototype || {}).length > 0) 
                    { return val; }
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
        _.extend(Native, MapFunc(Native, $Map));
        _.extend(Native.prototype, MapFunc(Native.prototype, $Map, true));
        return Native;
    }, true);
})(); // Function