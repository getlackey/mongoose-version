import assert from "assert";
import mongoose from "mongoose";


mongoose.set("useNewUrlParser", true);
mongoose.set("useFindAndModify", false);
mongoose.set("useCreateIndex", true);

function dropCollections(collections, index, cb) {
  if (typeof (index) == "function") {
    cb = index;
    index = 0;
  }

  if (index < collections.length) {
    module.exports.connection.db.dropCollection(collections[index], function(err) {
      assert.ifError(err);

      dropCollections(collections, index + 1, cb);
    });
  } else {
    cb();
  }
}

module.exports = {
  connection: {},
  prepareDb: function(connectionString, options) {
    options = options || {};
    options.timeout = options.timeout || 5000;
    return function(cb) {
      this.timeout(options.timeout);

      module.exports.connection = mongoose.createConnection(connectionString, function(err) {
        assert.ifError(err);

        module.exports.connection.db.collections(function(err, collections) {
          assert.ifError(err);

          const collectionsToDrop = collections
            .filter(function(col) {
              return col.collectionName.indexOf("system.") !== 0;
            })
            .map(function(col) {
              return col.collectionName;
            });

          dropCollections(collectionsToDrop, 0, cb);
        });
      });
    };
  },

  disconnect: function() {
    return function(cb) {
      mongoose.disconnect(cb);
    };
  },
};
