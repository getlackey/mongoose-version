/*jslint node:true */
'use strict';

var debug = require('debug')('mongoose:version'),
    xtend = require('xtend'),
    cloneSchema = require('./clone-schema'),
    setSchemaOptions = require('./set-schema-options'),
    VersionError = require('mongoose/lib/error/version');

module.exports = function (schema, options) {
    var versionedSchema = cloneSchema(schema, options.mongoose),
        mongoose = options.mongoose,
        ObjectId = mongoose.Schema.Types.ObjectId;

    setSchemaOptions(versionedSchema, options);

    versionedSchema.add({
        refId: {
          type: ObjectId,
          index: true
        },
        refVersion: {
          type: Number,
          index: true
        }
    });

    versionedSchema.index({ refId:1, refVersion:1 });

    // Add reference to model to original schema
    schema.statics.VersionedModel = {};

    schema.on('init', function (Model) {
        var VersionedModel = Model.db.model(options.collection, versionedSchema);
        VersionedModel.ensureIndexes(function (err) {
          if (err) debug('ENSURE INDEX', err)
        });
        VersionedModel.on('index', function (err) {
          if (err) debug('INDEX', err)
        });

        // Add reference to model to original schema
        schema.statics.VersionedModel = VersionedModel;
        Model.VersionedModel = VersionedModel;
    });

    schema.pre('save', function (next) {
        if (!options.suppressVersionIncrement) {
            var self = this;
            self.increment(); // Increment origins version

            // Checks for version conflict
            schema.statics.VersionedModel.find({
                refId: self._id,
                refVersion: { $exists: true } // keep it backwards compatible
            })
            .sort({ refVersion: -1 })
            .limit(1)
            .exec(function(err, docs){
                if (docs.length !== 0 && docs[0].refVersion > (self._doc[schema.options.versionKey] || 0)) {
                  var err = new VersionError();
                  debug(err);
                  return next(err);
                }

                createVersion.call(self, next);
            });
        } else {
            createVersion.call(this, next);
        }
    });

    function createVersion(next){
        var clone = xtend(this._doc);

        delete clone._id;
        // Saves current document version, first time to 0
        clone.refVersion = typeof this._doc[schema.options.versionKey] === 'undefined' ? 0 : this._doc[schema.options.versionKey] + 1; // we are in the prehook so need to increment
        clone.refId = this._id; // Sets origins document id as a reference

        new schema.statics.VersionedModel(clone).save(function (err) {
            if (err) {
                debug(err);
            } else {
                debug('Created versioned model in mongodb');
            }

            next();
        });
    }

    // schema.post('save', function (doc) {
    //     console.log('called');
    //     var clone = xtend(doc);
    //
    //     delete clone._id;
    //     // Saves current document version, first time to 0
    //     clone.refVersion = typeof doc[schema.options.versionKey] === 'undefined' ? 0 : doc[schema.options.versionKey] + 1; // we are in the prehook so need to increment
    //     clone.refId = doc._id; // Sets origins document id as a reference
    //
    //     new schema.statics.VersionedModel(clone).save(function (err) {
    //         if (err) {
    //             debug(err);
    //         } else {
    //             debug('Created versioned model in mongodb');
    //         }
    //
    //         // next();
    //     });
    // })

    schema.pre('remove', function (next) {
        if (!options.removeVersions) {
            return next();
        }

        schema.statics.VersionedModel.remove({
            refId: this._id
        }, function (err) {
            if (err) {
                debug(err);
            } else {
                debug('Removed versioned model from mongodb');
            }

            next();
        });
    });
};
