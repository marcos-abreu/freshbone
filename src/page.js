/*globals root, Freshbone, JXON, getValue, urlError, resourceError, wrapSuccess, apiException */

/* -- PAGE ----------------------------------------------------------------- */
// extended from backbone view class, this class manages nested views

Freshbone.Page = Backbone.View.extend({
    nestedObjects : ['pages', 'views'],

    constructor : function() {
        var _self = this;

        Backbone.View.prototype.constructor.apply(this, arguments);

        this.$el.attr('id', this.cid);

        this._setParent('views');

        // make sure page.render is binded with each child view
        var render = this.render;
        this.render = function() {
            if (render) {
                render.apply(this, arguments);
            }
            for (var i = 0, j = _self.views.length; i < j; i++) {
                _self.views[i].render.apply(_self.views[i], arguments);
            }
        };
    },

    // add a nested page (as {'pageClassName' : pageObject} or as a list 
    // of page objects [{'pageClassName', pageObject}])
    addPage : function(options) {
        _.each(options, function(value, key) {
            this.pages = this.pages || {};
            if (_.has(this.pages, key)) {
                this.pages[key].close();
            }
            this.pages[key] = value;
        }, this);
        this._setParent('pages');
    },

    // overrided close method - to deal with inner views
    close : function() {
        for (var i = 0, j = this.nestedObjects.length; i < j; i++) {
            this._closeNested(this.nestedObjects[i], arguments);
        }
        Freshbone.View.prototype.close.apply(this, arguments);
    },

    // close nested elements (pages and views)
    _closeNested : function(nested, options) {
        nested = this[nested];
        _.each(nested, function(value, key) {
            if (value instanceof Backbone.View) {
                value.close.call(value, options);
            }
        });
    },

    // set the parent/child relationship of nested objects (pages and views)
    _setParent : function(nested) {
        nested = this[nested];
        _.each(nested, function(value, key) {
            if (value instanceof Backbone.View) {
                value.parent = this;
            }
        }, this);
    }
});

