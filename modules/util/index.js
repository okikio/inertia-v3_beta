(function() {
    // Inertia's Util Modules V2 [www.khanacademy.org/cs/_/4952324744708096]
    Define("Util", function() {
        var Util, Core = $in.require("Core"), _ = Core.window("_");
        
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
            MapArr: function(host, obj, type, override) {
                var result = {}, _ = Core.window("_");
                override = override || [];
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
                
                for (var i in result) {
                    host[i] = (!_.has(host, i) || !override.includes(i) ? result : host)[i];
                }
            },

            // Find a value in an Object based on it's path
            path: function(obj, path, val) {
                var Path = function(obj, path, val, lvl, init) {
                    var curr, path = Inertia.toArray(path); 
                    init = init || [].concat(path);
                    lvl = Math.max(lvl, 0) || 0; 
                    
                    try {
                        // Check if value is given
                        if ($in.isDef(val)) {
                            var pathLeft = _.rest(path); // Returns the path left to travel 
                            curr = path[0]; ++ lvl; // For error checking
                            
                            if (/\*/g.test(curr)) {
                                // This is for multiple wildcards
                                _.each(obj, function ($, idx) {
                                    // Test to see if '*' is given as a path
                                    var isAll = curr.replace(/\*/g, "").length === 0;
                                    var toReg = curr.replace(/\*/g, "(.*?)");
                                    var regex = new RegExp(toReg, "g"); 
                                    var subPath = [idx].concat(pathLeft); // Finds all the subpaths for the wildcard
                                    if (isAll || regex) {
                                        Path(obj, subPath, val, lvl, init);
                                    }
                                });
                            } else if (path.length > 1) {
                                Path(obj[curr], pathLeft, val, lvl, init);
                            } else { obj[curr] = val; }
                            return obj;
                        } else {
                            path.forEach(function(v, i) { 
                                curr = v; lvl = i + 1; // For error checking
                                
                                // Wild Card "*"
                                if (/\*/g.test(curr)) { 
                                    var toReg = curr.replace(/\*/g, "(.*?)");
                                    var regex = new RegExp(toReg, "g"); 
                                    var objArr = _.isArray(obj) ? obj : [].concat(obj); 
                                    
                                    // This is for multiple wildcards
                                    obj = _.map(objArr, function (vals, indx) {
                                        // Test to see if '*' alone is given as a path
                                        var isAll = curr.replace(/\*/g, "").length === 0;
                                        return isAll ? vals : 
                                            _.filter(vals, function (val, idx) {
                                                return regex.test(
                                                    _.isArray(vals) ? val : idx
                                                );
                                            });
                                    });
                                } else { 
                                    if (Array.isArray(obj)) { 
                                        obj = _.map(obj, function ($, i) 
                                            { return obj[i][v]; });
                                    } else { obj = obj[v]; }
                                    
                                }
                            });
                        }
                    } catch (e) { 
                        Core.log("Error! - Path `['" + init.join("', '")  + "']` is stuck on level: `" + lvl + "`, Current Position: `" + curr + "`"); 
                    }
                    return path.length === lvl ? obj.map(function (val) {
                        return _.isArray(val) && val.length > 1 ? _.flatten(val) : val;
                    }) : obj;
                };
                return Path(obj, path, val);
            },

            // Take a Function as a Value
            FnVal: function(val, arg, ctxt) {
                if (!Util._.isFunction(val)) { return val; }
                return val.apply(ctxt, arg);
            }
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