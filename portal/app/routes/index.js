import Route from '@ember/routing/route';
import { inject } from '@ember/service';

export default Route.extend({
  /**
   * Session Object.
   *
   * @property session
   * @type Object
   * @public
   */
  session: inject(),
  /**
  * This method checks if the user is authenticated or not, in case its not
  * it re-routes to the login page.
  *
  * @method beforeModel
  * @return {Void}
  */
  beforeModel:function(){
       this._super(...arguments);
       if(!this.get('session.isAuthenticated'))
       {
           this.transitionTo('login');
       }
       else{
           this.transitionTo('main');
       }
   },
 });
