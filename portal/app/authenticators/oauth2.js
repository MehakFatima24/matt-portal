import OAuth2PasswordGrant from 'ember-simple-auth/authenticators/oauth2-password-grant';
import { inject } from '@ember/service';
import { isEmpty } from '@ember/utils';
import RSVP from 'rsvp';
import { run } from '@ember/runloop';
import ENV from "../config/environment";

export default OAuth2PasswordGrant.extend({
  /**
  * Session service object.
  *
  * @property session
  * @type Ember.service
  * @public
  */
  session: inject(),
  /**
  * The token EndPoint to send the request to get Access Token.
  *
  * @property serverTokenEndpoint
  * @type String
  * @default ENV.api.host + '/authenticate'
  * @public
  */
  serverTokenEndpoint: ENV.api.host + '/oauth2/token',
  /**
  * The token EndPoint to send the request to get Access Token.
  *
  * @property serverLogoutEndpoint
  * @type String
  * @default ENV.api.host + '/logout'
  * @public
  */
  serverLogoutEndpoint: ENV.api.host + '/logout',
  /**
  * The client id to authenticate the client.
  *
  * @property clientId
  * @type String
  * @default
  * @public
  */
  apiClientId: ENV.api.clientId,
  /**
  * The client secret is used to send with the client id for authentication.
  *
  * @property clientSecret
  * @type String
  * @default ENV.api.clientSecret
  * @public
  */
  apiClientSecret: ENV.api.clientSecret,
  /**
  * The grant type is used to send with the client credentials for authentication.
  *
  * @property apiGrantType
  * @type String
  * @default ENV.api.grant_type
  * @public
  */
  apiGrantType: ENV.api.grant_type,
  /**
  * The authenticate method is used to make the call to the Cake Server with the
  * appropriate parameters to get the Access Token.
  *
  * @method authenticate
  * @param {String} username
  * @param {String} password
  * @param {Array} scope
  * @param {Object} headers
  * @public
  */
  authenticate(username, password, headers = {}) {
    var client_id = this.get('apiClientId'),
    client_secret = this.get('apiClientSecret'),
    grant_type = this.get('apiGrantType');
    if (isEmpty(headers)) {
      headers = {
        'Accept': 'application/json',
      };
    } else {
      headers.Accept = 'application/json';
    }

    
    return new RSVP.Promise((resolve, reject) => {
    const data  = {
      username: username,
      password,
      client_id : client_id,
      client_secret : client_secret,
      grant_type : grant_type,
    };
    const serverTokenEndpoint = this.get('serverTokenEndpoint');
    const useResponse = this.get('rejectWithResponse');

    this.makeRequest(serverTokenEndpoint, data, headers).then((response) => {
      run(() => {
        if (!this._validate(response)) {
          reject('Call failure');
        }
        resolve(response);
      });
    }, (response) => {
      run(null, reject, useResponse ? response : response.responseJSON);
    });
  });
  },
});
