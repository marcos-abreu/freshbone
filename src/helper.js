/*globals root, Freshbone, JXON */

/* -- HELPERS --------------------------------------------------------------- */
// These methods will be included in the closure and therefore available 
// to all the Freshbone methods

Freshbone.helpers = {};

// shared empty constructor function to aid in prototype-chain creation.
var ctor = Freshbone.helpers.ctor = function(){};

// clone of inherits method available on backbone through a closure
var inherits = Freshbone.helpers.inherits = function(parent, protoProps, staticProps) {
	var child;
	if (protoProps && protoProps.hasOwnProperty('constructor')) {
		child = protoProps.constructor;
	} else {
		child = function(){ parent.apply(this, arguments); };
	}
	_.extend(child, parent);
	ctor.prototype = parent.prototype;
	child.prototype = new ctor();
	if (protoProps) { _.extend(child.prototype, protoProps); }
	if (staticProps) { _.extend(child, staticProps); }
	child.prototype.constructor = child;
	child.__super__ = parent.prototype;
	return child;
};

// clone of extend method available on backbone
var extend = Freshbone.helpers.extend = function (protoProps, classProps) {
	var child = inherits(this, protoProps, classProps);
	child.extend = this.extend;
	return child;
};

// clone of getValue method available on backbone through a closure
var getValue = Freshbone.helpers.getValue = function(object, prop) {
	if (!(object && object[prop])) {
		return null;
	}
	return _.isFunction(object[prop]) ? object[prop]() : object[prop];
};

// clone of urlErroR method avaialble on backbone.js through a closure
var urlError = Freshbone.helpers.urlError = function() {
	throw new Error('A "url" property or function must be specified');
};

// error method implemented in a similar way of backbone's urlError
var resourceError = Freshbone.helpers.resourceError = function() {
	throw new Error('A "resource" property or function must be specified');
};

// wrap a success function where the parsed response might be an error
var wrapSuccess = Freshbone.helpers.wrapSuccess = function(options) {
	options = options || {};
	var success = options.success;
	options.success = function(obj, resp) {
		if (resp instanceof root.Node) {
			var objResp = JXON.build(resp);
			if (objResp && objResp.response['@status'] == 'fail') {
				return false;
			}
		}
		if (success) { 
			success(obj, resp);
		}
	};
	return options;
};

// api error Exception
var apiException = Freshbone.helpers.apiException = function(errorObj) {
	var defaults = {
		field: null, 
		resource: null
	};
	_.defaults(this, _.pick(errorObj, 'error', 'code', 'field', 'resource'), defaults);
};

