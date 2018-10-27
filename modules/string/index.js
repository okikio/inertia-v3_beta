(function() {
    // String Module the Native String Objects with some additions
    // Inertia's String Module V2 [www.khanacademy.org/computer-programming/_/4845861095374848]
    Define("String", function() {
        var Util = require("Util"), $Map, Native = require("Core.String"),
            MapFunc = Util.MapArr, _ = Util._, $Add = {}, $indx = 0;

        // Map Of Names And Functions
        $Map = [
            // Capitalize Strings
            [["cap", "Capital"], function(str) {
                return str.slice(0, 1).toUpperCase() + str.slice(1).toLowerCase();
            }],

            // Cuts off a String that is a certain length long
            [["trunc", "Truncate"], function(str, len, end) {
                end = _.isUndefined(end) ? '...' : end; len = len || 30;
                return str.length > len ? str.substring(0, len) + end :
                        String(str);
            }],

            // Escape RegExp Meta Characters
            [["escape"], function(str) {
                if (!_.isString(str)) { return str; }
                return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
            }],

            // Swap Parts of a String that passes a truth test very Similar to Array.filter
            [["swap"], function(str, find, substi) {
                var result = ""; if (!find) { return str; }
                return str.replace(new RegExp(String.escape(find), "g"), substi);
            }],

            // Map a Sring
            [["map"], function(str, fn, contxt) {
                return str.split("").map(fn, contxt).join("");
            }],

            // Camelizes a String
            [["camel", "Camelize"], function(str) {
                return str.split(/\W+/g).map(String.cap).join(" ");
            }],

            // Create's an Array of Index for the First Letter of all Occurances of a Certain String in a Larger String
            [["occur"], function(str, find) {
                try {
                    var result, _find = new RegExp(find, "g"), indx = [];
                    if (str && find) {
                        while ((result = _find.exec(str)))
                            { indx.push(result.index); }
                    }
                    return indx;
                } catch (e) {
                    return "There is a problem with `occur`, check the [\"" + str + "\" & " + find + "] params.";
                }
            }],

            // Creates a Template String
            [["temp", "Template"], _.template],

            // Previous Value
            [["prev"], function(str) {
                return str.slice(0, str.length - 1) +
                    String.fromCharCode(str.charCodeAt(str.length - 1) - 1);
            }],

            // Next Value
            [["grow"], function(str) {
                return str.slice(0, str.length - 1) +
                    String.fromCharCode(str.charCodeAt(str.length - 1) + 1);
            }]
        ];

        // Additional Functionality
        $Add = {
            // Template Settings
            SetTemplate: function(sets) {
                _.extend(_.templateSettings, sets || {});
            }
        };

        // Set Default Template Settings
        $Add.SetTemplate({
            interpolate: /{=([\s\S]+?)=}/g, /* {= 2 + 2 =} // 4 */
            escape: /{{([\s\S]+?)}}/g, /* "a is {{ a }}".temp({ a: 5 }) // 5 */
            evaluate: /{-([\s\S]+?)-}/g /* "{- _.each([1, 2], function (v, i) { -}
                                                loop {{ i }},
                                            {- }) -}".temp({}) // loop 0, loop 1, */
        });

        // Extend Inline Methods
        _.extend(Native, $Add = MapFunc($Map));
        _.extend(Native.prototype, MapFunc($Map, true));
        return Native;
    });
})(); // String