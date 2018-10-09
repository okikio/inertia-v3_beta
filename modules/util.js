
(function() {
    // Inertia's Util Modules V2 [www.khanacademy.org/cs/_/4952324744708096]
    Inertia.Define("Util", function() {
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
        Inertia.Define("_", function() { return Util._; });
        // Iterates Over Object's mulitiple times
        Inertia.Define("each", function() { return Util.each; });

        // Type Testing Functions
        Inertia.Define(["is", "Util.is"], function() {
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