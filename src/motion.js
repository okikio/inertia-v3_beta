(function() {
    // Inertia's Motion Module V2 [www.khanacademy.org/cs/_/--]
    // Based on animejs [animejs.com]
    Define("Motion", function() {
        var Util = require("Util"), Class = require("Class"), Event = $in.EventEmitter,
            Ease = require("Ease"), _ = Util._, Static = {}, id = 0; // Used in identifing Motion Objects
        return Class(Event, {
            _class: "Motion", // Set Class Name
            ver: "2.0.0", speed: 1, _startTime: 0, _lastTime: 0, _now: 0, 
            init: function (params, reset, _id) {
                this.params = (params = params || {});
                var settings = this.settings || Static.settings;
                
                // Remove any undefined parameters (for settings)
                var instance = this.replaceObj(settings.default, params);
                var tween = this.replaceObj(settings.tween, params);
                
                var animatables = this.getAnimatables(params.from);
                var props = this.FormatProps(tween, params);
            
                var animations = this.getAnimations(animatables, props);
                var timings = this.getTimings(animations, tween);
                
                _.extend(this, {
                    id: this.id ? this.id : id,
                    animatables: animatables,
                    animations: animations,
                    duration: timings.duration,
                    delay: timings.delay,
                    endDelay: timings.endDelay
                }, instance);
        
                if (_.isUndefined(reset) || reset) { this.reset(); }
                if (!_id) { id ++; }
                
                if (this.autoplay) { this.play(); } 
            },
            
            set: function (params, reset) { 
                var args = [_.extend({}, this.params, params), reset];
                return this.init.apply(this, args); 
            }, 
            
            toggleDir: function () {
                var dir = this.direction;
                if (dir !== "alternate") 
                    { this.direction = dir !== 'normal' ? 'normal' : 'reverse'; }
                this.reversed = !this.reversed;
                return this;
            },
            
            adjustTime: function (time) {
                return this.reversed ? this.duration - time : time;
            },
            
            resetTime: function () {
                this._lastTime = this.adjustTime(this.currentTime) / this.speed;
                this._startTime = 0; return this;
            },
            
            setAnimProgress: function (time) {
                var i = 0, anims = this.animations;
                var animsLen = anims.length;
                var fn = function (t) { return (time < t.end); };
                while (i < animsLen) {
                    var anim = anims[i], tweens = anim.tweens;
                    var animatable = anim.animatable;
                    
                    var tweenLen = tweens.length - 1;
                    var tween = tweens[tweenLen];
                    
                    // Only check for keyframes if there is more than one tween
                    if (tweenLen) { tween = _.filter(tweens, fn)[0] || tween; }
                    
                    var elapsed = time - tween.start - tween.delay;
                    elapsed = constrain(elapsed, 0, tween.duration) / tween.duration;
                    
                    var eased = isNaN(elapsed) ? 1 : tween.easing(elapsed);
                    var strs = tween.to.strings, round = tween.round;
                    var toNumsLen = tween.to.numbers.length;
                    var nums = [], progress;
                    for (var n = 0; n < toNumsLen; n++) {
                        var from = tween.from.numbers[n] || 0;
                        var to = tween.to.numbers[n];
                        var value = from + ((to - from) * eased);
                        if (round) {
                            if (!(tween.isColor && n > 2)) {
                                value = round(value * round) / round;
                            }
                        }
                        nums.push(value);
                    }
                    
                    // Manual Array.reduce for better performances
                    var strsLen = strs.length;
                    if (!strsLen) { progress = nums[0]; }
                    else {
                        progress = strs[0];
                        for (var s = 0; s < strsLen; s++) {
                            var b = strs[s + 1], n = nums[s];
                            if (!isNaN(n)) { progress += n + b; }
                        }
                    }
                    
                    this.ProgVal[anim.type](animatable, anim, progress);
                    this.value = animatable.target;
                    anim.currentValue = progress;
                    i++;
                }
                return this;
            },
            
            setFn: function (cb) {
                if (this[cb]) { this[cb](this); }
                this.emit(cb, this); 
                return this;
            },
            
            iterate: function () {
                if (this.remaining && this.remaining !== true)
                    { this.remaining--; }
                return this;
            },
            
            setProgress: function (engineTime) {
                var dur = this.duration, delay = this.delay;
                var endDelay = dur - this.endDelay;
                var time = this.adjustTime(engineTime);
                this.progress = constrain((time / dur) * 100, 0, 100);
                if (!this.began && this.currentTime > 0) {
                    this.began = true;
                    this.setFn('begin'); 
                    this.setFn('loopBegin');
                }
                
                if (time <= delay && this.currentTime !== 0) 
                    { this.setAnimProgress(0); }
                    
                if ((time >= endDelay && this.currentTime !== dur) || !dur) 
                    { this.setAnimProgress(dur); }
                    
                if (time > delay && time < endDelay) {
                    if (!this.changeBegan) {
                        this.changeBegan = true;
                        this.changeCompleted = false;
                        this.setFn('changeBegin');
                    }
                    this.setFn('change');
                    this.setAnimProgress(time);
                } else {
                    if (this.changeBegan) {
                        this.changeCompleted = true;
                        this.changeBegan = false;
                        this.setFn('changeComplete');
                    }
                }
                
                this.currentTime = constrain(time, 0, dur);
                if (this.began) { this.setFn('update'); }
                if (engineTime >= dur) {
                    this._lastTime = 0; this.iterate();
                    if (this.remaining) {
                        this._startTime = this._now;
                        this.setFn('loopComplete');
                        this.setFn('loopBegin');
                        if (this.direction === 'alternate')
                            { this.toggleDir(); }
                    } else {
                        this.paused = true;
                        if (!this.completed) {
                            this.completed = true;
                            this.setFn('loopComplete');
                            this.setFn('complete');
                        }
                    }
                }
                return this;
            },
            
            reset: function() {
                var dir = this.direction;
                _.extend(this, {
                    began: false, changeBegan: false, completed: false,
                    changeCompleted: false, paused: true, 
                    currentTime: 0, progress: 0,
                    reversed: dir === 'reverse',
                    remaining: this.loop
                });
                
                if (this.reversed && this.loop !== true ||
                    (dir === 'alternate' && this.loop === 1))
                        { this.remaining++; }
                return this.setAnimProgress(0);
            },
            
            tick: function(t) {
                this._now = t;
                if (!this._startTime) { this._startTime = this._now; }
                return this.setProgress((this._now + (this._lastTime - this._startTime)) * this.speed);
            },
        
            seek: function(val, spec) { 
                // Spec is for scaling the value given to a very specific point in time
                var time = val * (spec ? 1 : this.duration);
                return this.setProgress(this.adjustTime(time)); 
            },
        
            pause: function() {
                this.paused = true; this.resetTime();
                return this;
            },
        
            play: function() {
                var $this = this;
                if (!this.paused) { return this; }
                if (this.completed) { this.reset(); }
                this.paused = false; this.resetTime();
                $in.draw(function () {
                    var now = $in.global.performance.now();
                    if (!$this.paused) { $this.tick(now); }
                });
                return this;
            },
            
            toggle: function () {
                if (this.paused) { this.play(); } 
                else { this.pause(); }
                return this;
            },
            
            reverse: function() {
                this.toggleDir();
                this.resetTime();
                return this;
            },
        
            restart: function() {
                this.reset(); this.play();
                return this;
            },
        }, Static = {
            // All settings
            settings: {
                default: {
                    changeComplete: null,
                    direction: 'normal',
                    loopComplete: null,
                    changeBegin: null,
                    loopBegin: null,
                    complete: null,
                    autoplay: true,
                    update: null,
                    change: null,
                    begin: null,
                    offset: 0, // For timeline alone
                    from: {},
                    speed: 1,
                    loop: 1,
                    to: {},
                },
                tween: {
                    easing: 'linear',
                    duration: 1000,
                    endDelay: 0,
                    delay: 0,
                    round: 0
                }
            },
            
            // Is property a setting?
            isSetting: function (k) {
                var def = this.settings.default, anim = this.settings.tween;
                return !_.has(def, k) && !_.has(anim, k) && k !== 'keyframes';
            },
            
            // Replace only pre-existing values in an Object
            replaceObj: function (o1, o2) {
                return _.reduce(o1, function (acc, v, i) { 
                    acc[i] = _.has(o2, i) ? o2[i] : o1[i]; 
                    return acc;
                }, _.extend({}, o1));
            },
            
            // Convert any value to an Array
            toArray: function (o) { return _.isArray(o) ? o : [o]; },
            
            // Convert the value given into an Easing function
            FormatEase: function(val) {
                var match = /\(([^)]+)\)/.exec(val);
                var _args = match ? match[1].split(',').map(function(p) {
                    return parseFloat(p);
                }) : [];
                var ease = (val + "").toLowerCase().split("(")[0];
                return function (t) {
                    var fn = _.isFunction(val) ? val : 
                        (_.isArray(val) ? Ease.bezier(val) : Ease.fn[ease]);
                    return (fn).apply({}, [t].concat(_args));
                };
            },
            
            // Finds ending values given the starting value and the values relative from the starting values (E.g. *Start* + *Relative value* or 10 + 5)
            RelativeVal: function (to, from) {
                var operator = /^(\*|\+|\-|\/)\=?/.exec(to);
                if (!operator) { return to; }
                var a = parseFloat(from.toString());
                var b = parseFloat(to.toString().replace(operator[0], ''));
                var sign = operator[0][0];
                return (0, eval) (a + sign + b);
            },
            
            // Converts functions into useable values
            FnVal: function (val, arg) { 
                return Util.FnVal(val, [arg.target, arg.id, arg.total]); 
            },
            
            // Uncover info. about value given as an Object
            inspect: function(val) {
                var rgx = /-?\d*\.?\d+/g;
                var _val = val + "";
                return {
                    original: _val,
                    numbers: _val.match(rgx) ? _val.match(rgx).map(Number) : [0],
                    strings: _.isString(val) ? _val.split(rgx) : []
                };
            },
            
            // Creates an Array of Target
            Targets: function (targets) { 
                return _.uniq(!_.isUndefined(targets) ? _.flatten( 
                    _.isArray(targets) ? targets.map(this.toArray) : this.toArray(targets)
                ) : []);
            },
            
            // Get all animatable properties
            getAnimatables: function (targets) {
                var parsed = this.Targets(targets);
                return parsed.map(function (t, i) {
                    return { target: t, id: i, total: parsed.length };
                });
            },
            
            // Creates an Array of Tweens (A tween is a change between two values)
            Tweens: function (val, tweenSettings) {
                var setting = _.extend({}, tweenSettings);
                if (_.isArray(val)) {
                    var isFromTo = (val.length === 2 && !_.isObject(val[0]));
                    if (!isFromTo) {
                        // Duration divided by the number of tweens
                        if (!_.isFunction(tweenSettings.duration)) 
                            { setting.duration = tweenSettings.duration / val.length; }
                    } else { 
                        // Transform [from, to] values shorthand to a valid tween value
                        val = { value: val }; 
                    }
                }
                
                return this.toArray(_.isObject(val) && val.value || val).map(function (v, i, valArr) {
                    // Use path object as a tween value
                    var obj = _.isObject(v) && !_.isArray(v) && 
                             !_.isFunction(v) ? v : { value: v };
                    
                    // Default delay value should only be applied to the first tween
                    if (_.isUndefined(obj.delay)) 
                        { obj.delay = !i ? tweenSettings.delay : 0; }
                        
                    // Default endDelay value should only be applied to the last tween
                    if (_.isUndefined(obj.endDelay)) { 
                        obj.endDelay = i === valArr.length - 1 ? tweenSettings.endDelay : 0; 
                    }
                    return obj;
                }).map(function (k) { return _.extend({}, setting, k); });
            },
            
            // Format `keyFrames` for multiple tweens affecting multiple properties
            Keyframes: function (keyframes) {
                return _.chain(keyframes)
                    .map(_.keys).flatten()
                    .filter(this.isSetting).uniq()
                    .reduce(function (acc, name) {
                        acc[name] = keyframes.map(function(frame) {
                            return _.reduce(frame, function(newFrame, val, prop) {
                                if (this.isSetting(prop)) { 
                                    if (prop === name) 
                                        { newFrame.value = val; } 
                                } else { newFrame[prop] = val; }
                                return newFrame;
                            }, {}, this);
                        }, this);
                        return acc;
                    }, {}, this).value();
            },
        
            // Create an Array filled with Properties to animate
            FormatProps: function (_settings, params) {
                var _from = params.from, _to = params.to, frames = params.keyframes;
                if (frames) { _to = params.to = _.extend({}, _to, this.Keyframes(frames)); } 
                
                return (_.isObject(_from) || _.isArray(_from)) ? 
                    // For Object and Array use cases
                    _.reduce(_to, function (arr, val, prop) {
                        return arr.concat({
                            name: prop,
                            tweens: this.Tweens(val, _settings)
                        });
                    }, [], this) : 
                    // For non Object use cases
                    [{ tweens: this.Tweens(_to, _settings) }];
            }, 
            
            // Add the ability to change the delay & duration of a property
            ParseVal: function (tween, animatable) {
                return _.reduce(tween, function (obj, val, i) {
                    var _val = this.FnVal(val, animatable); 
                    if (_.isArray(_val)) {
                        _val = _.map(_val, function (v) { 
                            return this.FnVal(v, animatable); 
                        }, this);
                        
                        // Fix the start point if no other values in an Array
                        if (_val.length === 1) { _val = _val[0]; }
                    }
                    
                    obj[i] = /delay|duration/.test(i) ? parseFloat(_val) : _val;
                    return obj;
                }, {}, this);
            },
            
            // Add extra details to Tweens (easing, relative value support for `to` and `from`, delay, and duration, and compiles it)
            FormatTweens: function (prop, animatable) {
                var prev; // Previous Tween
                return prop.tweens.map(function (t) {
                    var tween = this.ParseVal(t, animatable);
                    var tweenVal = tween.value;
                    
                    var to = this.FnVal(_.isArray(tweenVal) ? tweenVal[1] : tweenVal, animatable);
                    var origVal = animatable.target[prop.name] || 0;
                    var prevVal = prev ? prev.to.original : origVal;
                    var from = _.isArray(tweenVal) ? tweenVal[0] : prevVal;
                    
                    if (_.isUndefined(to)) { to = prevVal; }
                    tween.from = this.inspect(from);
                    tween.to = this.inspect(this.RelativeVal(to, from));
                    
                    // Causes tweens to occur one after the other
                    tween.start = prev ? prev.end : 0;
                    tween.end = tween.start + tween.delay + tween.duration + tween.endDelay;
                    tween.easing = this.FormatEase(tween.easing);
                    return (prev = tween);
                }, this);
            },
            
            // Animation types and how to animate them
            ProgVal: {
                native: function (t, p, v) { return (t.target = v); },
                object: function (t, p, v) { return (t.target[p.property] = v); }
            },
            
            // Create animations for each property, using tweens
            animate: function (animatable, prop) {
                var tweens = this.FormatTweens(prop, animatable);
                var lastTween = tweens[tweens.length - 1];
                var target = animatable.target;
                return _.extend({
                    type: _.isObject(target) || _.isArray(target) ? 
                            "object" : "native", // Animation type
                    animatable: animatable,
                    tweens: tweens,
                    duration: lastTween.end,
                    delay: tweens[0].delay,
                    endDelay: lastTween.endDelay
                }, !_.isUndefined(prop.name) ? { property: prop.name } : {});
            },
            
            // Crate a list of animations
            getAnimations: function (animatables, properties) {
                return _.filter(_.flatten(
                    animatables.map(function (animatable) {
                        return properties.map(function (prop) {
                            return this.animate(animatable, prop);
                        }, this);
                    }, this)
                ), function (a) { return !_.isUndefined(a); });
            },
            
            // Compute the best delay, duration, and endDelay to use for animation
            getTimings: function (animations, tweenSettings) {
                var animLen = animations.length, tween = tweenSettings;
                var _map = function (val) {
                    // `a.offset` is meant for the timeline module and allows for chaining animations one after the other
                    var Fn = Object.constructor("a", "return (a.offset ? a.offset : 0) + " + val);
                    return animations.map(Fn);
                };
                var dur = animLen ? _.max(_map("a.duration")) : tween.duration;
                return {
                    endDelay: animLen ? 
                        dur - _.max(_map("a.duration - a.endDelay")) : tween.endDelay,
                    delay: animLen ? _.min(_map("a.delay")) : tween.delay,
                    duration: dur
                };
            },
        })
        
        // Static Method
        .static(Static, {
            // Stagger is a function that allows you to animate multiple elements with overlapping action
            stagger: function (val, params) {
                params = params || {};
                params.axis = params.axis || "both";
                var dir = params.direction || 'normal';
                var easing = params.easing ? Static.FormatEase(params.easing) : null;
                var axis = _.isUndefined(params.axis) ? "both" : params.axis, 
                    grid = params.grid;
                var fromIndex = params.from || 0;
                var fromFirst = fromIndex === 'first';
                var fromCenter = fromIndex === 'center';
                var fromLast = fromIndex === 'last';
                var isRange = _.isArray(val);
                var val1 = isRange ? parseFloat(val[0]) : parseFloat(val);
                var val2 = isRange ? parseFloat(val[1]) : 0;
                var start = params.start || 0 + (isRange ? val1 : 0);
                var values = [], maxValue = 0;
                return function (el, i, t) {
                    if (fromFirst) { fromIndex = 0; }
                    if (fromCenter) { fromIndex = (t - 1) / 2; }
                    if (fromLast) { fromIndex = t - 1; }
                    if (!values.length) {
                        for (var index = 0; index < t; index++) {
                            if (!grid) {
                                values.push(abs(fromIndex - index));
                            } else {
                                var fromX = !fromCenter ? fromIndex % grid[0] : (grid[0] - 1) / 2;
                                var fromY = !fromCenter ? floor(fromIndex / grid[0]) : (grid[1] - 1) / 2;
                                var toX = index % grid[0];
                                var toY = floor(index / grid[0]);
                                var distAxis = {
                                    x: -(fromX - toX), y: -(fromY - toY),
                                    both: dist(fromX, fromY, toX, toY)
                                };
                                values.push(distAxis[axis]);
                            }
                            maxValue = _.max(values);
                        }
                        if (easing) {
                            values = values.map(function (val) {
                                return easing(val / maxValue) * maxValue;
                            });
                        }
                        if (dir === 'reverse') {
                            values = values.map(function (val) {
                                return axis ? (val < 0 ? val * -1 : -val) : abs(maxValue - val);
                            });
                        }
                    }
                    var spacing = isRange ? (val2 - val1) / maxValue : val1;
                    return start + (spacing * (round(values[i] * 100) / 100));
                };
            }
        });
    });
})(); // Motion