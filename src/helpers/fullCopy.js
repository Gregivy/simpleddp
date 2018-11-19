export const fullCopy = function (o) {
  var output, v, key;
  output = Array.isArray(o) ? [] : {};
  for (key in o) {
    v = o[key];
    output[key] = (typeof v === "object" && v !== null) ? fullCopy(v) : v;
  }
  return output;
}
