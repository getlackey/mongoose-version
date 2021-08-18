# @streethub/mongoose-version

`@streethub/mongoose-version` is a mongoose plugin to add [Document Versioning](https://www.mongodb.com/blog/post/building-with-patterns-the-document-versioning-pattern) to a mongoose's Schema.

The documents for a given Schema are versioned in a separate collection before being saving.

## Installation

```bash
$ npm install @streethub/mongoose-version
```

## Usage

```js
const mongoose = require("mongoose");
const version = require("@streethub/mongoose-version");

const Page = new mongoose.Schema({
    title: String,
    content: String,
});

Page.plugin(version);
```

This plugin will clone the original Schema and add a field called `refId` pointing to the original model, and a version array containing cloned copies of the backed up model.

Mongoose-version will add a static field to Page, that is "VersionedModel" that can be used to access the versioned
model of page, for example for querying old versions of a document.

### Options

| Option        | Default      | Description |
| -----------   | -----------  | ----------- |
| collection    | `"versions"` | The name of the collection to persist versions. You must add this option if you're using this plugin on more than one schema. Otherwise, all schemas will have the same versions' collection |
| suppressVersionIncrement | `true` | Suppress increment of the version of the saved model before saving the model |
| mongoose | `require("mongoose")` | Pass a mongoose instance to work with |
| removeVersions | `false` | Remove all the versions when original document is removed |


Options are passed to the cloned Schema as settings. Therefore, you can also pass any of the [Schema's options supported by mongoose](http://mongoosejs.com/docs/guide.html#options). A shorthand is available in case you only want to customise the collection's name. Otherwise, pass an options object as the second argument of the plugin.

```js
Page.plugin(version, 'page_revisions');

// is the same as

Page.plugin(version, {
    collection: 'page_revisions'
});
```

## Test

This plugin uses `mocha` to run the tests.

```bash
$ npm run test
```

## Debug

This plugin uses the [debug](https://github.com/visionmedia/debug) to display debug messages. You can enable it by setting the
`DEBUG` environment variable to `mongoose:version`.

```bash
$ DEBUG=mongoose:version
```

Debug messages appear if a version was persisted to MongoDB or if a version was removed from MongoDB.