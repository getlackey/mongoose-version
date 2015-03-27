/*jslint node:true, unparam:true */
/*global describe, it*/
'use strict';

var cloneSchema = require('../lib/clone-schema'),
    mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    expect = require('chai').expect,
    selectPaths;

selectPaths = function (schema) {
    var paths = [];
    schema.eachPath(function (key, path) {
        paths.push(path);
    });

    return paths;
};

describe('clone-schema', function () {
    it('should clone schema', function () {
        var testSchema = new Schema({
                name: String,
                date: Date
            }),
            cloned = cloneSchema(testSchema);

        return expect(cloned).to.exist;
    });

    it('should clone all schema path', function () {
        var testSchema = new Schema({
                name: String,
                date: Date
            }),
            cloned = cloneSchema(testSchema),
            paths = selectPaths(cloned);

        expect(paths.length).to.equal(3); // 2 fields plus _id
    });

    it('should clone all schema path with correct data types', function () {
        var testSchema = new Schema({
                name: String,
                date: Date
            }),
            cloned = cloneSchema(testSchema),
            namePath = cloned.path('name'),
            datePath = cloned.path('date');

        expect(namePath.options.type).to.equal(String);
        expect(datePath.options.type).to.equal(Date);
    });

    it('should clone all schema path with required validators', function () {
        var testSchema = new Schema({
                name: {
                    type: String,
                    required: true
                },
                date: {
                    type: Date,
                    required: true
                }
            }),
            cloned = cloneSchema(testSchema),
            namePath = cloned.path('name'),
            datePath = cloned.path('date');

        expect(namePath.options.required).to.equal(true);
        expect(namePath.validators.length).to.equal(1);

        expect(datePath.options.required).to.equal(true);
        expect(datePath.validators.length).to.equal(1);
    });

    it('should clone all schema path with custom validators', function () {
        function validator(val) {
            return val;
        }

        var testSchema = new Schema({
                name: {
                    type: String,
                    validate: validator
                },
                date: {
                    type: Date,
                    validate: validator
                }
            }),
            cloned = cloneSchema(testSchema),
            namePath = cloned.path('name'),
            datePath = cloned.path('date');

        expect(namePath.options.validate).to.equal(validator);
        expect(namePath.validators.length).to.equal(1);

        expect(datePath.options.validate).to.equal(validator);
        expect(datePath.validators.length).to.equal(1);
    });
});