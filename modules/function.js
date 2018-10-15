c(function() {
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
                "return n" + "ew F")],
            
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