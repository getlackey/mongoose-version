import {Schema} from "mongoose";
import assert from "assert";

import cloneSchema from "../src/clone-schema";


const selectPaths = function(schema) {
  const paths = [];
  schema.eachPath(function(key, path) {
    paths.push(path);
  });
  return paths;
};

describe("clone-schema", function() {
  it("should clone schema", () => {
    const testSchema = new Schema({
      name: String,
      date: Date,
    });
    const cloned = cloneSchema(testSchema);

    assert.ok(cloned);
  });

  it("should clone all schema path", () => {
    const testSchema = new Schema({
      name: String,
      date: Date,
    });
    const cloned = cloneSchema(testSchema);
    const paths = selectPaths(cloned);

    assert.strictEqual(paths.length, 3); // 2 fields plus _id
  });

  it("should clone all schema path with correct data types", () => {
    const testSchema = new Schema({
      name: String,
      date: Date,
    });
    const cloned = cloneSchema(testSchema);
    const namePath = cloned.path("name");
    const datePath = cloned.path("date");

    assert.strictEqual(namePath.options.type, String);
    assert.strictEqual(datePath.options.type, Date);
  });

  it("should clone all schema path with required validators", () => {
    const testSchema = new Schema({
      name: {
        type: String,
        required: true,
      },
      date: {
        type: Date,
        required: true,
      },
    });
    const cloned = cloneSchema(testSchema);
    const namePath = cloned.path("name");
    const datePath = cloned.path("date");

    assert.strictEqual(namePath.options.required, true);
    assert.strictEqual(namePath.validators.length, 1);
    assert.strictEqual(datePath.options.required, true);
    assert.strictEqual(datePath.validators.length, 1);
  });

  it("should clone all schema path with custom validators", () => {
    function validator(val) {
      return val;
    }

    const testSchema = new Schema({
      name: {
        type: String,
        validate: validator,
      },
      date: {
        type: Date,
        validate: validator,
      },
    });
    const cloned = cloneSchema(testSchema);
    const namePath = cloned.path("name");
    const datePath = cloned.path("date");

    assert.strictEqual(namePath.options.validate, validator);
    assert.strictEqual(namePath.validators.length, 1);
    assert.strictEqual(datePath.options.validate, validator);
    assert.strictEqual(datePath.validators.length, 1);
  });
});
