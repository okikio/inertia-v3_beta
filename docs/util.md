## Util
* Version - 2.0.0
* Dependencies - Core

The util module is primarily designed to support the needs of native modules. However, many of the utilities are useful for application and for other module developers as well.

### Methods & Properties
#### _ - [Object]
Underscore.js (V1.4.4) a modern javascript utility library delivering modularity, performance & extra's. For more info \[<a href="https://underscorejs.org"  target="_blank">underscore.js</a> | <a href="https://lodash.com/docs/"  target="_blank">lodash</a>\]. Some of it's methods are:
- each
- map
- reduce
- reduceRight
- find
- filter
- where
- findWhere
- reject
- every
- some
- contains
- invoke
- pluck
- max
- min
- sortBy
- groupBy
- indexBy
- countBy
- shuffle
- sample
- toArray
- size
- partition
- first
- initial
- last
- rest
- compact
- flatten
- without
- union
- intersection
- difference
- uniq
- zip
- unzip
- object
- indexOf
- lastIndexOf
- sortedIndex
- findIndex
- findLastIndex
- range
- bind
- bindAll
- partial
- memoize
- delay
- defer
- throttle
- debounce
- once
- after
- before
- wrap
- negate
- compose
- restArguments
- keys
- allKeys
- values
- mapObject
- pairs
- invert
- create
- functions
- findKey
- extend
- extendOwn
- pick
- omit
- defaults
- clone
- tap
- has
- property
- propertyOf
- matcher
- isEqual
- isMatch
- isEmpty
- isElement
- isArray
- isObject
- isArguments
- isFunction
- isString
- isNumber
- isFinite
- isBoolean
- isDate
- isRegExp
- isError
- isSymbol
- isMap
- isWeakMap
- isSet
- isWeakSet
- isNaN
- isNull
- isUndefined
- noConflict
- identity
- constant
- noop
- times
- random
- mixin
- iteratee
- uniqueId
- escape
- unescape
- result
- now
- template
- chain
- value

##### Example
```javascript
...
var _ = require("_"); // or
var _ = require("Util._");
var arr = _.map([1, 2, 3], function (val, i) {
    return val * 2;
});

var valu = _.chain(arr).reduce(function (acc, val) {
    return acc + val;
}, 0).value();
println(valu); // "12"
```

#### each - [Function]
Iterates over elements of collection and invokes iteratee for each element. The iteratee is invoked with three arguments: (value, index|key, collection). Iteratee functions may exit iteration early by explicitly returning false. It's an extention of `_.each` from underscorejs.

            * @param {Object | Array} obj - The Object / Array being iterated
            * @param {Function} func - Iteratee / Function to Execute For Each Element Taking 3 Arguments:
                * 
                * @param {Data} [You Choose the name] - Value of Each Element
                * @param {Number | String} [You Choose the name] - Key | Index of Each Element
                * @param {Object | Array} [You Choose the name] - Object | Array To Iterate
                * 
            * @param {Object} context - Optional Value to use when Executing Callback In An Object.
            * @return {Iteration}
            
            * ### Examples:
                each([1, 2], function (val, id) { _log(id + ": " + val); }); // 0: 1, 1: 2
                each({ a: "a", b: "b"}, function (val, id) { _log(id + ": " + val); }); // a: "a, b: "b",
        ###
* ###### Params
    * **[Object | Array]** obj - The Object / Array being iterated
    * **[Function]** func - Iteratee / Function to execute for each element taking 3 Arguments:
        * **[\*Any]** val - Value of each element
        * **[Number | String]** indx - Key | Index of Each Element
        * **[Object | Array]** obj - Object | Array to iterate
    * **[Object]** ctxt - Optional value to use when executing callback in an object.
* ###### Example
    ```javascript
    var each = require("Util.each"); // or
    each([1, 2], function (val, id) { 
        println(id + ": " + val);  // 0: 1, 1: 2
    });
    each({ a: "a", b: "b"}, function (val, id) { 
        println(id + ": " + val); // a: "a, b: "b"
    }); 
    ```

#### _ - [Function]

* ###### Params
    * **[Object]** - 
* ###### Return
    * **[Object]** - 
* ###### Example
    ```javascript
    
    ```
 
    each: _.each, map: _.map,
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
