import DS from 'ember-data';
import RESTSerializer from 'ember-data/serializers/rest';

export default RESTSerializer.extend(DS.EmbeddedRecordsMixin, {
    attrs: {
        tasks: {
            embedded: 'always'
        },
    },
    /**
     *This method converts the payload received from
     *data source into the normalized form store.push() expects.
     *
     * @param  {DS.Model} modelClass
     * @param  {Object} resourceHash
     * @return {Object}              []
     */
    normalize(modelClass, resourceHash) {
        var data = {
            id: 'id',
            type: modelClass.modelName,
            attributes: resourceHash
        };
        return {
            data: data
        };
    },
    /**
     * This method normalizes payload from the server to a JSON-API Document.
     *
     * @param  {DS.Store} store
     * @param  {DS.Model} primaryModelClass
     * @param  {Objec} payload
     * @param  {String} id
     * @param  {Object} requestType
     * @return {Object} JSON-API Document
     */
    normalizeResponse(store, primaryModelClass, payload, id, requestType) {
        if (requestType === 'queryRecord') {
            payload = {
                tasks: payload.records,
            };
        }
        return this.normalize(primaryModelClass, payload);
    },
});
