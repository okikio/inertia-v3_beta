<h1 align="center">
  Inertia.js
</h1>

<h4 align="center">- A JS creators kit -</h4>

<p align="center">
  <a href="#getting-started">Getting started</a>&nbsp;|&nbsp;<a href="#table-of-content">Table of content</a>&nbsp;|&nbsp;<a href="#demos-and-examples">Demos and examples</a>&nbsp;
</p>

## Getting started
`inertia.js` is a module packaging, and sharing software. It's goal is to modularize chunks of code for easy updating and upgrading of software. I developed it for quick and sweet programming without having to search or create some crucial tools.  When working with modules two methods are important: `$in.require` and `$in.define`. They are the way `inertia's` many components communicate with each other. 

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
The ```}).loop(100);``` details the rate at which modules should be loaded during runtime e.g. loading a module every second and how the modules are loaded (syncronously or asyncronously) otherwise known as (all at once or once at a time). For more info: [Inertia](./api.md#inertia). To use some of the built in modules call `require()` in to a variable and start testing. For more info. [api.md](./api.md). An example of this: 
```javascript
...
$in.mgr.ready(function () {
    var Core = require("Core");
    var log = Core.log;
    log("Woah it works");
}).loop(100);
```
for more tutorials and the code required to get started go to the getting started folder.
    ```