'use strict';

/**
 * form router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::form.form',{
    config: {
        find: {
            auth: false
        }
    }
});
