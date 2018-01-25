/*jslint node:true */
'use strict';

module.exports = function (schema, mongoose) {
    mongoose = mongoose || require('mongoose');

    var clonedSchema = new mongoose.Schema();

    schema.eachPath(function (key, path) {
        if (key !== '_id') {
            var clonedPath = {};

            clonedPath[key] = path.options;
            clonedPath[key].unique = false;
            clonedPath[key].index = false;
	        clonedPath[key].set = function(value) {
		        return value;
	        };

            clonedSchema.add(clonedPath);
        }
    });

    return clonedSchema;
};
