import Controller from '@ember/controller';
import { inject } from '@ember/service';
import  {
    computed
} from '@ember/object';
import {
    isEmpty
} from '@ember/utils';
export default Controller.extend({
  /**
   * Session Object.
   *
   * @property session
   * @type {Object}
   * @public
   */
  session: inject('session'),
  /**
   * This flag renders the tasks once they have been initialized.
   *
   * @property taskFlag
   * @type {Boolean}
   * @public
   */
  taskFlag: computed('allTasks', function(){
    if(!isEmpty(this.get('allTasks'))){
      return true;
    } else{
      return false;
    }
  }),
  actions:{
    /**
    * This action invalidates the session and redirects the user to the Login Route.
    *
    * @method invalidateSession
    * @public
    */
    invalidateSession: function() {
      this.get('session').invalidate();
      this.set('allTasks', '');
      this.transitionToRoute('login');
    },
  }
});
