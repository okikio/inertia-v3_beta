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