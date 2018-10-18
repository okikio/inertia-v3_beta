(function() {
    // Inertia's Vector Module V2 [www.khanacademy.org/cs/_/5402431084593152]
    // PVector with Tweaks
    Define(["Math.Vector", "Vector", "vector", "vec"], function() {
        var Util = require("Util"), args = Util.args, Static, VFn, Obj,
            _ = Util._, Func = require("Core.Func"), VSolve,
            Class = require("Class"), Vector, QAlias,
            Chain = ["rotate", "lerp", "normalize", "limit"]; // Chainable Methods
        // Objectify a Vector for Immidiate Use
        Obj = function($this) {
            return _.isNumber($this) ? Vector($this, $this, $this) : Vector($this);
        };

        // Allows for Quick Vector Math
        VSolve = function(symbol) {
            symbol = symbol || "+";
            return function($this, $vec) {
                var $vec = Obj($vec);
                Func("$this", "$vec", "$this.x " + symbol + "= $vec.x;").call({}, $this, $vec);
                Func("$this", "$vec", "$this.y " + symbol + "= $vec.y;").call({}, $this, $vec);
                Func("$this", "$vec", "$this.z " + symbol + "= $vec.z;").call({}, $this, $vec);
                println($this);
                return $this;
            };
        };

        // Run a Vectors through a Function
        VFn = function($this, fn, args) {
            args = args || [];
            $this.x = fn.apply($this, [$this.x].concat(args));
            $this.y = fn.apply($this, [$this.y].concat(args));
            $this.z = fn.apply($this, [$this.z].concat(args));
            return $this;
        };

        // Create A Quick Alias
        QAlias = function(path, method) {
            return function() {
                var Prop = Class.alias(Vector).apply(null, [path]);
                return !method ? Prop.apply(this, arguments) : Prop;
            };
        };

        // Vector Object
        Vector = Class({
            init: function () {
                this.set.apply(this, arguments);
            }
        })
        
        // Static Methods of the Vector Object
        .static(PVector, Static = {
            // Basic Vector Math
            add: VSolve(),
            sub: VSolve("-"),
            div: VSolve("/"),
            mod: VSolve("%"),
            mult: VSolve("*"),
            
            // Invert
            invert: function ($this) { return VSolve("*") ($this, -1); },
            
            // Distances of Points axis'
            distX: Func("$this", "$vec", "return $this.x - $vec.x;"),
            distY: Func("$this", "$vec", "return $this.y - $vec.y;"),
            distZ: Func("$this", "$vec", "return $this.z - $vec.z;"),

            // Self Explanatory (The Slope / Intercept of two Points)
            slope: Func("$this", "$vec", "return ($this.distY($vec) / $this.distX($vec)) || 0;"),
            intercept: Func("$this", "$vec", "return $this.y - $this.slope($vec) * $this.x;"),

            // Perpendicular Slope
            perpSlope: Func("$this", "$vec", "return -1 / $this.slope($vec);"),
            
            // Check if 2 Vectors are In a Straight Line
            inLine: function ($this, vec) {
                var $this = $this.copy(), vec = vec.copy();
                return abs($this.cross(vec).z) <= sqrt($this.magSq() + vec.magSq()) * 1e-8;
            },
            
            // Perpendicular
            perp: function ($this) {
                $this.set($this.y, $this.x, $this.z);
                return $this;
            },
            
            // Project this vector on to another vector
            project: function (v) {
                return this.scale(this.dot(v) / v.magSq());
            },
    
            // Project this vector onto a vector of unit length
            projectN: function (v) {
                return this.mult(this.dot(v));
            },
            
            // Run a Vector through a Function
            fn: VFn,
            
            // Mid point of to Vectors
            mid: function ($this, $vec) {
                var $vec = Obj($vec);
                return $this.lerp($vec, 0.5);
            },

            // Turn a Vector to an Array
            arr: function (x, y, z) {
                // [x Axis, y Axis, z Axis]
                return _.isArray(x) ? [x[0] || 0, x[1] || 0, x[2] || 0] :
                       _.isObject(x) ? [x.x || 0, x.y || 0, x.z || 0] :
                       [(x || 0), (y || 0), (z || 0)];
            },
            array: QAlias("arr"),
            
            // Get the Quadrant of Vector
            quad: function($this) {
                return $this.x >= 0 ? $this.y >= 0 ? 1 : 4 : $this.y >= 0 ? 2 : 3;
            },

            // Copy a Vector
            copy: function($this) { return new Vector($this); },
            get: QAlias("copy"),
            
            // Objectify a Vector for Immidiate Use
            obj: Obj,

            // Are two Vector equal?
            equal: function($this, $vec) {
                var $this = Obj($this); var $vec = Obj($vec);
                return ($this.x === $vec.x && $this.y === $vec.y) ||
                       ($this.x === $vec.x && $this.y === $vec.y &&
                        $this.z === $vec.z);
            },

            // Find the intersection of 4 points
            intersect: function(a, b, c, d) {
                var val, abSlope, cdSlope, abIntercept, cdIntercept;
                abSlope = Static.slope(a, b);
                cdSlope = Static.slope(c, d);
                abIntercept = Static.slope(a, b);
                cdIntercept = Static.slope(c, d);
                val = (cdIntercept - abIntercept) / (abSlope - cdSlope);
                return new Vector(val, abSlope * val + abIntercept);
            },
            
            // Checks if a Vector is near another
            near: function($this, vec, dist) {
                return $this.dist(vec) <= dist;
            },
            
            // Set Value of Vector
            set: function ($this, x, y, z) {
                var VecArr = Vector.arr(x, y, z);
                PVector.apply($this, VecArr);
                return $this;
            },
            
            // Convert From Values to the either Objects or Arrays
            convert: function (x, y, z) {
                var arr = Vector.arr(x, y, z);
                var str = "return '{ x: ' + this.x + ', y: ' + this.y + ', z: ' + this.z + '}'";
                var obj = { x: arr[0], y: arr[1], z: arr[2], toString: Func(str) };
                return _.isArray(x) ? obj : arr;
            }
        })

        // Prototype Methods of the Vector Object
        .method(Util.alias(PVector.prototype, Chain, true),
                Util.alias(Static));
        return Vector;
    }, true);
})(); // Vector