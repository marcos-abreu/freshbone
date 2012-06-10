/*globals root, Freshbone, JXON, getValue, urlError, resourceError, wrapSuccess, apiException */

/* -- MODEL ---------------------------------------------------------------- */
// extended backbone model class

Freshbone.Model = Backbone.Model.extend({
	// return the api url for the model
	url : function() {
		var base = getValue(this, 'urlRoot') || getValue(this.collection, 'url') || Freshbone.api.url;
		return base;
	},

	// parse successiful ajax model request that might contain success or failed api responses
	parse : function(resp, xhr) {
		return (xhr ? Freshbone.api.parseModel(this, resp, xhr) : resp);
	},

	// fetch a model object
	fetch : function(options) {
		options = wrapSuccess(options);
		return Backbone.Model.prototype.fetch.call(this, options);
	},

	// save a model object on the server updating cached data if successiful
	save : function(key, value, options) {
		// Handle both `("key", value)` and `({key: value})` -style calls.
		if (_.isObject(key) || key === null) {
			value = wrapSuccess(value);
		} else {
			options = wrapSuccess(options);
		}
		return Backbone.Model.prototype.save.call(this, key, value, options);
	},

	// remove a model (server delete request) updating cached data if successiful
	destroy : function(options) {
		options = options || {};
		var success = options.success;
		options.success = function(model, resp) {
			resp = model.parse(resp, true);
			if (!resp.error) {
				Freshbone.local.removeModel(model.resource, model.id);
				if (success) {
					success(model);
				}
			}
		};
		return Backbone.Model.prototype.destroy.call(this, options);
	}
});

