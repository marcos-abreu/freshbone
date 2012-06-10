/*globals root, Freshbone, JXON, getValue, urlError, resourceError, wrapSuccess, apiException */

/* -- VIEW ----------------------------------------------------------------- */
// extended backbone view class

Freshbone.View = Backbone.View.extend({
	// remove view's DOM elements and unbind events linked with it
	// http://lostechies.com/derickbailey/2011/09/15/zombies-run-managing-page-transitions-in-backbone-apps/
	close : function() {
		this.remove(); // remove the HTML from the DOM - jQuery dependent
		this.unbind(); // unbind DOM and custom events
		if (this.onClose) { // call onClose method if available
			this.onClose();
		}
	}
});

