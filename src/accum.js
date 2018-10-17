(function() {
    // Inertia's Accum Module V2 [www.khanacademy.org/cs/_/5750787651436544]
    Define("Accum", function() {
        var To, Func = require("Core.Func"), _ = require("Util")._, To,
            Eq = function (sy) // Equation
                { return Func("a", "b", "return a" + (sy || "+") + "b"); };
        return _.reduce({
            To: (To = function(obj, n, func, start) {
                /* Calculates The Total Value Of An Object Until
                   It Reaches The Index That Has Been Set */
                return _.reduce(obj.slice(0, n), func,
                    typeof start === "undefined" ? 0 : start);
            }),

            // Defaults
            Add: function(obj, n) { return To(obj, n, Eq(), 0); },
            Sub: function(obj, n) { return To(obj, n, Eq("-"), 0); },
            Div: function(obj, n) { return To(obj, n, Eq("/"), 1); },
            Mult: function(obj, n) { return To(obj, n, Eq("*"), 1); },
        }, function (obj, val, i) {
            // Capitals and Lowercases 
            obj[i.toLowerCase()] = obj[i] = val;
            return obj;
        }, {});
    });
})(); // Accum