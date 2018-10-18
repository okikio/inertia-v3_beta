(function() {
    // Inertia's Animate Module V2 [www.khanacademy.org/cs/_/--]
    Define("Animate", function() {
        var Util = require("Util"), _ = Util._, Class = require("Class"),
            Default, Event = require("Event"), Fn = require("Func"), AnimArr,
            $Math = require("Math"), Ease = require("Ease");
            
        // List of Animate Objects
        AnimArr = [];
        
        // Default Loops
        Default = {
            complete: Fn("cb", "return cb()"),
            progress: Fn("x", "return x")
        };
        
        var _prevTime = Date.now(), _time, _delta; // Temp. variables
        Inertia.Event.on("draw", function () {
            _time = Date.now();
            _delta = _time - _prevTime;
        
            for (var i = 0; i < AnimArr.length; i++) {
                if (!AnimArr[i].completed) {
                    AnimArr[i](_delta, Date.now() - AnimArr[i].start_time);
                }
            }
        
            _prevTime = _time;
        });

        // Animate Object [Based on Between.js - https://github.com/sasha240100/between.js]
        return Class(Event, {
            end: 0, start: 0,
            localTime: 0, duration: 1000,
            paused: false,
            loopFn: Default,
            loopMode: 'once',
            completed: false,
            ease: Fn("x", "return x"),
            init: function (strt, end) {
                this.value = _.isArray(strt) ? [].concat(strt) :
                        (_.isObject(strt) ? _.extend({}, strt) : strt);
                this.start = strt; this.end = end;
                this.start_time = Date.now();
                switch ((this.type = typeof strt)) {
                    case 'number':
                    case 'array':
                    case 'object':
                        this._updateValue = function (per) {
                            this.value = $Math.lerp(this.start, this.end, per);
                            return this;
                        };
                    break;
                    default:
                        this._updateValue = Fn("return null");
                        println('Animate: Start Value type was unrecognized.');
                }
            
                AnimArr.push(this.update.call(this));
            },
            
            isPaused: Class.get("paused"),
            easing: function (eas) {
                this.ease = _.isString(eas) || _.isArray(eas) ?
                    Ease.fn[eas.toString().toLowerCase()] || Ease.bezier(eas) : eas;
                return this;
            },
            time: Fn("dur", "this.duration = dur; return this"),
            pause: function () {
                this.emit('pause', this.value, this, _delta);
                this.paused = true;
                return this;
            },
            play: function () {
                this.emit('play', this.value, this, _delta);
                this.paused = false;
                return this;
            },
            loop: function (mode, args) {
                mode = mode || 'once'; args = Util.args(args || [], 1);
                var loopFnName = "__loop_" + mode;
        
                this.loopFn = loopFnName in this ?
                    _.extend({}, Default, this[loopFnName].apply(this, args)) :
                    Default;
                return this;
            },
            update: function () {
                return function (delta, time) {
                    if (this.completed || this.paused) { return; }
                    if (this.localTime === 0) {
                        this.emit('start', this.value, this);
                    }
        
                    this._updateValue(this.ease( // Progress
                        this.loopFn.progress(
                            Math.min(1, (time || this.localTime) / this.duration)
                        )
                    ));
                    
                    this.emit('update', this.value, this, delta);
                    if (this.localTime >= this.duration) {
                        this.loopFn.complete(function () {
                            this.completed = true;
                            this.emit('complete', this.value, this);
                        });
                    }
                    this.localTime += delta;
                }.bind(this);
            },
        
            __loop_repeat: function (times) {
                var maxTimes = times; this.times = 0;
                return {
                    complete: function (callback) {
                        this.localTime = 0;
                        if (Number.isInteger(maxTimes) &&
                            ++this.times === maxTimes) { callback.call(this); }
                        else if (!Number.isInteger(maxTimes))
                            { ++this.times; }
                    }.bind(this)
                };
            },
            
            __loop_bounce: function (times) {
                var maxTimes = times, bounceDir = 1;
                this.times = 0;
                return {
                    complete: function (callback) {
                        this.localTime = 0; bounceDir = -bounceDir;
                        if (Number.isInteger(maxTimes) &&
                            ++this.times === maxTimes) { callback.call(this); }
                        else if (!Number.isInteger(maxTimes))
                            { ++this.times; }
                    }.bind(this),
                    progress: function (x)
                        { return bounceDir > 0 ? x : 1 - x; },
                };
            },
        })
        
        .static({
            new: function ()
                { return Fn.new(this, arguments); },
            default: Default
        });
    });
})(); // Animate

