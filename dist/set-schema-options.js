"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

function _default(schema, options) {
  for (const key in options) {
    if (options.hasOwnProperty(key)) {
      schema.set(key, options[key]);
    }
  }
}