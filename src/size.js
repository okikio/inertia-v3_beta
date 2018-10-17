(function() {
    // Inertia's Size Module V2  [www.khanacademy.org/cs/_/5898167898112000]
    // Size Module Basically a Vector that Supports [width & height] as [x & y]
    Define("Size", function() {
        var Class = require("Class"), Vector = require("Vector"),
            _ = require("Util")._;
        // Vector Object
        return Class(Vector, _.reduce({
                    _class: "Size", // Set Class Name & Attribute ID
                    init: function($super, x, y) {
                        $super.apply(this, [x || 0, y || 0]);
                        this.Width = this.width = this.wid = this.w = this.x;
                        this.Height = this.height = this.hei = this.h = this.y;
                    },
                    
                    // Set values of the Object
                    set: function (x, y) {
                        this.setWidth(x); this.setHeight(y || x);
                        return this;
                    },
                    
                    // Sets the width property
                    setWidth: function (val) {
                        this.Width = this.width = this.wid = this.w = val;
                        this.x = val;
                        return this;
                    },
                    
                    // Sets the height property
                    setHeight: function (val) {
                        this.Height = this.height = this.hei = this.h = val;
                        this.y = val;
                        return this;
                    }
                },
                function (obj, val, i) {
                    // Create Capital Copies of the Main Methods
                    obj[i] = obj[i.toLowerCase()] = val;
                    return obj;
                }, {})
            )
                
            // Static Methods
            .static(Vector);
    });
})(); // Size