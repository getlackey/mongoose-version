/*jslint node:true */
'use strict';

var saveCollection = require('./save-collection');

module.exports = function (schema, options) {
    if (typeof (options) == 'string') {
        options = {
            collection: options
        };
    }

    options = options || {};
    options.collection = options.collection || 'versions';
    options.suppressVersionIncrement = options.suppressVersionIncrement !== false;
    options.mongoose = options.mongoose || require('mongoose');
    options.removeVersions = !!options.removeVersions;

    saveCollection(schema, options);
};