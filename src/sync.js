/*globals root, Freshbone, JXON, getValue, urlError, resourceError, wrapSuccess, apiException */

/* -- SYNC ----------------------------------------------------------------- */
// Backbone sync method

Backbone.sync = function(method, model, options) {
	var resource = getValue(model, 'resource') || resourceError();

	// read from local cache if it is available
	if (method == 'read') {
		var local = Freshbone.local.getResource(model, resource);
		if (local) {
			if (options.success) {
				options.success(local);
			}
			return local;
		}
	}

	// wrap error callback to deal with request failures
	if (options.error) {
		var error = options.error;
		Freshbone.api.error = options.error = function(obj, errorResp) {
			if (errorResp == "error" && _.has(obj, 'isRejected') && obj.isRejected()) {
				obj = new apiException({
					error: "Connection failure, please check your internet connection and try again.",
					code: "0"
				});
			}
			error(obj, errorResp);
		};
	}

	return Freshbone.api.request(resource, method, model, options);
};

