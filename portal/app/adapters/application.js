import DS from 'ember-data';
import DataAdapterMixin from 'ember-simple-auth/mixins/data-adapter-mixin';
import ENV from '../config/environment';
import Ember from "ember";
import {
    capitalize
} from '@ember/string'
import {
    inject
} from '@ember/service';
import {
    isEmpty
} from '@ember/utils';
import {
    computed
} from '@ember/object';
export default DS.RESTAdapter.extend(DataAdapterMixin, {
    /**
     * Cross origin resource sharing header
     *
     * @property corsWithCredentials
     * @type {Boolean}
     * @public
     */
    corsWithCredentials: true,
    /**
     * Cross domain resource sharing header
     *
     * @property crossDomain
     * @type {Boolean}
     * @public
     */
    crossDomain: true,
    /**
     * API Host Name.
     *
     * @property host
     * @type String
     * @public
     */
    host: ENV.api.host,
    /**
     * Session Object.
     *
     * @property session
     * @type Object
     * @public
     */
    session: inject(),
    /**
     * Headers Object.
     *
     * @property headers
     * @type {Object}
     * @public
     */
    headers: computed(function(){
      return {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      };
    }),
    /**
     * xhr Fields Object.
     *
     * @property xhrFields
     * @type {Object}
     * @public
     */
    xhrFields: computed(function(){
      return {
        withCredentials: true
      };
    }),
    /**
     * This method takes the URL, the method and the data object and generates
     * the request Object.
     *
     * @method authorize
     * @param {String} url
     * @param {String} method
     * @param {Object} hash
     * @return {Object}
     * @public
     */
    ajax(url, method, hash) {
        hash = hash || {};
        hash.crossDomain = true;
        hash.xhrFields = {
            withCredentials: true
        };
        return this._super(url, method, hash);
    },
    /**
     * This method authorizes the outgoing request to the server by adding an authentication
     * token in the request header.
     *
     * @method authorize
     * @param {Object} xhr
     * @return {void}
     * @public
     */
    authorize(xhr) {
        var access_token = this.get('session.data.authenticated.access_token');
        xhr.setRequestHeader('OAuth-Token', access_token);
    },
    /**
     * This method builds URL for GET requests on record.get(). The customization
     * checks for the need of adding related information in the URL.
     *
     * @method urlForFindRecord
     * @param {String} id
     * @param {String} modelName
     * @return {string}
     * @public
     */
    urlForFindRecord: function(id, modelName) {
        let capitalized = capitalize(modelName),
            model = Ember.String.pluralize(capitalized),
            baseUrl = this.buildURL();
        if (!isEmpty(id)) {
            return `${baseUrl}/${model}/${id}`
        }
        return `${baseUrl}/${model}`;

    },
    /**
     * This method builds the URL for quering a record.
     *
     * @method urlForQueryRecord
     * @param {Object} store
     * @param {String} type
     * @param {Object} query
     * @return {String} url
     */
    urlForQueryRecord(store, type) {
        let capitalized = capitalize(type),
            model = Ember.String.pluralize(capitalized),
            baseUrl = this.buildURL(),
            query_string = '';
        Object.keys(store).forEach(function(index, order) {
            if (order === 0) {
                query_string = query_string + '?' + 'filter[' + order + '][' + index + ']=' + store[index];
            } else {
                query_string = query_string + '&' + 'filter[' + order + '][' + index + ']=' + store[index];
            }
        });
        return `${baseUrl}/${model}${query_string}`;
    },
    /**
     * Called by the store in order to fetch a JSON array for
     * the records that match a particular query.
     * The `query` method makes an Ajax (HTTP GET) request to a URL
     * computed by `buildURL`, and returns a promise for the resulting
     * payload.
     *
     * @method query
     * @param {DS.Store} store
     * @param {DS.Model} type
     * @param {Object} query
     * @return {Promise} promise
     */
    query(store, type, query) {
        var url = this.buildURL(type.modelName, null, null, 'query', query);
        if (this.sortQueryParams) {
            query = this.sortQueryParams(query);
            return this.ajax(url, 'GET');
        }
        return this.ajax(url, 'GET', {
            data: query
        });
    },
    /**
     * This method handles response sent from API.
     *
     * @method handleResponse
     * @param {String} status
     * @param {Object} headers
     * @param {Object} payload
     * @param {Object} requestData
     * @return {Object}
     * @public
     */
    handleResponse: function(status, headers, payload) {
        if (status >= 400) {
            var data = {};
            data.data = payload;
            data.code = status;
            return data;
        }
        return payload;
    }
});
