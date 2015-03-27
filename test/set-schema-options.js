/*jslint node:true */
/*global describe, it*/
'use strict';

var setSchemaOptions = require('../lib/set-schema-options'),
    mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    expect = require('chai').expect;

describe('set-schema-options', function () {
    it('should set options for passed schema', function () {
        var testSchema = new Schema({
            name: String,
            date: Date
        });

        setSchemaOptions(testSchema, {
            option: true
        });

        expect(testSchema.get('option')).to.equal(true);
    });

    it('should set do nothing if no option object was passed as argument', function () {
        var testSchema = new Schema({
            name: String,
            date: Date
        });

        setSchemaOptions(testSchema);
    });
});