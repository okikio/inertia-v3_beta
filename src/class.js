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
        Class = Static.Create;
        _.extend(Class, Static);
        return Class;
    });
})(); // Class