import DS from 'ember-data';

export default DS.Model.extend({
 tasks: DS.hasMany('task'),
});
