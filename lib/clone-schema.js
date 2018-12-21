/*jslint node:true */
'use strict';

module.exports = function (schema, mongoose) {
    mongoose = mongoose || require('mongoose');

    var clonedSchema = new mongoose.Schema();

    schema.eachPath(function (key, path) {
        if (key !== '_id') {
          var clonedPath = {};

          clonedPath[key] = path.options;
          delete clonedPath[key].index;
          delete clonedPath[key].unique;
          delete clonedPath[key].sparse;
          clonedPath[key]._index = null;

          clonedSchema.add(clonedPath);
        }
    });

    return clonedSchema;
};
