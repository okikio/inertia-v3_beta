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
                var path_ = function(obj, path, val, lvl, $path) {
                    path = Inertia.toArray(path); 
                    lvl = Math.max(lvl, 0) || 0; 
                    $path = $path || [].concat(path);
                    var err = function ($val) {  
                        return " - Path `['" + $path.join("', '")  + "']` is stuck on level: `" + lvl + "`, Current Position: `" + $val + "`";
                    };
                    
                    // Check if value is given
                    if ($in.isDef(val)) {
                        ++ lvl; // For error checking
                        if (/\*/g.test(path[0])) {
                            try {
                                // This is for multiple wildcards
                                _.each(obj, function (_obj, $_path) {
                                    // Test to see if '*' is given as a path
                                    var isAll = path[0].replace(/\*/g, "").length === 0;
                                    if (isAll) {
                                        path_(obj, [$_path].concat(_.rest(path)), 
                                              val, lvl, $path);
                                    } else {
                                        var v_ = path[0].replace(/\*/g, "(.*?)");
                                        if (new RegExp(v_, "g").test($_path)) {
                                            path_(obj, [$_path].concat(_.rest(path)), 
                                                  val, lvl, $path);
                                        }
                                    }
                                });
                            } catch (e) { 
                                Core.log("WildCard Error!" + err(path[0])); 
                            }
                        } else if (path.length > 1) {
                            path_(obj[path[0]], _.rest(path), val, lvl, $path);
                        } else { obj[path[0]] = val; }
                        return val;
                    } else {
                        path.forEach(function($val, lvl_) { 
                            try {
                                lvl = lvl_ + 1; // For error checking
                                
                                // Wild Card "*"
                                if (/\*/g.test($val)) { 
                                    try {
                                        var v_ = $val.replace(/\*/g, "(.*?)"); 
                                        obj = _.isArray(obj) ? obj : [].concat(obj); 
                                        // This is for multiple wildcards
                                        _.each(obj, function (_obj, indx) {
                                            // Test to see if '*' alone is given as a path
                                            var isAll = $val.replace(/\*/g, "").length === 0;
                                            obj[indx] = isAll ? _obj : 
                                                _.filter(_obj, function (_v, _i) {
                                                    return new RegExp(v_, "g")
                                                        .test(_.isArray(_obj) ? _v : _i);
                                                });
                                        });
                                    } catch (e) { 
                                        Core.log("WildCard Error!" + err($val)); 
                                    }
                                } else { 
                                    if (Array.isArray(obj)) { 
                                        obj.forEach(function (val, i) {
                                            obj[i] = obj[i][$val];
                                        });
                                    } else { obj = obj[$val]; }
                                    
                                }
                            } catch (e) { Core.log("Error!" + err($val)); }
                        });
                    }
                    
                    return path.length === lvl ? obj.map(function (val) {
                        return _.isArray(val) && val.length > 1 ? _.flatten(val) : val;
                    }) : obj;
                };
                return path_(obj, path, val);
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