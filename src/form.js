/*globals root, Freshbone, JXON, getValue, urlError, resourceError, wrapSuccess, apiException */

/* -- FORM ----------------------------------------------------------------- */
// manage forms

var Form = Freshbone.Form = function(selector, modelClass) {
	if (!selector) {
		throw new Error('undefined form selector');
	}
	this.selector = selector;
	this.modelClass = null;
	this.model = null;
	if (!_.isFunction(modelClass)) {
		this.model = modelClass;
	} else {
		this.modelClass = modelClass;
	}
	this.attributes = {};
	this.serializeAttributes();
	this.initialize.apply(this, arguments);
};

_.extend(Form.prototype, Backbone.Events, {
	// initialize is an empty function by default. Override it with your own
	// initialization logic.
	initialize : function() {},

	// serialize form fields into an object with key/value attrbibutes
	serializeAttributes : function() {
		var data = $(this.selector).serializeArray();
		_.each(data, function(item) { 
			this.attributes[item.name] = item.value; 
		}, this);
	},

	// validate form against required and field types
	// @param	options		object options to be used in this method
	// @param	context		optional context to be applied on a success or 
	//						error methods if avaialble in options
	validate : function(options, context) {
		this.serializeAttributes();

		// validate required fields
		for (var i = 0, j = this.required.length; i < j; i++) {
			var field = this.required[i];
			if (this.attributes[field] === "" && options.error) {
				var exception = new apiException({'error': (field + ' is a required field'), 'field': field});
				options.error.call((context || this), this, exception);
				return false;
			}
		}

		// todo: validate required conditionals

		// todo: validate defined types - might be a good idea to trigger the model validation if available

		if (!this.model && this.modelClass) {
			this.model = new this.modelClass(this.attributes);
		}
		this.model.set(this.attributes, { silent : true });

		if (options.success) {
			options.success.call((context || this), this.model);
		}
	},

	getDataFromModel : function() {
		var data = {};
		if (this.model) {
			data = this.model.attributes;
		}
		return data;
	}
});

