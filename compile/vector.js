/** -- Development Workspace -- [www.khanacademy.org/cs/_/4760822004088832] **/
var Inertia = {}, $in, Define, require; // Inertia Entry Point
// Module System V2 [www.khanacademy.org/cs/_/5049435683323904]
(function() {
    $in = Inertia; // Inertia Shortform
    Inertia.$Modules = {}; // Cache / List of all Modules
    Inertia.$req = Inertia.$Required = []; // All Modules Required
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
                    try {
                        this.run();
                        if (this.complete) { this.readyFn(); return; } 
                        else { this.loadFn(); }
                        window.requestAnimationFrame(_draw);
                    } catch (e) { this.errFn(e); }
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
        var Util, Core = require("Core");
        
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
            MapArr: function(obj, type) {
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
        Util._.enumKeys = Util.enumKeys;
        Util._.isDefined = $in.isDef;
        Util._.isColor = function (val) {
            return !Util._.isUndefined(val) && (/^\#|^rgb|^hsl|^hsb/g.test(val) ||
                    (Util._.isArray(val) && Util._.isNumber(val[0])) ||
                        Util._.isNumber(val) || val.value);
        };
        return Util;
    });
        
    // Underscore specific functionality
    Define("_", function() { return require("Util._"); }); 
    Define("each", function() { return require("Util.each"); }); // Iterates Over Object's mulitiple times

    // Type Testing Functions
    Define(["is", "Util.is"], function() {
        var _ = require("_");
        // Type Check Functions
        return ['Symbol', 'Map', 'WeakMap', 'Set', 'WeakSet', 'Object', 'Array', 'Arguments', 'Function', 'String', 'Number', 'Boolean', 'Date', 'RegExp', 'Undefined', 'Null', 'Equal', 'Empty', 'Finite', 'NaN'].reduce(function(obj, name) {
            obj[name.toLowerCase()] = obj[name] = _[["is" + name]] ? 
                _[["is" + name]] : function(obj) {
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
        _.extend(Native, MapFunc($Map));
        _.extend(Native.prototype, MapFunc($Map, true));
        return Native;
    }, true);
})(); // Function
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