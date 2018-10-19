/** -- Development Workspace -- [www.khanacademy.org/cs/_/4760822004088832] **/
var Inertia = {}, $in, Define, require; // Inertia Entry Point
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
    Inertia.Async = (function () {
        var Async = function(rate) {
            this._class = "Async"; // Class Name
            this.tasks = []; this.indx = 0; // Tasks Array & Task Index
            this.loopThru = !(this.complete = false);
            this.rate = isDef(rate) ? rate : 500;
            this.prev = millis();
            this.progress = 0;
        };
    
        // Prototype in Object form
        Async.prototype = {
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
                this.rate = !isDef(rate) ? rate : 500;
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
                var _draw = function() {
                    this.run();
                    if (this.complete) { this.readyFn(); return; } 
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
    
    // Inertia Event Emit
    Inertia.EventEmitter = (function () {
        var _ = (0, eval) ("_"), EventEmitter;
        (EventEmitter = function () { })
            .prototype = {
                _class: "Event", // Set Class Name
                _eventCount: 0, _events: {}, // Event Info.
                
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
    
    // Inertia's Load Manager
    Inertia.Manager = new Inertia.Async();

    // A Base Global Event Emmitter
    (function() {
        var Emit;
        $in.Event = new $in.EventEmitter(); // Inertia Event
        draw = function() { $in.Event.emit("draw"); }; // Global Draw Event
        
        // Emit An Event
        Emit = function(evt, fn) {
            fn = fn || function() {};
            return function() {
                fn();
                try {
                    // jshint noarg: false
                    var arg = arguments.callee.caller.arguments;
                    $in.Event.emit
                        .apply(Inertia.Event, [evt, arg[0]]);
                } catch (e) { println(evt + " - " + e); }
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
        if ('ontouchstart' in (0, eval) ("this")) {
            touchCancel = Emit("onTouchCancel");
            touchStart = Emit("onTouchStart");
            touchMove = Emit("onTouchMove");
            touchEnd = Emit("onTouchEnd");
        } else {
            Inertia.Event.on("onMouseRelease", Emit("onTouchEnd"));
            Inertia.Event.on("onMousePress", Emit("onTouchStart"));
            Inertia.Event.on("onMouseDrag", Emit("onTouchMove"));
        }
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
            } else { return Define(paths, fn); }
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
        Core.window = function(prop) {
            return function() { return this[prop] || this; }();
        };

        // Cnavas Object
        Core.canvas = Core.PJS = Core.pjs = (function(prop) {
            setup = function() { return this; };
            return setup();
        })();

        Core.FUNCTION = Core.Func = Core.window("Function"); // Function Object
        Core.JSON = Core.Json = Core.window("JSON"); // Json Object
        Core.STRING = Core.String = Core.window("String"); // String Object
        Core.OBJECT = Core.Object = Core.window("Object"); // Object Object [Confusing Eh]
        Core.NUMBER = Core.Number = Core.window("Number"); // Number Object
        Core.ARRAY = Core.Array = Core.window("Number"); // Array Object
        Core.BOOLEAN = Core.Boolean = Core.window("Boolean"); // Boolean Object
        Core.MATH = Core.Math = Core.window("Math"); // Math Object
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
        var Util, Core = Inertia.require("Core");
        
        // Util Object
        Util = {
            _: Core.window("_"),
            each: Core.window("_").each,
            map: Core.window("_").map,

            // Pick between two value the defined Value
            pick: Core.Func('a', 'b', 'return a !== undefined ? a : b'),

            // Collect Functions Arguments into an Array
            args: function($this) {
                var restArg = [].slice.call(arguments, 1);
                return [].slice.apply($this, restArg);
            },

            // All Keys in Object
            allKeys: function(obj) {
                var _keys = [];
                if (!Util._.isObject(obj)) { return []; }
                for (var key in obj) { _keys.push(key); }
                return _keys;
            },

            // Map An Array to an Object
            MapArr: function(obj, type) {
                var result = {},
                    _ = Core.window("_");
                // Iterate Map
                _.each(obj, function(arr) {
                    // Iterate In Each Element Of the Array
                    _.each(arr, function(ele) {
                        // Iteration of each Array
                        _.each((_.isArray(ele) ? ele : [ele]), function(name) {
                            // Set [name] of the [obj] Object to the Array Function
                            result[name] = type && arr[1] ? function() {
                                return arr[1].apply(this, [this]
                                        .concat(Array.from(arguments)));
                            } : arr[1];

                            if (type && arr[1]) {
                                result[name].toString = arr[1].toString.bind(arr[1]);
                                result[name].valueOf = arr[1].valueOf.bind(arr[1]);
                            }
                        }, this);
                    }, this);
                }, this);

                return result;
            },

            // Find a value in an Object based on it's path
            path: function(obj, path, val) {
                path = Inertia.toArray(path);
                if (Inertia.isDef(val)) {
                    if (path.length > 1) {
                        Util.path(obj[path.shift()], path, val);
                    } else { obj[path[0]] = val; }
                    return val;
                } else {
                    path.forEach(function($val) { obj = obj[$val]; });
                }
                return obj;
            },

            // Create an Alias/Copy of a Static Method that can function as a Prototype Method
            alias: function(obj, chainable, notStatic) {
                var result = {}, _ = Core.window("_");
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
                        Core.Func('return ' + toStr() + '+"return this;";') : toStr;
                    result[i].valueOf = val.valueOf.bind(val);
                });
                return result;
            },

            // Take a Function as a Value
            FnVal: function(val, arg, ctxt) {
                if (!Util._.isFunction(val)) { return val; }
                return val.apply(ctxt, arg);
            }
        };
        
        Util._.allKeys = Util.allKeys;
        Util._.isDefined = function (val) {
            return !Util._.isUndefined(val);
        };
        Util._.isColor = function (val) {
            return !Util._.isUndefined(val) && (/^\#|^rgb|^hsl|^hsb/g.test(val) ||
                    (Util._.isArray(val) && Util._.isNumber(val[0])) ||
                        Util._.isNumber(val) || val.value);
        };
        
        // Underscore specific functionality
        Define("_", function() { return Util._; });
        // Iterates Over Object's mulitiple times
        Define("each", function() { return Util.each; });

        // Type Testing Functions
        Define(["is", "Util.is"], function() {
            // Type Check Functions
            return Util._.reduce(['Object', 'Array', 'Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp', 'Error', 'Undefined', 'Null', 'Equal', 'Empty', 'Match'], function(obj, name) {
                obj[name.toLowerCase()] = obj[name] = Util._[["is" + name]];
                return obj;
            }, {
                // Test if an Object is simmilar to an Array
                ArrayLike: function(obj) {
                    var len = Util._.isNumber(obj.length) && obj.length;
                    return len === 0 || len > 0 && (len - 1) in obj;
                }
            });
        }, true);
        return Util;
    });
})(); // Util
(function() {
    // Inertia's Function Module V2 [www.khanacademy.org/cs/_/5415663367127040]
    // Function Module adds to the Native Function Object
    Define(["Func", "Function", "Fn"], function() {
        var Util = require("Util"), $Map, MapFunc = Util.MapArr,
            _ = Util._, Native = require("Core.Func");

        // Map Of Names And Functions
        $Map = [
            [["args"], Util.args], // Turn the Arguments Object into an Array
            // A more efficient `new` keyword that allows for arrays to be passed as Arguments
            [["new"], Native("ctor", "args",
                "var F = function() { return ctor.apply(this, args); };" +
                "F.prototype = ctor.prototype;" +
                "return new F")],
            
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
                var $fn = fn.toString()
                    .replace(/__env__\./g, "")
                    .replace(/\s*KAInfiniteLoopC\ount/g, "")
                    .replace(/\+\+;/g, " ")
                    .replace(/if[^;]+[^}]+\}\s+/g, "");
                return $fn.replace(/\s/g, "").length <= 20 ? $fn.replace(/\s+}/, " }") : $fn;
            }]
        ];

        // Extend Methods
        _.extend(Native, MapFunc($Map));
        _.extend(Native.prototype, MapFunc($Map, true));
        return Native;
    }, true);
})(); // Function
(function() {
    // Object Module [all] the Native Object's with some additions
    // Inertia's Object Modules V2 [www.khanacademy.org/computer-programming/_/5993936052584448]
    Define("Object", function() {
        var Util = Inertia.require("Util"), args = Util.args, _ = Util._, $Map,
            MapFunc = Util.MapArr, $JSON = Inertia.require("Core.JSON"),
            Native = Inertia.require("Core.Object"), $indx = 0;

        // Map Of Names And Functions
        $Map = [
            [["map"], _.map], // Re-Map Element in an Object
            [["extend"], _.extend], // Extend Objects
            [["size"], _.size], // Total Number of Element in an Object
            [["keys"], _.keys], // List of keys in an Object
            [["allKeys"], Util.allKeys], // All Keys
            [["values"], _.values], // List of values in an Object
            [["filter"], _.filter], // Filter a List of values in an Object
            [["each", "forEach"], _.each], // Iterates Object mulitiple times

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
            [["str", "stringify"], function(obj) {
                var fns = [], json;
                try {
                    if (typeof obj !== "undefined") {
                        if (Object.isArrayLike(obj)) { return $JSON.stringify(obj); }
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
            [["new"], Native("ctor", "args",
                "var F = function() { return ctor.apply(this, args); };" +
                "F.prototype = ctor.prototype;" +
                "return new F")],

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
            }]
        ];

        // Extend Methods
        _.extend(Native, MapFunc($Map));
        _.extend(Native.prototype, MapFunc($Map, true));
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
        _.extend(Native, Number, MapFunc($Map));
        _.extend(Number.prototype, MapFunc($Map, true));
        return Native;
    });
})(); // Math
(function() {
    // Inertia's Class Module V2 [www.khanacademy.org/cs/_/5398825551822848]
    // Class Module acts like the ES6 `class` keyword replacement
    Define("Class", function() {
        var $Class, Util = require("Util"), _ = Util._,
            args = Util.args, Class, Static, Fn = require("Func");
        
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
                            typeof val === "object" && val.get ? val : { value: val });
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
                            typeof val === "object" && val.get ? val : { value: val });
                    }, this);
                }, this);
                return this;
            },

            // Set Alias's, Defaults or Backups for Objects
            Alias: function(obj) {
                return function() {
                    var result;
                    _.each(args(arguments).reverse(), function(val) {
                        if (!_.isUndefined(Util.path(obj, val.split(".")[0])))
                            { result = Util.path(obj, val); }
                    }, this);
                    return result;
                }.bind(this);
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

                    // Arguements
                    this._args = arguments;

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
        Class = Static.Create;
        _.extend(Class, Static);
        return Class;
    });
})(); // Class
(function() {
    // Inertia's Vector Module V2 [www.khanacademy.org/cs/_/5402431084593152]
    // PVector with Tweaks
    Define(["Math.Vector", "Vector", "vector", "vec"], function() {
        var Util = require("Util"), args = Util.args, Static, VFn, Obj,
            _ = Util._, Func = require("Core.Func"), VSolve,
            Class = require("Class"), Vector, QAlias,
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

        // Create A Quick Alias
        QAlias = function(path, method) {
            return function() {
                var Prop = Class.alias(Vector).apply(null, [path]);
                return !method ? Prop.apply(this, arguments) : Prop;
            };
        };

        // Vector Object
        Vector = Class({
            init: function () {
                this.set.apply(this, arguments);
            }
        })
        
        // Static Methods of the Vector Object
        .static(PVector, Static = {
            // Basic Vector Math
            add: VSolve(),
            sub: VSolve("-"),
            div: VSolve("/"),
            mod: VSolve("%"),
            mult: VSolve("*"),
            
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
            project: function (v) {
                return this.scale(this.dot(v) / v.magSq());
            },
    
            // Project this vector onto a vector of unit length
            projectN: function (v) {
                return this.mult(this.dot(v));
            },
            
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
            array: QAlias("arr"),
            
            // Get the Quadrant of Vector
            quad: function($this) {
                return $this.x >= 0 ? $this.y >= 0 ? 1 : 4 : $this.y >= 0 ? 2 : 3;
            },

            // Copy a Vector
            copy: function($this) { return new Vector($this); },
            get: QAlias("copy"),
            
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
        .method(Util.alias(PVector.prototype, Chain, true),
                Util.alias(Static));
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
        BounceIn = function (t) { return 1 - BounceOut(1 - t); };
        
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
        
        /*
            @Return [Function] - A Function that takes the `time`
                - @Param [Number] time - The Current `time` from 0 to 1
                - @Return [Number] - Contains a value from 0 to 1
            @Api Public
        */
        
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
            add: Class.get("on"),
            bind: Class.get("on"),
        
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
            clear: function () { 
                this._eventCount = 0; this._events = {};
            }
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
            Env = require("Core.Env"), Mouse = UIEvent("Mouse"),
            Emit, Prefix;
    
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
        Mouse.EventList = [];
    
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
            Key = UIEvent("Key"), _ = require("Util._"),
            Emit, Prefix, Special;
            
        // A Map of Special Keys & Characters with all Their Keys & Key Codes
        // Based on MouseTrap [https://github.com/ccampbell/mousetrap/blob/master/mousetrap.js]
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
        Key.EventList = [];
        
        // Special Keys
        Key.Key = Special.Key;
    
        // List of Keys Pressed as KeyCode or as a String
        Key.List = [].concat(Key.ListStr = []);
    
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
        Key.Equal = function (a, b, notcode) {
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
(function() {
    // Inertia's Async Module V2 [www.khanacademy.org/cs/_/4638346561486848]
    Define("Async", function () {
        var Class = require("Class");
        return Class($in.Async, {
            init: function (rate) {
                this.CallSuper("constructor", $in.isDef(rate) ? rate : 100);
                this.loopThru = true; 
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
                    this.run();
                    if (this.complete) { this.readyFn(); } 
                    else { this.loadFn(); }
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
    Define("Debug", function () {
        
    });
})(); // Debug