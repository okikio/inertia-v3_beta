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