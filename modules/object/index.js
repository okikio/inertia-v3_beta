(function() {
    // Object Module [all] the Native Object's with some additions
    // Inertia's Object Modules V2 [www.khanacademy.org/computer-programming/_/5993936052584448]
    Define("Object", function() {
        var Core = require("Core"), Util = require("Util"), args = Util.args,
            _ = Util._, $Map, MapFunc = Util.MapArr, $JSON = Core.JSON,
            Native = Core.Object, $indx = -1;
        // Map Of Names And Functions
        $Map = _.reduce(_.keys(_), function (acc, val, i) {
            return acc.concat([ [val, _[val]] ]);
        }, [])
        .concat([ 
            // Map that supports Objects 
            [["map"], function (obj, fn, ctxt) {
                return _.map(Object.keys(obj), function (i, $) {
                    return (fn || function () {})(obj[i], i, obj);
                }, ctxt);
            }],
            [["filter"], _.filter], // Filter a List of values in an Object
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
            [["str", "stringify"], function(obj, short) {
                var fns = [], json;
                try {
                    if (typeof obj !== "undefined") {
                        if (short) { return $JSON.stringify(obj); }
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
            [["new"], Util.new],
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
            }],
            // Sum of all values in an Object
            [["sum"], function (obj, id, deep) {
                return Object.reduce(obj, function (acc, val, i) {
                    var _val;
                    if ($in.isDef(id)) {
                        _val = Object.path(obj, $in.toArray(i + "." + id));
                    } else if (_.isObject(val) || _.isArray(val)) {
                        _val = deep ? Object.sum(val, id, deep) : 0;
                    } else if (_.isFunction(id)) {
                        _val = id(val);
                    } else { _val = val; }
                    acc += _val;
                    return acc;
                }, 0);
            }],
            // Average
            [["average", "avg"], function (obj, id) {
                if (Inertia.isDef(id)) {
                    return Object.pluck(obj, id).sum(null, true) / Object.size(obj);
                }
                return Object.sum(
                    Inertia.isDef(id) ? Object.pluck(obj, id) : obj,
                null, true) / Object.size(obj);
            }],
            // Median
            [["median", "med"], function (obj, id) {
                var _obj = Object.values(obj);
                var len = Object.size(_obj);
                if (id === undefined) {
                    if (len % 2 === 0) 
                        { return (_obj[(len / 2) - 1] + 
                                  _obj[len / 2]) / 2; }
                    return _obj[floor(len / 2)];
                }
                if (len % 2 === 0) 
                    { return (_obj[(len / 2) - 1][id] + 
                              _obj[len / 2][id]) / 2; }
                return _obj[floor(len / 2)][id];
            }],
            // Find the Mode (the most repeated element) of an Object
            [["mode", "repeated"], function (obj, id) {
                return Object.countBy(
                    $in.isDef(id) ? Object.pluck(obj, id) : obj
                ).pairs().max(Object.last).head();
            }],
            // Split an Object into smaller pieces 
            [["chunk"], function(obj, size, split) {
                var chunks = [], index = 0;
                if (typeof obj === "string") {
                    chunks = Object.chunk(obj.split(split || ""), size);
                } else if (Array.isArray(obj) || typeof obj === 'object') {
                    var _keys = Object.keys(obj), _obj, Chunkkeys;
                    // Used a function outside, can't define a function in a loop :(
                    var fn = function () {
                        Chunkkeys = _keys.slice(index, index + size);
                        _obj = {};
                        Object.forEach(Chunkkeys, function(_key) { 
                            _obj[_key] = obj[_key]; 
                        }, obj);
                    };
                    do { 
                        if (!Array.isArray(obj)) { fn(); } 
                        else { _obj = obj.slice(index, index + size); }
                        chunks.push(_obj); index += size; 
                    } while (index < _keys.length);
                } else { chunks.push([obj]); }
                return chunks;
            }], 
            // Dump all values at a certain point in the Object
            [["dump", "log"], function (obj) { Core.log.apply(obj, arguments); return obj; }],
            // Set methods quickly
            [["macro"], function (obj, name, fn) { 
                obj[name] = fn || Core.Fn("return this;"); 
                return obj; 
            }],
            // Instantiates the given class with Object values as a constructor
            [["mapInto"], function (obj, _class) { 
                return Object.map(obj, function (val, i) { 
                    return new _class(val, i);
                });
            }],
            // Returns the items in an Object with specified keys
            [["only"], function (obj) {
                var _args = args(arguments, 1);
                var props = Array.isArray(_args) ? _args[0] : _args;
                if (Array.isArray(obj)) {
                    return Object.filter(obj, function (item) { 
                        return props.indexOf(item) !== -1; 
                    });
                }
                return Object.reduce(obj, function(acc, val, i) {
                    if (props.indexOf(i) !== -1) { acc[i] = obj[i]; }
                    return acc;
                }, {});
            }],
            // Passes the Object to the given callback and returns the result
            [["pipe"], function (obj, fn) 
                { return (fn || Core.Fn("v", "return v;")) (obj); }]
        ]);
        
        // Extend Methods
        _.extend(Native, MapFunc(Native, $Map));
        Native.prototype.chain = function () {
            return _.extend(this, MapFunc(this, $Map, true));
        };
        return Native;
    });
})(); // Object