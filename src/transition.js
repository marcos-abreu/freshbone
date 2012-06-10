/*globals root, Freshbone, JXON, getValue, urlError, resourceError, wrapSuccess, apiException */

/* -- TRANSITION ----------------------------------------------------------- */
// manage view transitions

var Transition = Freshbone.Transition = function(options) {
	options = options || {};
	this._setOptions(options);
	this.container = this.container || 'body';
	this.initialize.apply(this, arguments);
};

var transitionOptions = [
	'container', // container where the new page will be included
	'to', // new page
	'from']; // current page

// extend the Freshbone.Transition with Backbone.Events engine
_.extend(Freshbone.Transition.prototype, Backbone.Events, {
	// default action to be applied to origin page
	fromAction : 'close',

    // initialization logic. Override it with your own logic
    initialize: function() {},

    // start the transition
	start : function() {
		if (this.to.pageClass) {
			this.to = new this.to.pageClass(this.to.options);
		}
		// this hapens if the current page is a subpage and the url is changed manually
		if (this.from && this.from.parent && (this.from.parent !== this.to)) {
			this.from = this.from.parent;
			this.fromAction = 'close';
		}
		if (this.from) {
			switch (this.fromAction) {
				case 'close':
					this.from.close();
					break;
				case 'hide':
					this.from.$el.hide();
					break;
			}
		}
		if ($('#'+this.to.cid).length === 1) {
			$('#'+this.to.cid).show();
		} else {
			this.to.render(this.container);
		}
		return this.to;
	},

	// set the valid transition options
	_setOptions : function(options) {
		for (var i=0, j=transitionOptions.length; i < j; i++) {
			var attr = transitionOptions[i];
			if (options[attr]) {
				this[attr] = options[attr];
			}
		}
	}
});

