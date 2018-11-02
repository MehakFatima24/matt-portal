'use strict';

module.exports = function(environment) {
    let ENV = {
        modulePrefix: 'crm-portal',
        environment,
        rootURL: '/',
        locationType: 'hash',
        username: 'guillermo',
        password: '89xySm1',
        EmberENV: {
            FEATURES: {},
            EXTEND_PROTOTYPES: {
                // Prevent Ember Data from overriding Date.parse.
                Date: false
            }
        },

        APP: {
            // flags/options to application instance
            usingCors: false,
            corsWithCreds: false,
        },

        api: {
            grant_type: 'password',
            clientId: 'sugar',
            clientSecret: '',

            host: "https://veteranadvantageenterprises.org/rest/v11_1",
            platform: 'custom_api',
        }
    };

    if (environment === 'development') {
        ENV.APP.usingCors = true;
        ENV.APP.corsWithCreds = true;
    }

    if (environment === 'test') {
        // Testem prefers this...
        ENV.locationType = 'none';

        // keep test console output quieter
        ENV.APP.LOG_ACTIVE_GENERATION = false;
        ENV.APP.LOG_VIEW_LOOKUPS = false;

        ENV.APP.rootElement = '#ember-testing';
        ENV.APP.autoboot = false;
    }

    if (environment === 'production') {
        //production-specific feature
        ENV.rootURL = '/clientportal';
    }
    ENV['ember-simple-auth'] = {
        authenticationRoute: 'login',
        routeAfterAuthentication: 'main',
        routeIfAlreadyAuthenticated: 'main'
    };

    ENV.i18n = {
        defaultLocale: 'en'
    };
    return ENV;
};
