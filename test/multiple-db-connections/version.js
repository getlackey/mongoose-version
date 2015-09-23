/*jslint node:true */
/*global describe, it, beforeEach, afterEach*/
'use strict';

var expect = require('chai').expect,
    mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    mongotest = require('./mongotest'),
    version = require('../../lib/version');

describe('version', function () {
    var dbconn = (process.env.BOXEN_MONGODB_URL || 'mongodb://localhost/');
    beforeEach(mongotest.prepareDb(dbconn + 'mongoose_version_tests'));
    afterEach(mongotest.disconnect());

    describe('#VersionModel', function () {
        it('should expose a version model in the original schema', function () {
            var testSchema = new Schema(),
                Test;

            testSchema.plugin(version, {
                collection: 'should_expose_version_model_versions'
            });

            Test = mongotest.connection.model('should_expose_version_model', testSchema);

            expect(Test.VersionedModel).to.be.ok;
        });
    });

    it('should save a version model when saving origin model', function (done) {
        var testSchema = new Schema({
                name: String
            }),
            Test,
            test;

        testSchema.plugin(version, {
            collection: 'should_save_version_of_origin_model_versions'
        });

        Test = mongotest.connection.model('should_save_version_of_origin_model', testSchema);

        test = new Test({
            name: 'franz'
        });

        test.save(function (err) {
            expect(err).to.not.exist;

            Test.VersionedModel.find({
                refId: test._id,
                refVersion: test.__v
            }, function (err, versionedModel) {
                expect(err).to.not.exist;
                expect(versionedModel).to.be.ok;

                done();
            });
        });
    });

    it('should accept options as string', function () {
        var testSchema = new Schema({
                name: String
            }),
            Test;

        testSchema.plugin(version, 'should_accept_string');

        Test = mongotest.connection.model('should_accept_string_origin_model', testSchema);

        expect(Test.VersionedModel.collection.name).to.equal('should_accept_string');
    });

    it('should save a version model in a collection when using "collection" strategy', function (done) {
        var testSchema = new Schema({
                name: String,
                desc: String
            }),
            Test,
            test;

        testSchema.plugin(version, {
            strategy: 'collection',
            collection: 'should_save_version_in_collection'
        });

        Test = mongotest.connection.model('should_save_version_in_collection_origin_model', testSchema);

        test = new Test({
            name: 'franz'
        });

        test.save(function (err) {
            expect(err).to.not.exist;

            Test.VersionedModel.find({
                refId: test._id
            }, function (err, versionedModels) {
                expect(err).to.not.exist;
                expect(versionedModels).to.be.ok;

                expect(versionedModels.length).to.equal(1);

                test.desc = 'A lunar crater';
                test.save(function (err) {
                    expect(err).to.not.exist;

                    Test.VersionedModel.find({
                        refId: test._id
                    }, function (err, versionedModels) {
                        expect(err).to.not.exist;
                        expect(versionedModels).to.be.ok;

                        expect(versionedModels.length).to.equal(2);

                        // One of them should have the new property
                        expect(versionedModels.filter(function (m) {
                            return m.desc === 'A lunar crater';
                        }).length).to.equal(1);

                        done();
                    });
                });
            });
        });
    });
});