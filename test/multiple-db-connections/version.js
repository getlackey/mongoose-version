var expect = require('chai').expect;
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var mongotest = require('./mongotest');
var version = require('../../lib/version');

describe('version', function () {
    beforeEach(mongotest.prepareDb('mongodb://localhost/mongoose_version_tests'));
    afterEach(mongotest.disconnect());

    describe('#VersionModel', function () {
        it('should expose a version model in the original schema', function () {
            var testSchema = new Schema();
            testSchema.plugin(version, {
                collection: 'should_expose_version_model_versions'
            });

            var Test = mongotest.connection.model('should_expose_version_model', testSchema);

            expect(Test.VersionedModel).to.be.ok;
        });
    });

    it('should save a version model when saving origin model', function (done) {
        var testSchema = new Schema({
            name: String
        });
        testSchema.plugin(version, {
            collection: 'should_save_version_of_origin_model_versions'
        });

        var Test = mongotest.connection.model('should_save_version_of_origin_model', testSchema);

        var test = new Test({
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
        });
        testSchema.plugin(version, 'should_accept_string');

        var Test = mongotest.connection.model('should_accept_string_origin_model', testSchema);

        expect(Test.VersionedModel.collection.name).to.equal('should_accept_string');
    });

    it('should save a version model in a collection when using "collection" strategy', function (done) {
        var testSchema = new Schema({
            name: String,
            desc: String
        });
        testSchema.plugin(version, {
            strategy: 'collection',
            collection: 'should_save_version_in_collection'
        });

        var Test = mongotest.connection.model('should_save_version_in_collection_origin_model', testSchema);

        var test = new Test({
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
                            return m.desc == 'A lunar crater'
                        }).length).to.equal(1);

                        done();
                    });
                });
            });
        });
    });
});