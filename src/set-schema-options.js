export default function(schema, options) {
  for (const key in options) {
    if (options.hasOwnProperty(key)) {
      schema.set(key, options[key]);
    }
  }
}
