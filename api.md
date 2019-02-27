<h1 align="center">
  Inertia.js
</h1>

<h4 align="center">- A JS creators kit -</h4>

<p align="center">
  <a href="#getting-started">Getting started</a>&nbsp;|&nbsp;<a href="#table-of-content">Table of content</a>&nbsp;|&nbsp;<a href="#demos-and-examples">Demos and examples</a>&nbsp;
</p>

## Getting started
`inertia.js` is a module packaging, and sharing software. It's goal is to modularize chunks of code for easy updating and upgrading of software. I developed it for quick and sweet programming without having to search or create some crucial tools. 

#### Download
Depending on the module package you which to use, go into the compile folder, open and copy the code from the module compiled file (it has all the dependencies already there for use, to get a better understanding of each module read further).

#### Usage
`Inertia.js` can be called by using this:  
```javascript
...
Inertia.Manager.ready(function () {
    /* code here */
}).loop(100);
```
You put this after you have posted the library into your workspace. What this is doing is asyncronously loading the modules for easy on the machine loading. The `Inertia` object can also be called with the alias `$in` and the `Inertia.Manager` Object (Class) can be called using the alias `$in.mgr` so the code above can also be written as:
```javascript
...
$in.mgr.ready(function () {
    /* code here */
}).loop(100);
```
The ```}).loop(100);``` details the rate at which modules should be loaded during runtime e.g. loading a module every second and how the modules are loaded (syncronously or asyncronously) otherwise known as (all at once or once at a time). For more info: [Inertia](#inertia).

## Table of content
* [Inertia](#inertia)
* [Core](#core)
* [Util](#util)
* [Function](#function)
* [Object](#object)
* [Math](#math)
* [String](#string)
* [Class](#class)
* [Vector](#vector)
* [Size](#size)
* [Color](#color)
* [Ease](#ease)
* [Event](#event)
* [UIEvent](#uievent)
* [Mouse](#mouse)
* [Key](#key)
* [Touch](#touch)
* [Async](#async)
* [Accum](#accum)
* [Range](#range)
* [Error](#error)
* [Motion](#motion)
* [Timeline](#timeline)


## Inertia
`inertia.js` has many built in modules, designed to make other modules work effectively. The most important part of `inertia` is the **Module** component which allows for it to be built on top of. That is what allows for accessing modules, as well as creating modules. 

#### Methods & Properties
##### $Modules - [Array]
An [Array] that stores all modules created.

##### $Required ($req) - [Array]
Displays all modules missing in order to make `inertia` work
    
##### toArray  - [Function]
Converts a String into an Array, based on specific values. Meant for 
turning Strings into Arrays of little paths.
* ###### Params
    * **[Array | String]** val - Value to convert 

* ###### Return
    * **[Array]** Converted value

* ###### Example
    ```javascript
    $in.toArray("obj.key.val") // ["obj", "key", "val"]
    ```

##### isDef - [Function]
Check if a value is defined.
* ###### Params
    * **[Any]** val - Value to check

* ###### Return
    * **[Boolean]** Whether `val` is defined

* ###### Example
    ```javascript
    $in.isDef("Defined") // true
    ```

##### Find - [Function]
Utility method to get and set Objects that may or may not exist.
* ###### Params
    * **[String | Array]** path - Path to follow in an Object
    * **[Object]** obj - Object to find path in

* ###### Return
    * **[Any | \*Object]** If value exists at path return value at path else return empty Object

* ###### Example
    ```javascript
    var obj = {
        x: {
            y: "z"
        },
        a: {}
    };
    $in.Find("a.b", obj); // {}
    $in.Find("x.y", obj); // "z"
    ```

##### global (window) - [Object]
Window Object
 
##### canvas (PJS | pjs) - [Object]
The Processing JS Object

##### EventEmitter (evtemit) - [Object]
This Object expose an `evtemit.on()` function that allows one or more functions to be attached to named events emitted by the object. When the `EventEmitter` object emits an event, all of the functions attached to that specific event are called.
* ##### eventCount - [Number]
    The total [Number] of events
* ##### _events - [Object]
    Stores all events 
* ###### _emit - [Array]
    Stores events set to be Emitted
* ##### on - [Function]
    Add a Listener / Function For a Given Event
    * ###### Params
        * **[String | Array | Object]** evt - The name of the event being listened for
        * **[Function]** callback - The event handler function
            ###### Params
            * *(Specific)* **[Object]** $evt - If the callback has `$evt` as one of the parameters this will happen
            * **[Any]** .... - Any Argument given in the `.emit` method appear has parameters here
        * **[Object]** scope - The context for the event handler function
    * ###### Return
        * **[Object]** Return the `EventEmitter` Object, allows other methods to be chained to this method
    
    * ###### Example
        ```javascript
        var obj = { a: "b" };
        var evt = $in.evtemit();
        
        // Specifically `$evt` nothing else works
        evt.on("event", function ($evt) { 
            println(this.a + " Cool"); // "b Cool"
            println($evt); // { callback: ..., scope: ...,  event: ...}
        }, obj);
        ....
        ```

* ##### emit - [Function]
    Calls each of the listeners registered for a named event, in the order they were registered, passing the supplied arguments to each.
    * ###### Params
        * **[String | Array | Object]** evt - The name of the event being emitted for
        * **[Any]** .... - Any Argument given here is passed on to the `.on` method listeners (Functions)
    * ###### Return
        * **[Object]** Return the `EventEmitter` Object, allows other methods to be chained to this method
    
    * ###### Example
        ```javascript
        var evt = $in.evtemit();
        evt.emit("event", 2);
        ```
    
##### Async - [Object]
This Object allows for loading Functions one after the other with a certain amount of time allocated for each Function. Meant for loading really big module's while not slowing the program to a crawl.
* ###### Constructor - [Function]
    * ###### Params
        * **[Number]** rate - Sets the rate at which Functions are loaded
* ##### tasks - [Array]
    List of all Functions to be called
* ##### indx - [Number]
    Current index when calling a Function
* ##### rate - [Number]
    Rate at which to call the Functions
* ##### progress - [Number]
    The progress of loading the Function from 0 to 100
* ##### complete - [Boolean]
    Whether the progress is 100 or not
* ##### readyFn - [Function]
    What to do after the loading of the Functions are done
* ##### loadFn - [Function]
    What to do during the loading of the Functions
* ##### errFn - [Function]
    What to do if there is an error whilie loading the Functions
    * ###### Params
        * **[Object]** e - The error Object containing the error message
        
* ###### setRate - [Function]
    Sets the rate at which Functions are loaded
    * ###### Params
        * **[Object]** rate - The rate at which Functions are loaded
    * ###### Return
        * **[Object]** Return the `Async` Object, allows other methods to be chained to this method
        
* ##### setExternal - [Function]
    Set's how the Functions load, once at a time or all at once. This was designed for development quick addition to code and a quick view for error fixes. When the first argument is set to true it allows for any Functions loaded after `.loop` to affect the code else if loaded one by one everything loaded will only affect the `.ready` callback and only that.
    * ###### Params
        * **[Boolean]** external - Whether the loaded Functions will affect the code after `.loop`
    * ###### Return
        * **[Object]** Return the `Async` Object, allows other methods to be chained to this method
     
* ##### then - [Function]
    Adds a Function to the `.task` Array
    * ###### Params
        * **[String]** module - The name of the module or Function being added to `.task`
        * **[Function]** fn - The Function to add to the `.task` Array
    * ###### Return
        * **[Object]** Return the `Async` Object, allows other methods to be chained to this method
    
    * ###### Example
        ```javascript
        var mgr = $in.Async();
        mgr.then("Cool", function () {
            println("Yeah");
        });
        ...
        ```

* ##### [error, ready]  - [Function]
    They do the same thing but for different properties the `.error` Function affects `.errFn` while `.ready` Function affects `.readyFn`. They both set each property to the Function given
    * ###### Params
        * **[Function]** fn - The Function to set either `.errFn` or `readyFn`
    * ###### Return
        * **[Object]** Return the `Async` Object, allows other methods to be chained to this method
    
    * ###### Example
        ```javascript
        var mgr = $in.Async();
        mgr.error(function (e) {
            println(e.message); // Error ...
        }).ready(function () {
            println("Awesome); // When fixed "Awesome"
        });
        ...
        ```

* ##### thruLoop - [Function]
    Changes the value of `.loopThru` which basically asks whether it should loop through the `.tasks` Array 
    * ###### Params
        * **[Boolean]** thru - Should loop go through
    * ###### Return
        * **[Object]** Return the `Async` Object, allows other methods to be chained to this method

* ##### run - [Function]
    Runs the loop through the `.tasks` Array
    * ###### Return
        * **[Object]** Return the `Async` Object, allows other methods to be chained to this method
     
* ##### loop - [Function]
    Starts the loop
    * ###### Params
        * **[Number]** rate -  Rate at which to load each Function
        * **[Boolean]** external -  Whether the loaded Functions will affect the code after `.loop`
    * ###### Return
        * **[Object]** Return the `Async` Object, allows other methods to be chained to this method
     
* ##### clear - [Function]
    Clear & reset everything `.task`, and `.indx`
    * ###### Return
        * **[Object]** Return the `Async` Object, allows other methods to be chained to this method
        
##### Manager (mgr) - [Function]
A new `$in.Async` Object
* ###### Examples
    
    ```javascript
    $in.mgr.ready(function () {
        println("Cool"); // "Cool"
    }).loop(100, false); // If set to true the Inertia loading screen won't appear
    ```

    
// Inertia's Load Manager
    Inertia.Manager = $in.mgr = new Inertia.Async();
    // A Base Global Event Emmitter
    (function() {
        var Emit;
        $in.evt = $in.Event = new $in.EventEmitter(); // Inertia Event
        // Emit An Event
        Emit = function(evt, fn) {
            $in.Event._emit.push(evt);
            return function() {
                (fn || function() {}) ();
                try {
                    // jshint noarg: false
                    var arg = arguments.callee.caller.arguments;
                    $in.evt.emit.apply($in.evt, [evt, arg[0]]);
                } catch (e) { println(evt + " - " + e); }
            };
        };
        
        // Global Draw Event
        $in.pjs.draw = Emit("draw"); 
        // Emit Mouse Events
        $in.pjs.mouseReleased = Emit("onMouseRelease");
        $in.pjs.mouseScrolled = Emit("onMouseScroll");
        $in.pjs.mouseClicked = Emit("onMouseClick");
        $in.pjs.mousePressed = Emit("onMousePress");
        $in.pjs.mouseDragged = Emit("onMouseDrag");
        $in.pjs.mouseMoved = Emit("onMouseMove");
        $in.pjs.mouseOver = Emit("onMouseIn");
        $in.pjs.mouseOut = Emit("onMouseOut");
    
        // Emit Key Events
        var Key = $in.key = Inertia.Key = {
            List: [], ListStr: [],
        };
        Object.defineProperties(Inertia.Key, {
            list: { get: function () { return this.List; } },
            listStr: { get: function () { return this.ListStr; } },
        });
        $in.pjs.keyTyped = Emit("onKeyType");
        $in.pjs.keyReleased = Emit("onKeyRelease", function() {
            var Code = (key.code === CODED ? keyCode : key.code);
            if (Key.List.includes(Code)) {
                var _i = Key.List.indexOf(Code);
                Key.ListStr.splice(_i, 1);
                Key.List.splice(_i, 1);
            }
        });
        $in.pjs.keyPressed = Emit("onKeyPress", function() {
            var Code = (key.code === CODED ? keyCode : key.code);
            if (!Key.List.includes(Code)) {
                Key.ListStr.push(key.toString());
                Key.List.push(Code);
            }
        });
        // Emit Touch Events
        if ('ontouchstart' in (0, eval) ("this")) {
            $in.pjs.touchCancel = Emit("onTouchCancel");
            $in.pjs.touchStart = Emit("onTouchStart");
            $in.pjs.touchMove = Emit("onTouchMove");
            $in.pjs.touchEnd = Emit("onTouchEnd");
        } else {
            Inertia.Event.on("onMouseRelease", Emit("onTouchEnd"));
            Inertia.Event.on("onMousePress", Emit("onTouchStart"));
            Inertia.Event.on("onMouseDrag", Emit("onTouchMove"));
        }
        $in.evt._emit.forEach(function(val) {
            var _val = val.replace("on", "");
            _val = _val[0].toLowerCase() + _val.slice(1); // Changes `onMouseDrag` to `mouseDrag`
            $in.evt[val] = $in.evt[_val] = $in[val] = $in[_val] = function (fn, ctxt) {
                return $in.evt.on(val, fn || function () {}, ctxt);
            };
        });
    })();
    
    // Creates new Modules When Called
    Define = Inertia.define = Inertia.Define =  function(paths, fn, multi) {
        Inertia.Manager.then(paths, function () {
            var Define = function (path, fn) {
                var paths = toArray(path), Module = paths.pop(), Temp = {},
                    result = Find(paths, Inertia.$Modules);
                Temp[Module] = { exports: {} };
                fn = fn.call(Inertia.$Modules, Temp[Module]) || Temp[Module].exports;
                return result && Module ? (result[Module] = fn) : undefined;
            };
            if (Array.isArray(paths) && multi) {
                paths.forEach(function (path) { Define(path, fn); });
            } else { Define(paths, fn); }
        });
    };

#### Usage
When working with modules two methods are important: `$in.require` and `$in.define`. They are the way `inertia's` many components communicate with each other. 


