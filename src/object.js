(function() {
    // Object Module [all] the Native Object's with some additions
    // Inertia's Object Modules V2 [www.khanacademy.org/computer-programming/_/5993936052584448]
    Define("Object", function() {
        var Util = Inertia.require("Util"), args = Util.args, _ = Util._, $Map,
            MapFunc = Util.MapArr, $JSON = Inertia.require("Core.JSON"),
            Native = Inertia.require("Core.Object"), $indx = 0;

        // Map Of Names And Functions
        $Map = _.reduce(_.keys(_), function (acc, val, i) {
            return !["toArray"].includes(val) ?
                    acc.concat([ [val, _[val]] ]) : acc;
        }, [])
        .concat([
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
                if ($in.isDef(id)) {
                    return Object.pluck(obj, id).sum(null, true) / Object.size(obj);
                }
                return Object.sum(
                    $in.isDef(id) ? Object.pluck(obj, id) : obj,
                null, true) / Object.size(obj);
            }],
        ]);
        
        // Extend Methods
        MapFunc(Native, $Map);
        MapFunc(Native.prototype, $Map, true);
        return Native;
    });
})(); // Object