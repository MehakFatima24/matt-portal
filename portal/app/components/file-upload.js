import Component from '@ember/component';
import $ from 'jquery';
import {
    inject
} from '@ember/service';
import ENV from '../config/environment';
import swal from 'sweetalert';
import {
    later
} from '@ember/runloop';

export default Component.extend({
    /**
     * Session Object.
     *
     * @property session
     * @type {Object}
     * @public
     */
    session: inject('session'),
    /**
     * API Host Name.
     *
     * @property host
     * @type String
     * @public
     */
    host: ENV.api.host,
    /**
     * Property to access the translation service.
     *
     * @property i18n
     * @type Ember.service
     * @public
     */
    i18n: inject(),
    /**
     * This method sends a call to sugar-API to create a document template so the file can be uploaded in it,
     * it return the ID of the created document.
     *
     * @method createDocument
     * @param  {String} filename
     * @return {Void}
     * @public
     */
    createDocument: function(filename, file) {
        var self = this,
            oauth_token = this.session.data.authenticated.access_token,
            host = this.get('host'),
            user_id = this.session.data.authenticated.user_id;
        $.ajax({
            url: `${host}/Contacts/${user_id}/link/documents`,
            beforeSend: function(request) {
                request.setRequestHeader('OAuth-Token', oauth_token);
            },
            data: {
                name: filename
            },
            method: 'POST',
            type: 'POST',
            success: function(data) {
                self.set('doc_id', data.related_record.id);
                self.document_upload(file);
            }
        }).catch(function() {
            self.failure_alert();
        });

    },
    /**
     * This method sends a call to sugar-API to delete the document template.
     *
     * @method deleteDocument
     * @param  {String} document_id
     * @return {Void}
     * @public
     */
    deleteDocument: function(document_id) {
        var self = this,
            oauth_token = this.session.data.authenticated.access_token,
            host = this.get('host'),
            user_id = this.session.data.authenticated.user_id;
        $.ajax({
            url: `${host}/Documents/${document_id}`,
            beforeSend: function(request) {
                request.setRequestHeader("OAuth-Token", oauth_token);
            },
            method: 'DELETE',
            type: 'DELETE', // For jQuery < 1.9
            success: function() {
                self.failure_alert();
            }
        });
    },
    /**
     * This method uploads the file to the sugar-API through the Ajax call. and
     * displays the respective alerts based on the response.
     *
     * @method document_upload
     * @param  {Object} file
     * @return {Void}
     * @public
     */
    document_upload: function(file) {
        var formData = new FormData(),
            oauth_token = this.session.data.authenticated.access_token,
            host = this.get('host'),
            doc_id = this.get('doc_id');
        formData.append('filename', file),
            self = this;
        if (doc_id) {
            $.ajax({
                url: `${host}/Documents/${doc_id}/file/filename`,
                data: formData,
                beforeSend: function(request) {
                    request.setRequestHeader('OAuth-Token', oauth_token);
                },
                cache: false,
                contentType: false,
                processData: false,
                method: 'POST',
                type: 'POST',
                success: function() {
                    $('#filename').val('');
                    self.success_alert();
                }
            }).catch(function() {
                self.deleteDocument(doc_id);
            });
        } else {
            self.failure_alert();
        }
    },
    /**
     *This method displays the sweet alert that file upload successful.
     *
     * @method success_alert
     * @return {Void}
     * @public
     */
    success_alert: function() {
        var message = this.get('i18n').t('main.file_upload.successful');
        var sa = {
            title: message,
            type: 'success',
            showConfirmButton: false,
            timer: 2000,
        };
        swal(sa);
    },
    /**
     *This method displays the sweet alert that file upload failed.
     *
     * @method failure_alert
     * @return {Void}
     * @public
     */
    failure_alert: function() {
        var message = this.get('i18n').t('main.file_upload.fail');
        var sa = {
            title: message,
            type: 'error',
            showConfirmButton: false,
            timer: 2000,
        };
        swal(sa);
    },

    /**
     *This method displays the sweet alert that no file is selected to be uploaded
     *
     * @method failure_alert
     * @return {Void}
     * @public
     */
    warning_alert: function() {
        var message = this.get('i18n').t('main.file_upload.no_file');
        var sa = {
            title: message,
            type: 'warning',
            showConfirmButton: false,
            timer: 2000,
        };
        swal(sa);
    },
    actions: {
        /**
         * This method displays the processing alert and calls the createDocument method.
         *
         * @method fileUpload
         * @return {Void}
         * @public
         */
        fileUpload: function() {
            var self = this,
                sa = {
                    title: this.get('i18n').t('sweet_alerts.processing'),
                    showConfirmButton: false,
                },
                file = $('#filename')[0].files[0];
            swal(sa);
            if (file) {
                this.createDocument(file.name, file);
            } else {
                this.warning_alert();
            }
        }
    }
});
