(function() {
    // Inertia's Timeline Module V2 [www.khanacademy.org/cs/_/5437978872545280]
    Define(["Motion.Timeline", "Timeline"], function() {
        var _ = require("Util._"), Motion = require("Motion"); 
        // Builds on the Motion Object for timeline functionality
        return Motion.extends({
            duration: 0, children: [], 
            add: function(params, offset) {
                var settings = this.settings;
                var tween = _.extend({}, settings.tween, this.params);
                this.params = params = _.extend({}, tween, params);
                params.from = params.from || this.params.from;
                
                var dur = this.duration;
                params.autoplay = false;
                params.direction = this.direction;
                params.offset = _.isUndefined(offset) ? dur : this.RelativeVal(offset, dur);
                this.seek(params.offset, true);
                
                var ins = Motion(params);
                this.children.push(ins);
                
                var timings = this.getTimings(this.children, this.params);
                this.delay = timings.delay;
                this.endDelay = timings.endDelay;
                this.duration = timings.duration; 
                this.seek(0, true);
                this.reset();
                
                if (this.autoplay) { this.play(); }
                return this;
            },
        
            toggleDir: function() {
                this.CallSuper("toggleDir");
                _.each(this.children, function(child) {
                    child.reversed = this.reversed;
                }, this);
                return this;
            },
        
            sync: function(time) {
                _.each(this.children, function (child) {
                    if (child) { child.seek(time - child.offset, true); }
                }, this);
            },
            
            setProgress: function (engineTime) {
                this.CallSuper("setProgress", engineTime);
                var time = this.adjustTime(engineTime);
                this.reversePlayback = time < this.currentTime;
                if (this.children) { this.sync(time); }
                return this;
            },
            
            reset: function () {
                var len = this.children.length;
                this.CallSuper("reset");
                for (var i = len; i--;) { this.children[i].reset(); }
                return this;
            }
        })
        .static(_.extend({}, Motion)); // Add static to Timeline
    }, true);
})(); // Timeline