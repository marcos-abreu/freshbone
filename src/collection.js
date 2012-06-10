/*globals root, Freshbone, JXON, getValue, urlError, resourceError, wrapSuccess, apiException */

/* -- COLLECTION ----------------------------------------------------------- */
// extended backbone collection class

Freshbone.Collection = Backbone.Collection.extend({
	// keeps track of api pagination
	'@page' : 0,
	'@pages' : 0,
	'@per_page': 0,

	// overridden constructor to bind this collection to a resource
	constructor : function() {
		// TODO: there might be a better way of linking the model's resource with a collection
		Backbone.Collection.prototype.constructor.apply(this, arguments);
		if (!this.baseResource && this.model) {
			var tmpModel = new this.model();
			this.baseResource = tmpModel.resource;
		}
	},

	// return the api url for the collection
	url : function() {
		return Freshbone.api.url;
	},

	// keeps track of the freshbook's api resource
	resource : function() {
		return getValue(this, 'baseResource') || getValue(this.model, 'resource') || resourceError();
	},

	// parse a successiful ajax collection request that might contain success or failed api responses
	parse : function(resp, xhr) {
		return Freshbone.api.parseCollection(this, resp, xhr);
	},

	// get a collection either from memory, local cache or through an api call (using sync)
	fetch : function(options) {
		options = wrapSuccess(options);
		return Backbone.Collection.prototype.fetch.call(this, options);
	},

	// create a new instance of a model in this collection
	create : function(model, options) {
		options = wrapSuccess(options);
		return Backbone.Collection.prototype.create.call(model, options);
	}
});

