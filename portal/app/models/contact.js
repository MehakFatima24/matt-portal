import DS from 'ember-data';
import {
    computed
} from '@ember/object';
export default DS.Model.extend({
    first_name: DS.attr(),
    name: DS.attr(),
    portal_password: DS.attr(),
    portal_username: DS.attr(),
    full_name: DS.attr(),
    email1: DS.attr(),
    phone_mobile: DS.attr(),
    status_c: DS.attr(),
    receive_sms_c: DS.attr('Boolean'),
    receive_emails_c: DS.attr('Boolean'),

    status: computed('status_c', function() {
        let status = this.get('status_c');
        switch (status) {
            case 'awaiting_documents':
                return '20';
            case 'dbq_needs_completing':
                return '60';
            case 'client_paid_in_full':
                return '100';
            default:
                return '0';
        }
    }),
});
