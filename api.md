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
`Inertia.js` has many built in modules, designed to make other modules work effectively. The most important part of `inertia` is the **Module** component which allows for it to be built on top of. That is what allows for accessing modules, as well as creating modules. 

### Methods & Properties
#### $Modules - [Array]
An [Array] that stores all modules created.

#### $Required ($req) - [Array]
Displays all modules missing in order to make `inertia` work.

#### $Unused ($unused) - [Array]
Displays all modules not in use.
    
#### toArray  - [Function]
Converts a String into an Array, based on specific values. Meant for 
turning Strings into Arrays of little paths. It splits a String into Array where it finds `,` or `.`.
* ###### Params
    * **[Array | String]** val - Value to convert 

* ###### Return
    * **[Array]** Converted value

* ###### Example
    ```javascript
    $in.toArray("obj.key.val") // ["obj", "key", "val"]
    ```

#### isDef - [Function]
Check if a value is defined.
* ###### Params
    * **[Any]** val - Value to check

* ###### Return
    * **[Boolean]** Whether `val` is defined

* ###### Example
    ```javascript
    $in.isDef("Defined") // true
    ```

#### Find - [Function]
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

#### global (window) - [Object]
Window Object
 
#### canvas (PJS | pjs) - [Object]
The Processing JS Object

#### EventEmitter (evtemit) - [Object]
This Object expose an `evtemit.on()` function that allows one or more functions to be attached to named events emitted by the object. When the `EventEmitter` object emits an event, all of the functions attached to that specific event are called.
* #### eventCount - [Number]
    The total [Number] of events
* #### _events - [Object]
    Stores all events 
* #### _emit - [Array]
    Stores events set to be Emitted
* #### on - [Function]
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

* #### emit - [Function]
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
    
#### Async - [Object]
This Object allows for loading Functions one after the other with a certain amount of time allocated for each Function. Meant for loading really big module's while not slowing the program to a crawl.
* ##### Constructor - [Function]
    * ###### Params
        * **[Number]** rate - Sets the rate at which Functions are loaded
* #### tasks - [Array]
    List of all Functions to be called
* #### indx - [Number]
    Current index when calling a Function
* #### rate - [Number]
    Rate at which to call the Functions
* #### progress - [Number]
    The progress of loading the Function from 0 to 100
* #### complete - [Boolean]
    Whether the progress is 100 or not
* #### readyFn - [Function]
    What to do after the loading of the Functions are done
* #### loadFn - [Function]
    What to do during the loading of the Functions
* #### errFn - [Function]
    What to do if there is an error whilie loading the Functions
    * ###### Params
        * **[Object]** e - The error Object containing the error message
        
* #### setRate - [Function]
    Sets the rate at which Functions are loaded
    * ###### Params
        * **[Object]** rate - The rate at which Functions are loaded
    * ###### Return
        * **[Object]** Return the `Async` Object, allows other methods to be chained to this method
        
* #### setExternal - [Function]
    Set's how the Functions load, once at a time or all at once. This was designed for development quick addition to code and a quick view for error fixes. When the first argument is set to true it allows for any Functions loaded after `.loop` to affect the code else if loaded one by one everything loaded will only affect the `.ready` callback and only that.
    * ###### Params
        * **[Boolean]** external - Whether the loaded Functions will affect the code after `.loop`
    * ###### Return
        * **[Object]** Return the `Async` Object, allows other methods to be chained to this method
     
* #### then - [Function]
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

* #### [error, ready]  - [Function]
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
            println("Awesome); // When fixed \"Awesome\"
        });
        ...
        ```

* #### thruLoop - [Function]
    Changes the value of `.loopThru` which basically asks whether it should loop through the `.tasks` Array 
    * ###### Params
        * **[Boolean]** thru - Should loop go through
    * ###### Return
        * **[Object]** Return the `Async` Object, allows other methods to be chained to this method

* #### run - [Function]
    Runs the loop through the `.tasks` Array
    * ###### Return
        * **[Object]** Return the `Async` Object, allows other methods to be chained to this method
     
* #### loop - [Function]
    Starts the loop
    * ###### Params
        * **[Number]** rate -  Rate at which to load each Function
        * **[Boolean]** external -  Whether the loaded Functions will affect the code after `.loop`
    * ###### Return
        * **[Object]** Return the `Async` Object, allows other methods to be chained to this method
     
* #### clear - [Function]
    Clear & reset everything `.task`, and `.indx`
    * ###### Return
        * **[Object]** Return the `Async` Object, allows other methods to be chained to this method
        
#### Manager (mgr) - [Object]
A new `$in.Async` Object, it is `Inertia's` load manager.
* ###### Examples
    ```javascript
    $in.mgr.ready(function () {
        println("Cool"); // "Cool"
    }).loop(100, false); // If 2nd param set to `true` the Inertia loading screen won't appear
    ```

