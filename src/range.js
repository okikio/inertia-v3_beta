(function() {
    // Inertia's Range Module V2 [www.khanacademy.org/cs/_/5953955266068480]
    // Range Module create an Array full of a Range of Objects
    Define("Range", function() {
        var _ = require("Util")._; require("Math"); require("String");
        // Range Function
        return function(strt, end, inc, exclude) {
            var _include, arr = [], value = strt;
            // Use Uderscore's Default
            if (_.isNumber(strt) || _.isNumber(end)) {
                strt = arguments.length === 1 ? 0 : strt;
                end = arguments.length === 1 ? strt : end;
                return _.range.apply({}, [strt, exclude ? end : end + 1, inc]);
            }
            // Check if the last Value of the Range is Included
            _include = function(val) {
                if (inc) { return val < this.End; }
                if (val < strt) { return false; }
                return val <= end;
            };
            // Iterate through the Range
            while (_include(value)) {
                arr.push(value);
                value = value.next();
            }
            return arr;
        };
    });
})(); // Range