import DS from 'ember-data';
import RESTSerializer from 'ember-data/serializers/rest';

export default RESTSerializer.extend(DS.EmbeddedRecordsMixin,{
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
    if(requestType==='queryRecord') {
      payload = {
          'contact': payload.records[0]
        };
    }
    return this._super(store, primaryModelClass, payload, id, requestType);
  },
});
