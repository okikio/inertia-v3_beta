(function() {
    // Inertia's Color Module V2 [www.khanacademy.org/cs/_/6520178064261120]
    // Color Modules A basic set of Color Utilities
    Define("Color", function() {
        var _ = require("Util")._, CssColors, Static, Fn = require("Core.Func"), Alias,
            Class = require("Class"), $lerp = require("Math.lerp"); require("String");
        // Css Color maps. Color names and their hex values
        CssColors = {
            aliceblue: '#F0F8FF', antiquewhite: '#FAEBD7', aqua: '#00FFFF', aquamarine: '#7FFFD4', azure: '#F0FFFF', beige: '#F5F5DC', bisque: '#FFE4C4', black: '#000000', blanchedalmond: '#FFEBCD', blue: '#0000FF', blueviolet: '#8A2BE2', brown: '#A52A2A', burlywood: '#DEB887', cadetblue: '#5F9EA0', chartreuse: '#7FFF00', chocolate: '#D2691E', coral: '#FF7F50', cornflowerblue: '#6495ED', cornsilk: '#FFF8DC', crimson: '#DC143C', cyan: '#00FFFF', darkblue: '#00008B', darkcyan: '#008B8B', darkgoldenrod: '#B8860B', darkgray: '#A9A9A9', darkgrey: '#A9A9A9', darkgreen: '#006400', darkkhaki: '#BDB76B', darkmagenta: '#8B008B', darkolivegreen: '#556B2F', darkorange: '#FF8C00', darkorchid: '#9932CC', darkred: '#8B0000', darksalmon: '#E9967A', darkseagreen: '#8FBC8F', darkslateblue: '#483D8B', darkslategray: '#2F4F4F', darkslategrey: '#2F4F4F', darkturquoise: '#00CED1', darkviolet: '#9400D3', deeppink: '#FF1493', deepskyblue: '#00BFFF', dimgray: '#696969', dimgrey: '#696969', dodgerblue: '#1E90FF', firebrick: '#B22222', floralwhite: '#FFFAF0', forestgreen: '#228B22', fuchsia: '#FF00FF', gainsboro: '#DCDCDC', ghostwhite: '#F8F8FF', gold: '#FFD700', goldenrod: '#DAA520', gray: '#808080', grey: '#808080', green: '#008000', greenyellow: '#ADFF2F', honeydew: '#F0FFF0', hotpink: '#FF69B4', indianred: '#CD5C5C', indigo: '#4B0082', ivory: '#FFFFF0', khaki: '#F0E68C', lavender: '#E6E6FA', lavenderblush: '#FFF0F5', lawngreen: '#7CFC00', lemonchiffon: '#FFFACD', lightblue: '#ADD8E6', lightcoral: '#F08080', lightcyan: '#E0FFFF', lightgoldenrodyellow: '#FAFAD2', lightgray: '#D3D3D3', lightgrey: '#D3D3D3', lightgreen: '#90EE90', lightpink: '#FFB6C1', lightsalmon: '#FFA07A', lightseagreen: '#20B2AA', lightskyblue: '#87CEFA', lightslategray: '#778899', lightslategrey: '#778899', lightsteelblue: '#B0C4DE', lightyellow: '#FFFFE0', lime: '#00FF00', limegreen: '#32CD32', linen: '#FAF0E6', magenta: '#FF00FF', maroon: '#800000', mediumaquamarine: '#66CDAA', mediumblue: '#0000CD', mediumorchid: '#BA55D3', mediumpurple: '#9370D8', mediumseagreen: '#3CB371', mediumslateblue: '#7B68EE', mediumspringgreen: '#00FA9A', mediumturquoise: '#48D1CC', mediumvioletred: '#C71585', midnightblue: '#191970', mintcream: '#F5FFFA', mistyrose: '#FFE4E1', moccasin: '#FFE4B5', navajowhite: '#FFDEAD', navy: '#000080', oldlace: '#FDF5E6', olive: '#808000', olivedrab: '#6B8E23', orange: '#FFA500', orangered: '#FF4500', orchid: '#DA70D6', palegoldenrod: '#EEE8AA', palegreen: '#98FB98', paleturquoise: '#AFEEEE', palevioletred: '#D87093', papayawhip: '#FFEFD5', peachpuff: '#FFDAB9', peru: '#CD853F', pink: '#FFC0CB', plum: '#DDA0DD', powderblue: '#B0E0E6', purple: '#800080', rebeccapurple: '#663399', red: '#FF0000', rosybrown: '#BC8F8F', royalblue: '#4169E1', saddlebrown: '#8B4513', salmon: '#FA8072', sandybrown: '#F4A460', seagreen: '#2E8B57', seashell: '#FFF5EE', sienna: '#A0522D', silver: '#C0C0C0', skyblue: '#87CEEB', slateblue: '#6A5ACD', slategray: '#708090', slategrey: '#708090', snow: '#FFFAFA', springgreen: '#00FF7F', steelblue: '#4682B4', tan: '#D2B48C', teal: '#008080', thistle: '#D8BFD8', tomato: '#FF6347', turquoise: '#40E0D0', violet: '#EE82EE', wheat: '#F5DEB3', white: '#FFFFFF', whitesmoke: '#F5F5F5', yellow: '#FFFF00', yellowgreen: '#9ACD32'
        };
    
        // Create Aliases for Default Color Functions
        Alias = function(fn, chain) {
            return function() {
                if (!_.isUndefined(chain)) {
                    fn.apply(this, [this.value]
                        .concat(Array.from(arguments)));
                    return this;
                } else {
                    return fn.apply(this, [this.value]
                        .concat(Array.from(arguments)));
                }
            };
        };
    
        // Color Object
        return Class({
            _class: "Color", // Set Class Name
            init: function() {
                // Initial Value
                this.initVal = Array.from(arguments);

                // Use Percent
                var _last = Fn("arr", "return arr[arr.length - 1]");
                var args = _last(this.initVal);
                this.percent = _.isBoolean(args) && args;

                // Color Value
                return (this.value = Static.parse
                    .apply(this, arguments));
            }
        })

        // Static Methods of the Color Object
        .static(CssColors, Static = {
                // Default Color Converter Functions
                alpha: Alias(alpha), green: Alias(green),
                blue: Alias(blue), red: Alias(red),
                
                // Linear interpoliation
                lerp: function (a, b, per) {
                    return $lerp.apply(null,
                        Static.parse(a), Static.parse(b), per);
                },
                
                // Is value a color?
                isColor: _.isColor,

                // Parser For Color HexCodes
                torgb: function(hex, opacity, percent) {
                    var _last = Fn("arr", "return arr[arr.length - 1]");
                    var args = _last(Array.from(arguments));
                    var fn = Fn("v", "return v + v");
                    hex = hex.replace(/#/g, "");
                    this.percent = _.isBoolean(args) && args;
                    var rgb = color.toArray("0xFF" +
                        (hex.length === 3 ? hex.map(fn) : hex));
                    rgb[3] = _.isUndefined(opacity) ? 255 :
                        (this.percent ? opacity * 255 : opacity);
                    return rgb;
                },

                // String Colors to Rgba
                str_rgb: function(clr) {
                    if (clr.includes("rgb")) {
                        // Rgb | Rgba
                        clr = clr.replace(/rgb?a|[^\d\.\,]/g, "");
                        return clr.split(",");
                    } else if (clr.includes("hsb")) {
                        // Hsb
                        clr = clr.replace(/hsb?a|[^\d\.\,]/g, "").split(",");
                        colorMode(HSB); var $clr = color.apply({}, clr);
                        colorMode(RGB);
                        return [red($clr), green($clr), blue($clr), alpha($clr)];
                    } else if (clr.includes("hsl")) {
                        // Hsl
                        clr = clr.replace(/hsl?a|[^\d\.\,]/g, "").split(",");
                        colorMode(HSB); var temp = clr[2];
                        clr[2] = temp - clr[1] / 2;
                        var $clr = color.apply({}, clr);
                        colorMode(RGB);
                        return [red($clr), green($clr), blue($clr), alpha($clr)];
                    } else { return Static.torgb.apply({}, arguments); }
                },

                // Color to Rgba Array
                clr_rgb: function() {
                    var _args = Array.from(arguments), clr;
                    _args = _.isArray(_args[0]) ? _args[0] : _args;
                    clr = color.apply({}, (_.isString(_args[0]) ?
                        Static.str_rgb.apply({}, _args) : _args));
                    return [red(clr), green(clr), blue(clr), alpha(clr)];
                },

                // Parse the Color inputed into an RGBA Array
                parse: function(clr) {
                    var args = Array.from(arguments);
                    clr = (clr + "").toLowerCase();
                    return Static.clr_rgb.apply(this,
                        _.keys(CssColors).includes(clr) ? [CssColors[clr]]
                        .concat(args.slice(1)) : args);
                },
                
                // Is color dark?
                isDark: function () {
                    // YIQ equation from http://24ways.org/2010/calculating-color-contrast
                    var rgb = Static.parse.apply(null, arguments);
                    var yiq = (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000;
                    return yiq < 128;
                },
                
                // Is color light?
                isLight: function ()
                    { return Static.isDark.apply(null, arguments); },
                
                // Parse the Color inputed into an RGBA String
                tostr: function(clr) {
                    var arr = Static.parse.apply(this, arguments);
                    var obj = {
                        r: arr[0], g: arr[1],  b: arr[2], a: arr[3] / 255
                    };

                    return "rgba({{r}}, {{g}}, {{b}}, {{a}})".temp(obj);
                },

                // Stronger Version Of The fill function that allows hexCodes & other color schemes
                fill: function() {
                    fill.apply(this,
                        Static.parse.apply(this, arguments));
                },

                // Stronger Version Of The stroke function that allows hexCodes & other color schemes
                stroke: function() {
                    stroke.apply(this,
                        Static.parse.apply(this, arguments));
                },

                // Stronger Version Of The background function that allows hexCodes & other color schemes
                background: function() {
                    background.apply(this,
                        Static.parse.apply(this, arguments));
                }
            })

        // Prototype Methods of the Color Object
        .addto(_.reduce(Static, function(obj, val, i) {
            if (i !== "fill" && i !== "stroke" && i !== "background")
                { obj[i] = Alias(val, false); }
            else { obj[i] = Alias(val); }
            return obj;
        }, {}));
    });
})(); // Color