(function() {
    // Inertia's Event Emitter Module V2 [www.khanacademy.org/cs/_/5102490437058560]
    Define("Event", function() {
        var Event, _ = require("Util._"), Class = require("Class");
        require("Func");
    
        // Event Object
        return Class({
            _class: "Event", // Set Class Name
            _EventCount: 0, _Events: {}, // Event Info.
            
            // Prepare the Event
            preEvent: function(evt) {
                if (!this._Events[evt]) // List Of Event's
                    { this._Events[evt] = []; }
                return this._Events[evt];
            },
        
            // Event Application
            EventApp: function(callback, scope, event) {
                return {
                    callback: callback,
                    scope: scope || this,
                    event: event
                };
            },
        
            // Add a Listener / Function For a Given Event
            on: function(evt, callback, scope) {
                if (_.isUndefined(evt)) { return; } // If There is No Event Break
                if (!_.isArray(evt) && !_.isObject(evt)) { evt = [evt]; } // Set Evt to an Array
                _.each(evt, function($evt, key) {
                    var $Evt;
                    if (_.isObject(evt) && !_.isArray(evt)) {
                        $Evt = this.EventApp($evt, callback || this, key);
                        this.preEvent(key).push($Evt); // Set Event List
                    }
                    else {
                        $Evt = this.EventApp(callback, scope, $evt);
                        this.preEvent($evt).push($Evt); // Set Event List
                    }
                }, this);
        
                // Length Of Events
                this._EventCount = _.keys(this._Events).length;
        
                // Name Of All Event's
                this.Names = _.keys(this._Events);
                return this;
            },
        
            // Alias for the `on` method
            add: Class.get("on"),
            bind: Class.get("on"),
        
            // Add a One - Time Listener / Function For a Given Event
            once: function(evt, callback, scope) {
                var $Fn;
                if (!evt) { return; } // If There is No Event Break
                if (!_.isArray(evt) && !_.isObject(evt)) { evt = [evt]; } // Set Evt to an Array
                
                $Fn = function() {
                    this.off(evt, $Fn, scope);
                    callback.apply(scope, arguments);
                };
        
                this.on(evt, $Fn, scope);
                return this;
            },
        
            // Remove a Listener / Function For a Given Event
            off: function(evt, callback, scope) {
                if (!evt) { return; } // If There is No Event Break
                if (!_.isArray(evt) && !_.isObject(evt)) { evt = [evt]; } // Set Evt to an Array
                
                var _off = function ($evt, callback, scope) {
                    var _Evt = this.preEvent($evt);
                    if (callback) {
                        var i, app = this.EventApp(callback, scope, $evt);
                        _.each(_Evt, function (val, _i) {
                            if (_.isEqual(val, app)) { i = _i; }
                        }, this);
                        if (i > - 1) { _Evt.splice(i, 1); }
                    } else { delete this._Events[$evt]; }
                }.bind(this);
                
                _.each(evt, function($evt, key) {
                    if (_.isObject(evt) && !_.isArray(evt)) {
                        _off(key, $evt, scope);
                    } else { _off($evt, callback, scope); }
                }, this);
                return this;
            },
        
            // Alias for the `off` method
            remove: Class.get("off"),
            unbind: Class.get("off"),
        
            // List's All Listeners / Function's For a Given Event
            listeners: function(evt) {
                var $Evt = this.preEvent(evt);
                if (!$Evt) { return []; }
                if (!$Evt.callback) { return $Evt.callback; }
                return _.map($Evt, function(val) { return val; }, this);
            },
        
            // Alias for the `listeners` method
            callback: Class.get("listeners"),
        
            // Event Check
            check: function(evt) {
                var result;
                if (_.isArray(evt)) {
                    for (var i = 0; i < evt.length; i++) {
                        result = _.keys(this._Events).includes(evt[i]);
                    }
                } else { result = _.keys(this._Events).includes(evt); }
                return result;
            },
        
            // Call All Function(s) Within An Event
            emit: function(evt) {
                var $Evt, arg = [].slice.call(arguments, 1);
                if (!evt) { return; } // If There is No Event Break
                if (!_.isArray(evt)) { evt = [evt]; } // Set Evt to an Array
                evt.forEach(function($evt) {
                    $Evt = this.preEvent($evt);
                    _.each($Evt, function(_evt) {
                        var $arg = arg;
                        if (_evt.callback.argNames &&
                            _evt.callback.argNames()[0] === "$evt")
                            { $arg = [_evt].concat(arg); }
                        _evt.callback.apply(_evt.scope, $arg);
                    }, this);
                }, this);
                return this;
            },
        
            // Alias for the `emit` method
            fire: Class.get("emit"),
            trigger: Class.get("emit"),
            
            // Clear
            clear: Class.get("init")
        });
    });
})(); // Event