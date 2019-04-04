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