#### Event (evt) - [Object]
A new `$in.EventEmitter` Object, it is `Inertia's` base global event emmitter.
* ##### Emitters
    * **draw** - Represents `draw`
        * ###### Examples
        ```javascript
        $in.evt.on("draw", function () {
            println("Cool"); // Print "Cool" everytime draw loops  
        });
        
        // Does the same thing
        $in.evt.draw(function () {
            println("Cool"); // Print "Cool" everytime draw loops  
        });
        ``` 
    * **onMouseRelease (mouseRelease)** - Represents `mouseReleased`
        * ###### Examples
        ```javascript
        $in.evt.on("onMouseRelease", function () {
            println("Cool"); // Print "Cool" everytime a mouseReleased function runs
        });
        
        // Does the same thing
        $in.evt.mouseRelease(function () {
            println("Cool"); // Print "Cool" everytime a mouseReleased function runs
        });
        ``` 
    * **onMouseScroll (mouseScroll)** - Represents `mouseScrolled`
        * ###### Examples
        ```javascript
        $in.evt.on("onMouseScroll", function () {
            println("Cool"); // Print "Cool" everytime a mouseScrolled function runs
        });
        
        // Does the same thing
        $in.evt.mouseScroll(function () {
            println("Cool"); // Print "Cool" everytime a mouseScrolled function runs
        });
        ``` 
    * **onMouseClick (mouseClick)** - Represents `mouseClicked` 
        * ###### Examples
        ```javascript
        $in.evt.on("onMouseClick", function () {
            println("Cool"); // Print "Cool" everytime a ` function runs
        });
        
        // Does the same thing
        $in.evt.mouseClick(function () {
            println("Cool"); // Print "Cool" everytime a mouseClicked function runs
        });
        ``` 
    * **onMousePress (mousePress)** - Represents `mousePressed`
        * ###### Examples
        ```javascript
        $in.evt.on("onMousePress", function () {
            println("Cool"); // Print "Cool" everytime a mousePressed function runs
        });
        
        // Does the same thing
        $in.evt.mousePress(function () {
            println("Cool"); // Print "Cool" everytime a mousePressed function runs
        });
        ``` 
    * **onMouseDrag (mouseDrag)** - Represents `mouseDragged`
        * ###### Examples
        ```javascript
        $in.evt.on("onMouseDrag", function () {
            println("Cool"); // Print "Cool" everytime a mouseDragged function runs
        });
        
        // Does the same thing
        $in.evt.mouseDrag(function () {
            println("Cool"); // Print "Cool" everytime a mouseDragged function runs 
        });
        ``` 
    * **onMouseMove (mouseMove)** - Represents `mouseMoved`
        * ###### Examples
        ```javascript
        $in.evt.on("onMouseMove", function () {
            println("Cool"); // Print "Cool" everytime a mouseMoved function runs
        });
        
        // Does the same thing
        $in.evt.mouseMove(function () {
            println("Cool"); // Print "Cool" everytime a mouseMoved function runs
        });
        ``` 
    * **onMouseIn (mouseOver)** - Represents `mouseOver`
        * ###### Examples
        ```javascript
        $in.evt.on("onMouseIn", function () {
            println("Cool"); // Print "Cool" everytime a mouseOver function runs
        });
        
        // Does the same thing
        $in.evt.mouseOver(function () {
            println("Cool"); // Print "Cool" everytime a mouseOver function runs
        });
        ``` 
    * **onMouseOut (mouseOut)** - Represents `mouseOut` 
        * ###### Examples
        ```javascript
        $in.evt.on("onMouseOut", function () {
            println("Cool"); // Print "Cool" everytime a ` function runs
        });
        
        // Does the same thing
        $in.evt.mouseOut(function () {
            println("Cool"); // Print "Cool" everytime a ` function runs
        });
        ``` 
    * **onKeyType (keyType)** - Represents `keyTyped`
        * ###### Examples
        ```javascript
        $in.evt.on("onKeyType", function () {
            println("Cool"); // Print "Cool" everytime a keyTyped function runs
        });
        
        // Does the same thing
        $in.evt.keyType(function () {
            println("Cool"); // Print "Cool" everytime a keyTyped function runs
        });
        ``` 
    * **onKeyRelease (keyRelease)** - Represents `keyReleased`
        * ###### Examples
        ```javascript
        $in.evt.on("onKeyRelease", function () {
            println("Cool"); // Print "Cool" everytime a keyReleased function runs
        });
        
        // Does the same thing
        $in.evt.keyRelease(function () {
            println("Cool"); // Print "Cool" everytime a keyReleased function runs 
        });
        ``` 
    * **onKeyPress (keyPress)** - Represents `keyPressed`
        * ###### Examples
        ```javascript
        $in.evt.on("onKeyPress", function () {
            println("Cool"); // Print "Cool" everytime a keyPressed function runs
        });
        
        // Does the same thing
        $in.evt.keyPress(function () {
            println("Cool"); // Print "Cool" everytime a keyPressed function runs 
        });
        ``` 
    * **onTouchCancel (touchCancel)** - Represents `touchCancel`
        * ###### Examples
        ```javascript
        $in.evt.on("onTouchCancel", function () {
            println("Cool"); // Print "Cool" everytime a touchCancel function runs
        });
        
        // Does the same thing
        $in.evt.touchCancel(function () {
            println("Cool"); // Print "Cool" everytime a touchCancel function runs
        });
        ``` 
    * **onTouchStart (touchStart)** - Represents `touchStart`
        * ###### Examples
        ```javascript
        $in.evt.on("onTouchStart", function () {
            println("Cool"); // Print "Cool" everytime a touchStart function runs
        });
        
        // Does the same thing
        $in.evt.touchStart(function () {
            println("Cool"); // Print "Cool" everytime a touchStart function run 
        });
        ``` 
    * **onTouchMove (touchMove)** - Represents `touchMove`
        * ###### Examples
        ```javascript
        $in.evt.on("onTouchMove", function () {
            println("Cool"); // Print "Cool" everytime a touchMove function runs
        });
        
        // Does the same thing
        $in.evt.touchMove(function () {
            println("Cool"); // Print "Cool" everytime a touchMove function runs
        });
        ``` 
    * **onTouchEnd (touchEnd)** - Represents `touchEnd`
        * ###### Examples
        ```javascript
        $in.evt.on("onTouchEnd", function () {
            println("Cool"); // Print "Cool" everytime a touchEnd function runs
        });
        
        // Does the same thing
        $in.evt.touchEnd(function () {
            println("Cool"); // Print "Cool" everytime a touchEnd function runs
        });
        ``` 
* ###### Usage / Examples
    A more detailed example of how to use `$in.Event` or `$in.evt`
    ```javascript
    $in.evt.mousePress(function () {
        println("Cool"); // "Cool" on mouse press
    }).on("onKeyPress", function () {
        println("Cool"); // "Cool" on key press
    }); 
    
    $in.evt.on({
       onMouseScroll: function (e) {
           e.preventDefault(); // Works like `e.preventDefault` is supposed to
           println("Scroll"); // "Scroll" on mouse wheel scroll
       },
       
       // Only works on touch supported devices, else uses the mouse as a replacement automatically
       onTouchStart: function () {
           println("Wow"); // "Wow"
       }
    });
    
    $in.onKeyPress(function () {
        println($in.key.listStr); // List's out all keys being pressed in a single instance
    });
    ```

#### Key (key) - [Object]
An Object that stores keys currently being pressed for use later on in the program in two Arrays `.Key.List` and `.Key.ListStr`.
* #### List (list) - [Array]
    This stores all the **key codes** being pressed in an Array.
    ###### Example
    ```javascript
    $in.draw(function () {
        // If you pressed "a", and "s"
        println($in.Key.List); // It will print "97, 115"
    });
    ```
* #### ListStr (listStr) - [Array]
    This stores all the **keys as strings** being pressed in an Array.
    ###### Example
    ```javascript
    $in.draw(function () {
        // If you pressed "a", and "s"
        println($in.Key.ListStr); // It will print "a, s"
    });
    ```

#### define - [Function]
Creates new modules when called, adds them to `$in.$Modules` creates a task that loads each module using `$in.mgr` (because some modules are big).
* ###### Params
    * **[String | Array]** paths - A module name or path, or multiple modules name and path, as Arrays
    * **[Function]** fn - Contains the contents of the modules
        ###### Params
        * **[Object]** module - A reference to the current module. In particular, `module.exports` is used for defining what a module exports and makes available through `require()`. In each module, the `module` parameter (the first argument in every module) is a reference to the Object representing the current module. For convenience, module is not actually a global but rather local to each module.
            * **[Object | \*Any]** exports - The `module.exports` Object is created by the Module system. Sometimes this is not acceptable; many want their module to be an instance of some class. To do this, assign the desired export object to `module.exports`.
        ###### Return
        * **[Object | \*Any]** Return the exported module content
    
    * **[Boolean]** multi - Whether to treat the path given as a single path or an Array of multiple module paths.

* ###### Example
    ```javascript
    // Creates a new module called Math whose content is the native Math Object
    $in.Define("Math", function (module) {
        module.exports = Math;
    });
    
    // Creates a new module called Mat located in M full path looks like (M.Mat) whose content is the native Math Object
    $in.Define(["M", "Mat"], function (module) {
        module.exports = Math;
    });
    
    // Creates multiple new modules called N and Nat located in V and G, full path looks like (V.N and G.Nat) whose content is the PVector Object
    $in.Define(["V.N", "G.Nat"], function (module) {
        module.exports = Math;
        return new PVector(0, 0); // Returning a value overrides `module.exports`
    }, true);
    ```
    
#### require - [Function]
A module accessor better yet known as require. Used to import modules. Modules can be imported from `$in.$Modules` be imported using an absolute path **(a.b.c)**.
* ###### Params
    * **[String | Array]** path - Module name or path
* ###### Return
    * **[Object]** Return the exported module content

* ###### Example
    ```javascript
    var _ = require("Util._"); // Require `Util` Module
    println(_.isNumber); // function () {...}
    ```

## Core
* Version - 2.0.0

`Inertia.js` works using many built in modules, designed to make other modules work effectively. But this is the module that lets the other modules work so effectively. The is the `Core` module, no module can work without it. 

### Methods & Properties
#### global (window) - [Function]
Does the same thing as `$in.global` (access the Window Object) except it avoids the `[["..."]]` problem KA has. Using the brackets to avoid this problem.
* ###### Params
    * **[String]** prop - Property of ohe Window Object to access
* ###### Return 
    * **[\*Any | \*Object]** - Value of property | Window Object

#### canvas (PJS, pjs) - [Object]
A container for the accessing the PJS (Processing JS) Object.

#### Eval (eval) - [Function]
The `eval()` function evaluates JavaScript code represented as a string.
* ###### Params
    * **[String]** str - A string representing a JavaScript expression, statement, or sequence of statements. The expression can include variables and properties of existing objects.
* ###### Return 
    * **[\*Any]** - The completion value of evaluating the given code. If the completion value is empty, undefined is returned.

**All of these basically do the same thing**
* #### FUNCTION (Function, Func, Fn) - [Object]
* #### JSON (Json) - [Object]
* #### STRING (String) - [Object]
* #### REGEXP (RegExp) - [Object]
* #### OBJECT (Object) - [Object]
* #### NUMBER (Number) - [Object]
* #### ARRAY (Array) - [Object]
* #### BOOLEAN (Boolean) - [Object]
* #### MATH (Math) - [Object]
* #### ERROR (Error) - [Object]
* #### DATE (Date) - [Object]
* #### PROMISE (Promise) - [Object]
* #### SYMBOL (Symbol) - [Object]
* #### MAP (Map) - [Object]
* #### WEAKMAP (WeakMap) - [Object]
* #### SET (Set) - [Object]
* #### WEAKSET (WeakSet) - [Object]
* #### WEBASSEMBLY (WebAssembly) - [Object]
* #### GENERATOR (Generator) - [Object]
* #### GENERATORFUNCTION (GeneratorFunction) - [Object]
* #### REFLECT (Reflect) - [Object]
A container for native global Object of the same type for easier access.

#### PROXY (Proxy) - [Function]
A container for the native global `Proxy` Object for easier access. To use call `Core.Proxy(obj, helper)` works like the normal `Proxy` Object.
* ###### Params
    * **[Object]** o - A target `Object` to wrap with Proxy. It can be any sort of object, including a native array, a function or even another proxy.
    * **[Object]** h - An object whose properties are functions which define the behavior of the proxy when an operation is performed on it.
* ###### Return
    * **[Object]** Return the `Proxy` Object, allows custom behavior for fundamental operations (e.g. property lookup, assignment, enumeration, function invocation, etc).

#### log (LOG) - [Function]
Logs / Prints to console, allows for multiple each argument value to be printed out using `println()`.
* ###### Params
    * **[Any]** ... - Argument value to print to console

#### Env (env) - [Function]
Creates a Function with the PJS context embedded by default. It follows the default rules for a default `Function` Object in `fn`, while `ctxt` is the context which is set to PJS by default.
* ###### Params
    * **[Array | String]** fn - Params and code or just code for the Function
    * **[Object]** ctxt - Context for the Function


## Util

## Function

## Object

## Math

## String

## Class

## Vector

## Size

## Color

## Ease

## Event

## UIEvent

## Mouse

## Key

## Touch

## Async

## Accum

## Range

## Error

## Motion

## Timeline

