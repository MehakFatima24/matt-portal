import Route from '@ember/routing/route';
import {
    inject
} from '@ember/service';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
export default Route.extend(AuthenticatedRouteMixin, {
    /**
     * Property to access the translation service.
     *
     * @property i18n
     * @type Ember.service
     * @public
     */
    i18n: inject(),
    /**
     * Session service object.
     *
     * @property session
     * @type Ember.service
     * @public
     */
    session: inject('session'),
    /**
     * This hooks checks if the user is authenticated, reroutes to login otherwise.
     *
     * @method beforeModel
     * @return {Void}
     * @public
     */
    beforeModel: function() {
        this._super(...arguments);
        this.store.unloadAll('contact');
        this.store.unloadAll('all-tasks');

        if (!this.get('session.isAuthenticated')) {
            this.transitionTo('login');
        }
    },
    /**
     * This hooks sets up the main and its child controllers.
     *
     * @method setupController
     * @param {String} controller
     * @param {Function} model
     * @return {Void}
     * @public
     */
    setupController: function(controller, model) {
        controller.set('model', model);
    },
    /**
     * This hooks gets the model for the route.
     *
     * @method model
     * @public
     */
    model() {
        var hash = {},
            self = this,
            controller = this.controllerFor('main'),
            user;
        hash.portal_name = this.get('session.data.authenticated.username');
        hash.portal_password = this.get('session.data.authenticated.password');
        user = this.store.queryRecord('contact', hash).catch(function(reason) {
            if (reason.code >= 400) {
                self.get('session').invalidate();
                self.transitionTo('login');
            }
        })
        user.then(function() {
            self.store.queryRecord('all-tasks', {}).then(function(response) {
                controller.set('allTasks', response.data);
            }).catch(function(reason) {
                if (reason.code >= 400) {
                    self.get('session').invalidate();
                    self.transitionTo('login');
                }
            });
        })
        return user;
    },

});
