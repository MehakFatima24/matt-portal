import Controller from '@ember/controller';
import swal from 'sweetalert';
import ENV from '../config/environment';
import { isEmpty } from '@ember/utils';
import {
    inject
} from '@ember/service';

export default Controller.extend({
    /**
     * Property that retrieves the default username from environment
     *
     * @property default_username
     * @type {String}
     * @public
     */
    default_username: ENV.username,
    /**
     * Property that retrieves the default password from environment
     *
     * @property default_password
     * @type {String}
     * @public
     */
    default_password: ENV.password,
    /**
     * Session service object.
     *
     * @property session
     * @type Ember.service
     * @public
     */
    session: inject('session'),
    /**
     * Property to access the translation service.
     *
     * @property i18n
     * @type Ember.service
     * @public
     */
    i18n: inject(),
    /**
     *This method displays the sweet alert that login successful, and transits to main route.
     *
     * @method login_successful
     * @return {Void}
     * @public
     */
    login_successful: function() {
        var message = this.get('i18n').t('login_page.successful');
        var sa = {
            title: message,
            type: 'success',
            showConfirmButton: false,
            timer: 2000,
        };
        swal(sa);
        this.transitionToRoute('main');
    },
    /**
     *This method displays the sweet alert that login failed, and invalidates the session.
     *
     * @method login_failed
     * @return {Void}
     * @public
     */
    login_failed: function() {
        var message = this.get('i18n').t('login_page.fail');
        var sa = {
            title: message,
            type: 'error',
            showConfirmButton: false,
            timer: 2000,
        };
        swal(sa);
        this.send('invalidateSession');
    },
    /**
     *This method gets the contact where the username & password matches, and sets the user
     *in the session data.
     *
     * @method initializeUser
     * @return {Void}
     * @public
     */
    initializeUser: function() {
        var data = this.session.data.authenticated,
            hash = {},
            self = this,
            user;
        hash.portal_name = this.get('username');
        hash.portal_password = btoa(this.get('password'));
        user = this.store.queryRecord('contact', hash).catch(function() {
            self.login_failed();
            return;
        })
        user.then(function(user) {
            if (!isEmpty(user)) {
                data.user = user;
                data.user_id = user.id;
                data.username = self.get('username');
                data.password = btoa(self.get('password'));
                self.get('session').trigger('sessionDataUpdated', data);
                self.get('session').session._setup(self.get('session').session.authenticator, data, true);
                self.login_successful();
                self.transitionToRoute('main');
            }

        })
    },
    actions: {
        /**
         * Calls the session service authenticate method along with authenticator type, and user credentials provided in the login form.
         * If the request authenticates then user is shown a successful logged in message and redirected to main route.
         * If the reqest fails to authenticate, the error response is handled and message is shown to the user.
         *
         * @method authenticate
         * @public
         */
        authenticate: function() {
            var self = this,
                sa = {
                    title: this.get('i18n').t('sweet_alerts.processing'),
                    showConfirmButton: false,
                };
            swal(sa);
            this.get('session').authenticate('authenticator:oauth2', this.get('default_username'), this.get('default_password')).then(( /* response */ ) => {
                self.initializeUser();
            });
        },
        /**
         * This action invalidates the session and redirects the user to the Login Route.
         *
         * @method invalidateSession
         * @public
         */
        invalidateSession: function() {
            this.get('session').invalidate();
            this.transitionToRoute('login');
        }


    },
});
