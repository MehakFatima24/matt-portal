import Component from '@ember/component';
import $ from 'jquery';
export default Component.extend({
  /**
   *This method is triggered after the template has been rendered it initializes the list.
   *
   * @method didRender
   * @return {Void}
   * @public
   */
  didRender: function(){
    new List('test-list', {
      page: 5,
      pagination: true
    });
    $('#test-list > input').addClass('hidden');
  },

});
