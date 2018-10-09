(function() {
    // Inertia's Key Module V2 [www.khanacademy.org/cs/_/5009088521469952]
    Define("Key", function() {
        var UIEvent = require("UIEvent"), Event = Inertia.Event,
            Key = UIEvent("Key"), _ = require("Util._"),
            Emit, Prefix, Special;
            
        // A Map of Special Keys & Characters with all Their Keys & Key Codes
        // Based on MouseTrap [https://github.com/ccampbell/mousetrap/blob/master/mousetrap.js]
        Special = {
            // Map of Special Key Codes & Keys
            Key: {
                "backspace": "8",
                "pagedown": "34",
                "capslock": "20",
                "pageup": "33",
                "right": "39",
                "space": "32",
                "shift": "16",
                "enter": "13",
                "meta": "91",
                "down": "40",
                "left": "37",
                "home": "36",
                "ctrl": "17",
                "del": "46",
                "ins": "45",
                "end": "35",
                "esc": "27",
                "alt": "18",
                "tab": "9",
                "up": "38"
            },
            
            // Different Naming for Keys
            Alias: {
                'option': 'alt',
                'command': 'meta',
                'return': 'enter',
                'escape': 'esc',
                'plus': '+',
            }
        };
    
        // Event Object
        Key = UIEvent("Key");
    
        // Define Updating, Initialized, Key Properties
        Object.defineProperties(Key, {
            // Are Keyboard Events Disabled
            Disabled: { value: false },
    
            // Key Is Pressed
            Press: {
                get: function() { return !this.Disabled && keyIsPressed; }
            },
    
            // Key Code of the Current Key Being Pressed
            Code: {
                get: function() {
                    return !this.Disabled && (key.code === CODED ? keyCode : key.code);
                }
            },
    
            // Current Key Being Pressed
            Btn: { get: function() { return !this.Disabled && key; } },
        });
    
        // Key Letter Properties
        _.each(_.range(30, 125), function(num) {
            // Create Each Key
            Key[String.fromCharCode(num)] = this.Btn === num;
            
            // Store All Keys And Their Key Codes
            Special.Key[String.fromCharCode(num)] = num;
        }, Key);
    
        // List of all Event Names
        Key.EventList = [];
        
        // Special Keys
        Key.Key = Special.Key;
    
        // List of Keys Pressed as KeyCode or as a String
        Key.List = [].concat(Key.ListStr = []);
    
        // Emit Set
        Emit = function(evt, fn) {
            // Add Event Names to List
            Key.EventList.push(evt);
            return function(e) {
                if (!Key.Disabled) {
                    (fn || function() {}).apply(Key, arguments);
                    Key.emit.apply(Key, [evt, e]);
                }
            };
        };
        
        // Change Array of Key Name's to KeyCodes
        Key.toCode = function (_key) {
            var aliasKey = _.keys(Special.Alias);
            var keyMap = _.keys(Special.Key);
            var arr = _.isArray(_key) ? _key : (_key || "").split(" ");
            return _.reduce(arr, function (acc, i) {
                var val = i;
                if (aliasKey.includes(i))
                    { val = Special.Key[Special.Alias[i]]; }
                else if (keyMap.includes(i))
                    { val = Special.Key[i]; }
                else if (_.isNumber(Number(i)) && Number(i) > 9)
                    { val = i; }
                acc.push(Number(val));
                return acc;
            }, []).sort();
        };
        
        // Check is Certain Key are being Pressed
        Key.Equal = function (a, b, notcode) {
            return _.isEqual(Key.toCode(a), Key.toCode(b));
        };
        
        // Checks for Which Keys Are Being Pressed
        Key.onBind = function (_key, fn) {
            return Key.on("Press", function () {
                if (Key.Equal(_key, Key.List, true)) {
                    return (fn || function () {}).apply(this, arguments);
                }
            });
        };
    
        // Set Prefix
        Prefix = "onKey";
    
        // Emit Key Events
        Event.on(Prefix + "Type", Emit("Type"), Key);
        Event.on(Prefix + "Release", Emit("Release", function() {
            Key[Key.Code] = Key[key.toString()] = false;
            Key.ListStr = Inertia.Key.ListStr;
            Key.List = Inertia.Key.List;
        }), Key);
    
        Event.on(Prefix + "Press", Emit("Press", function() {
            Key[Key.Code] = Key[key.toString()] = true;
            Key.ListStr = Inertia.Key.ListStr;
            Key.List = Inertia.Key.List;
        }), Key);
        return Key;
    });
})(); // Key
