(function() {
    // Inertia's Ease Module V2 [www.khanacademy.org/cs/_/--]
    // Ease Modules a basic set of Easing Utilities
    Define("Ease", function() {
        var _ = require("Util")._, Static, Elastic, BounceOut, BounceIn, Ease;
        
        // Elastic easing based on animejs [github.com/juliangarnier/anime/blob/master/anime.js]
        Elastic = function (t, p) {
            p = p || 0.3;
            return t === 0 || t === 1 ? t : -pow(2, 10 * (t - 1)) *
                Math.sin((((t - 1) - (p / (PI * 2.0) * asin(1))) * (PI * 2)) / p );
        };
        
        // Bounce Out based on TweenJS [www.createjs.com/docs/tweenjs/files/tweenjs_Ease.js.html#l388]
        BounceOut = function(t) {
	        if (t < 1/2.75) {
		        return (7.5625*t*t);
	        } else if (t < 2/2.75) {
		        return (7.5625*(t-=1.5/2.75)*t+0.75);
	        } else if (t < 2.5/2.75) {
		        return (7.5625*(t-=2.25/2.75)*t+0.9375);
	        } else {
		        return (7.5625*(t-=2.625/2.75)*t +0.984375);
	        }
        };
        
        // Bouse In
        BounceIn = function (t) { return 1 - BounceOut(1 - t); };
        
        // Easing Default
        Ease = function (strt, end, vel) {
            vel = vel || 12;
            return _.isString(strt) ?
                    Ease[strt.toString().toLowerCase()]
                         .apply({}, [].slice.call(arguments, 1))
                     : strt + (end - strt) / vel;
        };
        
        // Cubic Bezier Function
        Ease.cubic = Ease.bezier = function(bez) {
            if (typeof bez === 'function') { return bez; }
            var polyBez = function(p1, p2) {
                var A = [null, null], B = [null, null], C = [null, null],
                    bezCoOrd = function(t, ax) {
                        C[ax] = 3 * p1[ax];
                        B[ax] = 3 * (p2[ax] - p1[ax]) - C[ax];
                        A[ax] = 1 - C[ax] - B[ax];
                        return t * (C[ax] + t * (B[ax] + t * A[ax]));
                    },
                    xDeriv = function(t)
                        { return C[0] + t * (2 * B[0] + 3 * A[0] * t); },
                    xForT = function(t) {
                        var x = t, i = 0, z;
                        while (++i < 14) {
                            if (abs(z = bezCoOrd(x, 0) - t) < 1e-3)
                                { break; }
                            x -= z / xDeriv(x);
                        }
                        return x;
                    };
                return function(t) { return bezCoOrd(xForT(t), 1); };
            };
            
            return function(t) {
                return polyBez([bez[0], bez[1]], [bez[2], bez[3]]) (constrain(t / 1, 0, 1));
            };
        };
        
        // Easing Equations
        Ease.fn = {}; // Function Form
        Ease.eq = Ease.equations = {
            ease: [0.25, 0.1, 0.25, 1], /* Ease */
            linear: [0.250, 0.250, 0.750, 0.750],
            in: {
                quad: [0.550, 0.085, 0.680, 0.530], /* InQuad */
                cubic: [0.550, 0.055, 0.675, 0.190], /* InCubic */
                quart: [0.895, 0.030, 0.685, 0.220], /* InQuart */
                quint: [0.755, 0.050, 0.855, 0.060], /* InQuint */
                sine: [0.470, 0.000, 0.745, 0.715], /* InSine */
                expo: [0.950, 0.050, 0.795, 0.035], /* InExpo */
                circ: [0.600, 0.040, 0.980, 0.335], /* InCirc */
                back: [0.600, -0.280, 0.735, 0.045], /* InBack */
                ease: [0.42, 0, 1, 1], /* InEase */
                elastic: Elastic, /* InElastic */
                bounce: BounceIn, /* InBounce */
            },
            out: {
                quad: [0.250, 0.460, 0.450, 0.940], /* OutQuad */
                cubic: [0.215, 0.610, 0.355, 1.000], /* OutCubic */
                quart: [0.165, 0.840, 0.440, 1.000], /* OutQuart */
                quint: [0.230, 1.000, 0.320, 1.000], /* OutQuint */
                sine: [0.390, 0.575, 0.565, 1.000], /* OutSine */
                expo: [0.190, 1.000, 0.220, 1.000], /* OutExpo */
                circ: [0.075, 0.820, 0.165, 1.000], /* OutCirc */
                back: [0.175, 0.885, 0.320, 1.275], /* OutBack */
                ease: [0, 0, 0.58, 1], /* OutEase */
                elastic: function (t, f)
                    { return 1 - Elastic(1 - t, f); }, /* OutElastic */
                bounce: BounceOut, /* OutBounce */
            },
            inout: {
                quad: [0.455, 0.030, 0.515, 0.955], /* InOutQuad */
                cubic: [0.645, 0.045, 0.355, 1.000], /* InOutCubic */
                quart: [0.770, 0.000, 0.175, 1.000], /* InOutQuart */
                quint: [0.860, 0.000, 0.070, 1.000], /* InOutQuint */
                sine: [0.445, 0.050, 0.550, 0.950], /* InOutSine */
                expo: [1.000, 0.000, 0.000, 1.000], /* InOutExpo */
                circ: [0.785, 0.135, 0.150, 0.860], /* InOutCirc */
                back: [0.680, -0.550, 0.265, 1.550], /* InOutBack */
                ease: [0.42, 0, 0.58, 1], /* InOutEase */
                elastic: function (t, f) /* InOutElastic */
                    { return t < 0.5 ? Elastic(t * 2, f) / 2 : 1 - Elastic(t * -2 + 2, f) / 2; },
                bounce: function (t) {
                    if (t < 0.5) { return BounceIn(t * 2) * 0.5; }
                    return BounceOut(t * 2 - 1)* 0.5 + 0.5;
                }, /* InOutBounce */
            }
        };
        
        /*
            @Return [Function] - A Function that takes the `time`
                - @Param [Number] time - The Current `time` from 0 to 1
                - @Return [Number] - Contains a value from 0 to 1
            @Api Public
        */
        
        _.each(Ease.equations, function (obj, type) {
            if (_.isArray(obj)) {
                Ease[type] = Ease.fn[type] = Ease.bezier(obj);
                Ease.eq[type] = obj;
            } else {
                _.each(obj, function (arr, eq) {
                    Ease.fn[type + eq] = Ease[type + eq] = Ease.bezier(arr);
                    Ease.eq[type + eq] = arr;
                });
            }
        });
        return Ease;
    });
})(); // Ease