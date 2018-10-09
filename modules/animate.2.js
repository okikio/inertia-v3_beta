(function() {
    // Inertia's Animate Module V2 [www.khanacademy.org/cs/_/--]
    Define("Animate", function() {
        var Util = require("Util"), _ = Util._, Class = require("Class"), 
            Color = require("Color"), Event = require("Event"), Fn = require("Func"), AnimArr, 
            $Math = require("Math"), Ease = require("Ease"), Anim;
            
        // List of Animate Objects
        AnimArr = [];
        var _prevTime = Date.now(), _time, _delta; // Temp. variables
        Inertia.Event.on("draw", function () {
            _time = Date.now();
            _delta = _time - _prevTime;
        
            /*for (var i = 0; i < AnimArr.length; i++) {
                if (!AnimArr[i].completed) {
                    AnimArr[i](_delta, Date.now() - AnimArr[i].start_time);
                }
            }*/
        
            _prevTime = _time;
        });
        
        var Config = {
            anim: {
                began: false, completed: false, loop: false,
                end: Fn(), update: Fn(), begin: Fn(),
                direction: 'normal', offset: 0, 
                from: {}, to: {},
                reversed: false,
                animations: [],
                autoplay: true,
                autoplay: true,
                currentTime: 0,
                paused: false,
                remaining: 0,
                startTime: 0,
                progress: 0,
                value: 0,
                speed: 1,
            },
            tween: { 
                easing: 'outElastic',
                elasticity: 500,
                duration: 1000,
                from: 0, to: 0,
                target: "",
                value: 0,
                delay: 0,
            }
        };
        
        Config.methods = function (obj, ctxt) {
            return function () {
                var $ = this; ctxt = this[ctxt];
                return _.reduce(obj, function (acc, v, i) {
                    var fn = function (val) { 
                        if (_.isFunction(v)) { $.on(i, v, this); } 
                        else { 
                            if (arguments.length === 0) { return this[i]; } 
                            else {
                                this[i] = _.isString(val) && _.isNumber(parseInt(val, 10)) ? 
                                    (i === "from" ? this.from : 0) + 
                                    parseInt(val, 10) : val; 
                            }
                        }
                        return this; 
                    };
                    acc[i] = fn.bind(ctxt);
                    acc[i].toString = fn.toString.bind(fn); 
                    return acc; 
                }, {}, ctxt);
            };
        };
        
        Anim = Class(Event, {
            anim: Config.anim,
            init: function (from, to) {
                var anim = this.anim;
                if (arguments.length === 1) 
                    { _.extend(anim, from || {}); } 
                else if (arguments.length > 1) 
                    { anim.from = from; anim.to = to; }
                    
                switch (typeof anim.from) {
                    case 'number':
                    case 'array':
                    case 'object':
                        this._AnimProgress = function (per) {
                            this.value = $Math.lerp(anim.from, anim.to, per);
                            return this;
                        };
                    break;
                    default:
                        this._AnimProgress = Fn("return null");
                        println('Animate: Start Value type was unrecognized.');
                        
                    AnimArr.push(this); 
                }
            },
            _type: function (val) {
                if (_.isColor(val)) { return "color"; }
                if (_.isArray(val) || _.isObject(val)) { return "object"; }
                if (_.isNumber(val) || parseInt(val, 10)) { return "number"; }
            },
            _animatable: function (val) {
                if (_.isColor(val)) { return "color"; }
                if (_.isArray(val) || _.isObject(val)) { return "object"; }
                if (_.isNumber(val) || parseInt(val, 10)) { return "number"; }
            },
        }, 
        Config.methods(Config.anim, "anim"));
        /*

            _toggle: Fn("this.anim.reversed = !this.anim.reversed"),
            _adjust: Fn("time", "return this.anim.reversed ? this.anim.duration - time : time"),
            _count: Fn("var anim = this.anim; if (anim.remaining && anim.remaining !== true) { anim.remaining--; } "),
            pause: function () {
                var i = AnimArr.indexOf(this);
                if (i > -1) { AnimArr.splice(i, 1); }
                this.anim.paused = true;
            },
            progress: function (time) {
                var anim = this.anim;
                var insDuration = anim.duration;
                var insOffset = anim.offset;
                var insStart = insOffset + anim.delay;
                var insCurrentTime = anim.currentTime;
                var insReversed = anim.reversed;
                var insTime = this._adjust(time);
                //   if (instance.children.length) syncInstanceChildren(insTime);
                  if (insTime >= insStart || !insDuration) {
                    if (!anim.began) {
                      anim.began = true;
                      this.emit("begin", this.value, this);
                    }
                    this.emit("run", this.value, this);
                  }
                  if (insTime > insOffset && insTime < insDuration) {
                    this._AnimProgress(insTime);
                  } else {
                    if (insTime <= insOffset && insCurrentTime !== 0) {
                      this._AnimProgress(0);
                      if (insReversed) { countIteration(); }
                    }
                    if ((insTime >= insDuration && insCurrentTime !== insDuration) || !insDuration) {
                      setAnimationsProgress(insDuration);
                      if (!insReversed) countIteration();
                    }
                  }
                  this.emit("update", this.value, this);
                if (time >= insDuration) {
                    if (anim.remaining) {
                        anim.startTime = now;
                      if (anim.direction === 'alternate') { this._toggle(); }
                    } else {
                      this.pause();
                      if (!anim.completed) {
                        anim.completed = true;
                        this.emit('complete', this.value, this); // setCallback('complete');
                      }
                    }
                    anim.lastTime = 0;
                }
                
                mode = mode || 'once'; args = Util.args(args || [], 1);
                var loopFnName = "__loop_" + mode;
        
                this.loopFn = loopFnName in this ?
                    _.extend({}, Default, this[loopFnName].apply(this, args)) :
                    Default;
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
            run: function () {
                var anim = this.anim;
                if (!anim.paused) { this.startTime = Date.now(); }
                anim.ease = _.isString(anim.ease) || _.isArray(anim.ease) ?
                    Ease.fn[anim.ease.toString().toLowerCase()] || 
                        Ease.bezier(anim.ease) : anim.ease;
               
            }
          */
    });
})(); // Animate

