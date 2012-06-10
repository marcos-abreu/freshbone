/*globals root, Freshbone, JXON, getValue, urlError, resourceError, wrapSuccess, apiException */

/* -- LOCAL CACHE ---------------------------------------------------------- */
// manage local caching (memory and localStorage)

Freshbone.local = {
	// gets the cached resource (collection/model) if available
	getResource : function(obj, resource) {
		var isCollection = _.has(obj, 'models');
		return (isCollection) ? this._findCollection(resource, true) : this._findModel(resource, obj.id);
	},

	// caches a model/collection kind of object
	cache : function(obj, data) {
		var isCollection = _.has(obj, 'models'),
			resource = getValue(obj, 'resource') || resourceError();

		data = data || this._getDataFromObj(obj, resource, isCollection);

		var local = (isCollection) ? this.storageSet(data, resource) : this._addToStorage(resource, obj, data);
		if (this._memoryHas(resource) || isCollection) {
			this.memorySet(resource, local);
		}
	},

	// removes model from local cache
	removeModel : function(resource, id) {
		var collection = this.storageGet(resource);
		if (collection) {
			var key = Freshbone.api.getRootItem(resource, false),
				index = _.indexOf(_.pluck(collection[key], resource+'_id'), id);
			if (index >= 0) {
				collection[key].splice(index, 1);
				this.storageSet(collection, resource);
				if (this._memoryHas(resource)) {
					this.memorySet(resource, collection);
				}
			}
		}
	},

	// clear cached data, optinally constraining that to a specific resource
	clear : function(resource) {
		if (resource) {
			this.storageSet("", resource);
			if (Freshbone.local._memory[resource]) {
				// delete Freshbone.local._memory[resource];
				Freshbone.local._memory = {};
			}
		} else {
			root.localStorage.clear();
			Freshbone.local._memory = {};
		}
	},

	// get an item from localStorage
	storageGet : function(name, type) {
		console.log('## Storage Lookup');
		var result = root.localStorage.getItem(this._getKey((type || 'data'), name));
		return (result === undefined || result == "undefined" || result === null) ? null : JSON.parse(result);
	},

	// set an item into localStorage
	storageSet : function(data, name, type) {
		console.log('## Storage setup');
		root.localStorage.setItem(this._getKey((type || 'data'), name), JSON.stringify(data));
		return data;
	},

	// get a resource collection from memory
	memoryGet : function(resource) {
		console.log('## Memory Lookup');
		return (Freshbone.local._memory) ? Freshbone.local._memory[resource] : null;
	},

	// stores a collection in memory
	memorySet : function(resource, data) {
		console.log('## Memory setup');
		Freshbone.local._memory = {};
		Freshbone.local._memory[resource] = data;
		return data;
	},

	// verifies if the memory is set with the specified resource data
	_memoryHas : function(resource) {
		return (Freshbone.local._memory && Freshbone.local._memory[resource]);
	},

	// search for a cached collection
	_findCollection : function(resource, collectionLookup) {
		var cachingMethods = ['memoryGet', 'storageGet'],
			result = null;

		for (var i = 0; i < cachingMethods.length; i++) {
			var local = this[cachingMethods[i]](resource);
			if (local && local['@page'] > 0) {
				// make sure the _memory is always in sync with the latest list
				// api call even on page refresh
				if (cachingMethods[i] == 'storageGet' && collectionLookup) {
					this.memorySet(resource, local);
				}
				return local;
			}
		}
		return null;
	},

	// search for a cached model
	_findModel : function(resource, id) {
		var local = this._findCollection(resource, false);
		if (local) {
			var key = Freshbone.api.getRootItem(resource, false);
			local = _.find(local[key], function(item) {
				return item[resource + '_id'] == id;
			});
		}

		return local;
	},

	// adds a model to a cached resource (localStorage)
	_addToStorage : function(resource, model, data) {
		var existingData = this.storageGet(resource);
		if (existingData) {
			var id = resource + '_id',
				key = Freshbone.api.getRootItem(resource, false),
				index = _.indexOf(_.pluck(existingData[key], id), model.get(id));

			if (index >= 0) { // edit
				existingData[key][index] = _.extend({}, existingData[key][index], data);
			} else { // include
				existingData[key].unshift(data);
			}

			this.storageSet(existingData, resource);
		}
		return existingData;
	},

	// extract data to cache from an object (model/collection)
	_getDataFromObj : function(obj, resource, isCollection) {
		if (isCollection) {
			var list = {},
				key = Freshbone.api.getRootItem(resource, false);
			list[key] = obj.models;
			return _.extend({}, list, _.pick(obj, '@page', '@pages', '@per_page'));
		} else {
			return obj.attributes;
		}
	},

	// create a localStorage data key to be used by localStorage set and get methods
	_getKey : function(type, name) {
		if (!type || !name) {
			throw new Error("local cache: invalid type [" + type + "] or name [" + name + "]");
		}
		return type + '#' + name;
	}
};

