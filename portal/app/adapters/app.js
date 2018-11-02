import ApplicationAdapter from './application';
import { inject } from '@ember/service';

export default ApplicationAdapter.extend({
  /**
   * Session Object.
   *
   * @property session
   * @type Object
   * @public
   */
  session: inject('session'),
  /**
   * This method builds the URL for quering a record.
   *
   * @method urlForQuery
   * @param {Object} query
   * @param {String} modelName
   * @return {String} url
   */
  urlForQueryRecord(store, type) {
      let model = type.replace(/-/g,'_'),
          baseUrl = this.buildURL(),
          id = this.session.data.authenticated.user_id;
      return `${baseUrl}/Contacts/${id}/link/${model}?max_num=-1&order_by=status:asc`;
  },
});
