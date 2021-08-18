/*jslint node:true, nomen:true, unparam:true */
/*global describe, it, beforeEach, afterEach*/
'use strict';

var expect = require('chai').expect,
    mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    mongotest = require('./mongotest'),
    version = require('../../lib/version'),
    pageModel = require('../fixtures/page');

describe('multiple-db-connections > issues', function () {
    beforeEach(mongotest.prepareDb('mongodb://localhost/mongoose_version_issues_tests'));
    afterEach(mongotest.disconnect());

    it('should play nice with text search plugin', function (done) {
        var Page = pageModel(mongotest.connection),
            page = new Page({
                title: 'Title',
                content: 'content',
                path: '/path'
            });

        page.save(function (err) {
            expect(err).to.not.exist;

            Page.VersionedModel.findOne({
                refId: page._id
            }, function (err, versionedModel) {
                expect(err).to.not.exist;
                expect(versionedModel).to.be.ok;

                done();
            });
        });
    });

    it('should allow to create an empty versioned model', function (done) {
        var UserSchema = new Schema({}),
            User,
            user;

        UserSchema.plugin(version, {
            logError: true,
            collection: 'userVersions'
        });

        User = mongotest.connection.model('User', UserSchema);

        user = new User({});

        user.save(function (err) {
            expect(err).to.not.exist;

            User.VersionedModel.find({}, function (err, models) {
                expect(err).to.not.exist;
                expect(models).to.be.not.empty;

                done();
            });
        });
    });

    it('should delete versioned model when deleting the model', function (done) {
        var UserSchema = new Schema({}),
            User,
            user;

        UserSchema.plugin(version, {
            logError: true,
            removeVersions: true,
            collection: 'User_should_be_deleted_when_model_is_deleted_versions'
        });

        User = mongotest.connection.model('User_should_be_deleted_when_model_is_deleted', UserSchema);

        user = new User({});

        user.save(function (err) {
            expect(err).to.not.exist;

            user.remove(function (err) {
                expect(err).to.not.exist;

                User.VersionedModel.find({}, function (err, models) {
                    expect(err).to.not.exist;
                    expect(models).to.be.empty;

                    done();
                });
            });
        });
    });

    it('should delete versioned model when deleting the model in collection mode', function (done) {
        var UserSchema = new Schema({}),
            User,
            user;

        UserSchema.plugin(version, {
            logError: true,
            removeVersions: true,
            collection: 'User_should_be_deleted_when_model_is_deleted_in_collection_mode_versions',
            strategy: 'collection'
        });

        User = mongotest.connection.model('User_should_be_deleted_when_model_is_in_collection_mode_deleted', UserSchema);

        user = new User({});

        user.save(function (err) {
            expect(err).to.not.exist;

            user.remove(function (err) {
                expect(err).to.not.exist;

                User.VersionedModel.find({}, function (err, models) {
                    expect(err).to.not.exist;
                    expect(models).to.be.empty;

                    done();
                });
            });
        });
    });

    it('should ignore unique indexes in cloned model', function (done) {
        var UserSchema = new Schema({
                module: {
                    type: Schema.Types.ObjectId,
                    required: true
                },
                slug: {
                    type: String,
                    required: true
                }
            }),
            User,
            user;

        UserSchema.index({
            module: 1,
            slug: 1
        }, {
            unique: true
        });

        UserSchema.plugin(version, {
            logError: true,
            collection: 'User_should_ignore_indexes_in_cloned_model_versions'
        });

        User = mongotest.connection.model('User_should_ignore_indexes_in_cloned_model', UserSchema);

        user = new User({
            module: '538c5caa4f019dd4225fe4f7',
            slug: 'test-module'
        });

        user.save(function (err) {
            expect(err).to.not.exist;
            console.log('saved');

            user.remove(function (err) {
                expect(err).to.not.exist;
                var user = new User({
                    module: '538c5caa4f019dd4225fe4f7',
                    slug: 'test-module'
                });
                user.save(function (err, user) {
                    expect(err).to.not.exist;

                    User.VersionedModel.findOne({
                        refId: user._id
                    }, function (err, model) {
                        expect(err).to.not.exist;
                        expect(model).to.be.not.empty;

                        done();
                    });
                });
            });
        });
    });

    it('should not break when using the plugin with collection strategy #10', function () {
        var schema = new mongoose.Schema({
                title: {
                    type: String,
                    required: true,
                    trim: true
                },
                content: {
                    type: String,
                    trim: true
                }
            }),
            model;

        schema.plugin(version, {
            collection: 'PageVersionsCollectionIssue10'
        });

        model = mongotest.connection.model('PageIssue10CollectionStrategy', schema);

        expect(model).to.exist;
    });
});