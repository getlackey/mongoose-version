# Mongoose version

Lackey's Mongoose version is a mongoose plugin to save document data versions. Documents are saved to a "versioned" document collection before saving.

This module is a fork of [mongoose-version](https://github.com/saintedlama/mongoose-version). We needed to support multiple database connections and some other features incompatible with the original module.

## Installation

    $ npm install lackey-mongoose-version

## Usage
To use lackey-mongoose-version for an existing mongoose schema you'll have to require and plugin lackey-mongoose-version into the existing schema.

The following schema definition defines a "Page" schema, and uses mongoose-version plugin with default options

    var mongoose = require('mongoose'),
        Schema = mongoose.Schema,
        version = require('lackey-mongoose-version');
    
    var Page = new Schema({
        title : { type : String, required : true},
        content : { type : String, required : true },
        path : { type : String, required : true},
        tags : [String],
    
        lastModified : Date,
        created : Date
    });
    
    Page.plugin(version);

Lackey's Mongoose Backup will define a schema that has a refId field pointing to the original model and a version array containing cloned copies of the backed up model.

Mongoose-version will add a static field to Page, that is "VersionedModel" that can be used to access the versioned
model of page, for example for querying old versions of a document.

## Option keys and defaults
* collection: name of the collection to persist versions to. The default is 'versions'. You should supply this option if you're using mongoose-version on more than one schema.
* suppressVersionIncrement: mongoose-version will not increment the version of the saved model before saving the model by default. To turn on auto version increment set this option to false. Default: `true`
* strategy: mongoose-version allows versioned document to be saved as multiple documents in a collection or in a single document in a version array. In case you want to save documents in an array specify `array` strategy, for storing versioned documents in multiple documents specify `collection` strategy. Default `array`.
* maxVersions: Only valid for `array` strategy. Specifies how many historic versions of a document should be kept. Defaults to `Number.MAX_VALUE`.
* mongoose: Pass a mongoose instance to work with
* removeVersions: Removes versions when origin document is removed. Defaults to `false`
* ignorePaths: Defines an array of document field names that do not trigger a new version to be created when this field was changed. Only working with array strategy (default strategy). Defaults to `[]`.
* Options are passed to a newly created mongoose schemas as settings, so you may use any [option supported by mongoose](http://mongoosejs.com/docs/guide.html#options)

In case you only want to specify the collection name, you can pass a string instance to options that is taken as collection name. Options may be passed as follows:

    Page.plugin(version, { collection: 'Page__versions' });

## Misc

### Debug Messages

Mongoose-version uses the [debug module](https://github.com/visionmedia/debug) for debug messages. You can enable mongoose-version debug logs by setting the
`DEBUG` environment variable to `mongoose:version`.

    DEBUG=mongoose:version

Debug messages are logged if a version was persisted to mongodb or a version was removed from mongodb.