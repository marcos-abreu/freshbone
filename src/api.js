/*globals root, Freshbone, JXON, getValue, urlError, resourceError, wrapSuccess, apiException */

/* -- API Bindings --------------------------------------------------------- */
// Freshbooks api bindings - request / response / parsing

Freshbone.api =  {
	// base freshbooks api url
	url : '/api/2.1/xml-in',

	// setup all AJAX calls with the proper Authorization header
	ajaxSetup : function(token) {
		$.ajaxSetup({
			beforeSend : function (xhr) {
				var hash = root.btoa(token+":");
				xhr.setRequestHeader ("Authorization", ("Basic " + hash));
			}
		});
	},

	// return the root item of a resource - fixing API inconsistencies
	getRootItem : function(resource, isCollection) {
		return (resource == "staff") ? (isCollection ? "staff_members" : "member") : resource;
	},

	// parse an xml response from a Model request
	parseModel : function(model, resp, xhr) {
		var result = null,
			jsObj = JXON.build(resp);

		if (jsObj && jsObj.response['@status'] == 'fail') {
			if (this.error) { // error callback
				this.error(model, new apiException(jsObj.response));
			}
			result = {};
		} else if (jsObj && jsObj.response['@status'] == 'ok') {
			result = this._parseModelResponse(model, jsObj);
		}
		return result;
	},

	// parse an xml response from a Collection request
	parseCollection : function(collection, resp, xhr) {
		var result = null,
			jsObj = (xhr) ? JXON.build(resp) : {'response' : resp };

		if (jsObj && jsObj.response['@status'] == 'fail') {
			if (this.error) { 
				this.error(collection, new apiException(jsObj.response)); 
			}
			result = [];
		} else if (jsObj) {
			var resource = getValue(collection, 'resource') || resourceError();
			if (xhr) {
				var key = this.getRootItem(resource, true);
				result = jsObj.response[key];

				Freshbone.local.cache(collection, result);
			} else {
				result = jsObj.response;
			}

			_.extend(collection, _.pick(result, '@page', '@pages', '@per_page'));

			var modelKey = this.getRootItem(resource, false);
			result = (result) ? result[modelKey] : null;
		}

		return result;
	},

	// sends an ajax api request
	request : function(resource, method, model, options) {
		options = options ? options : {};

		var params = {
			type: 'POST',
			dataType: 'xml',
			contentType: 'application/xml',
			processData:  false
		};

		if (!options.url) {
			params.url = getValue(model, 'url') || urlError();
		}

		method = (method == 'read') ? (_.has(model, 'models') ? 'list' : 'get') : method;
		params.data = this._buildXMLRequest(resource, method, model);
		console.log('## AJAX call');
		return $.ajax(_.extend(params, options));
	},

	// creates the body of the api request
	_buildXMLRequest : function(resource, method, model, settings) {
		var _self = this;
		var xmlRequest = _.template('<?xml version="1.0" encoding="utf-8"?><request method="<%= action %>"><%= getAttrs() %></request>');
		// TODO: pagination ???
		var data = {
			'action' : (resource + '.' + method),
			'getAttrs' : function() {
				var attrs = {};
				if (method == "create" || method == "update") {
					attrs[resource] = _self._removeReadOnly(model, model.attributes);
				} else if (method == "delete") {
					attrs[model.idAttribute] = model.id;
				} else {
					attrs = model.attributes || {};
				}
				var doc = JXON.unbuild(attrs);
				var serializer = new root.XMLSerializer();
				return serializer.serializeToString (doc.documentElement);
			}
		};

		return xmlRequest(data);
	},

	// removes read-only attributes from a model object - returning the filtered result
	_removeReadOnly : function(model, attributes) {
		if (_.isArray(model.readOnly) && model.readOnly.length > 0) {
			_.each(model.readOnly, function(item) {
				delete attributes[item];
			});
		}
		return attributes;
	},

	// parse a Model response based on the resource action (list, get, create, update, delete)
	_parseModelResponse : function(model, jsObj) {
		var result = {},
			responseKeys = _.keys(jsObj.response),
			objKey = _.find(responseKeys, function(key) {
				return (key.indexOf('@') !== 0);
			});

		if (objKey && _.isObject(jsObj.response[objKey])) { // list | get
			result = jsObj.response[objKey];
			Freshbone.local.cache(model, result);
		} else { // create | update | delete
			// TODO: find a way to separate delete response from create and update
			//       to avoid setting the local cache and latter removing it.
			delete jsObj.response['@xmlns'];
			delete jsObj.response['@status'];
			result = jsObj.response;
			var data = _.extend({}, model.attributes, result);
			Freshbone.local.cache(model, data);
		}
		return result;
	}
};

