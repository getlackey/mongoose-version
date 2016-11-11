/*jslint node:true, expr: true*/
/*global describe, it, beforeEach, afterEach*/
'use strict';

var expect = require('chai').expect,
    Bluebird = require('bluebird'),
    mongoose = Bluebird.promisifyAll(require('mongoose')),
    Schema = mongoose.Schema,
    mongotest = require('./mongotest'),
    version = require('../../lib/version'),
    VersionError = require('mongoose/lib/error/version');

describe('version', function () {
    beforeEach(mongotest.prepareDb('mongodb://localhost/mongoose_version_tests'));
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

            Test.VersionedModel.findOne({
                refId: test._id,
                refVersion: test.__v
            }, function (err, versionedModel) {
                expect(err).to.not.exist;
                expect(versionedModel).to.be.ok;
                expect(versionedModel).to.have.a.property('name', 'franz');
                expect(versionedModel).to.have.a.property('__v', 0);

                done();
            });
        });
    });

    it('should NOT save a version model when saving origin model fails', function (done) {
        var testSchema = new Schema({
                name: String
            }),
            Test,
            test;

        testSchema.plugin(version, {
            collection: 'should_save_version_of_origin_model_versions',
            suppressVersionIncrement: false // let's increment the version on updates
        });

        Test = mongotest.connection.model('should_save_version_of_origin_model', testSchema);

        test = new Test({
            name: 'franz'
        });

        test.saveAsync()
        .then(function (doc) {
            expect(doc).to.have.a.property('__v', 0);
        })
        .then(function(){
            return Test.VersionedModel.findAsync({
                refId: test._id,
            })
            .then(function (versionedModels) {
                expect(versionedModels).to.have.a.lengthOf(1);
                expect(versionedModels[0]).to.be.ok;
                expect(versionedModels[0]).to.have.a.property('name', 'franz');
                expect(versionedModels[0]).to.have.a.property('refVersion', 0);
            });
        })
        .then(function () {
            test.name = 'Franz I';
            test.__v = 0;
            return test.saveAsync()
            .then(function (doc) {
                expect(doc).to.have.a.property('__v', 1);
            });
        })
        .then(function () {
            return Test.VersionedModel.findAsync({
                refId: test._id
            })
            .then(function (versionedModels) {
                expect(versionedModels).to.have.a.lengthOf(2);
                expect(versionedModels[0]).to.be.ok;
                expect(versionedModels[0]).to.have.a.property('name', 'franz');
                expect(versionedModels[0]).to.have.a.property('refVersion', 0);
                expect(versionedModels[1]).to.be.ok;
                expect(versionedModels[1]).to.have.a.property('name', 'Franz I');
                expect(versionedModels[1]).to.have.a.property('refVersion', 1);
            });
        })
        .then(function () {
            test.name = 'Franz Invalid';
            test.__v = 0; // create a version conflict
            return test.saveAsync()
            .then(function(){ expect(false).to.be.ok; }) // should not happen
            .catch(VersionError, function(err){
                expect(err.name).to.eql('VersionError');
            });
        })
        .then(function () {
            return Test.VersionedModel.findAsync({
                refId: test._id
            })
            .then(function (versionedModels) {
                expect(versionedModels).to.have.a.lengthOf(2);
            });
        })
        .then(done.bind(this, null))
        .catch(done);
    });

    it('should save the correct version, defined at the versionKey of the origin model', function (done) {
        var testSchema = new Schema({
                name: String
            },
            {
                versionKey: '__version' // define a custom one
            }),
            Test,
            test;

        testSchema.plugin(version, {
            collection: 'should_save_version_of_origin_model_versions',
            suppressVersionIncrement: false // let's increment the version on updates
        });

        Test = mongotest.connection.model('should_save_version_of_origin_model', testSchema);

        test = new Test({
            name: 'franz'
        });

        test.saveAsync()
        .then(function() {
            expect(test).to.have.a.property('__version', 0);

            return Test.VersionedModel.findOneAsync({
                refId: test._id,
                refVersion: test.__version
            });
        })
        .then(function (versionedModel) {
            expect(versionedModel).to.be.ok;
            expect(versionedModel).to.have.a.property('name', 'franz');
            expect(versionedModel).to.have.a.property('refVersion', 0);

            test.name = 'Franz I';
            return test.saveAsync();
        })
        .then(function () {
            expect(test).to.have.a.property('name', 'Franz I');
            expect(test).to.have.a.property('__version', 1);

            return Test.VersionedModel.findOneAsync({
                refId: test._id,
                refVersion: test.__version
            });
        })
        .then(function (updatedVersionedModel) {
            expect(updatedVersionedModel).to.be.ok;
            expect(updatedVersionedModel).to.have.a.property('name', 'Franz I');
            expect(updatedVersionedModel).to.have.a.property('refVersion', 1);

            test.name = 'Franz II'
            return test.saveAsync();
        })
        .then(function () {
            expect(test).to.have.a.property('name', 'Franz II');
            expect(test).to.have.a.property('__version', 2);

            return Test.VersionedModel.findOneAsync({
                refId: test._id,
                refVersion: test.__version
            });
        })
        .then(function (updatedVersionedModel) {
            expect(updatedVersionedModel).to.be.ok;
            expect(updatedVersionedModel).to.have.a.property('name', 'Franz II');
            expect(updatedVersionedModel).to.have.a.property('refVersion', 2);
        })
        .then(done.bind(this, null)).catch(done);
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
