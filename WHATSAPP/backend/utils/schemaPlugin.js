// Makes documents serialise with a string `id` (instead of `_id` / `__v`),
// so API responses keep the same `id` field shape as before.
export const applyJsonTransform = (schema) => {
  const transform = (doc, ret) => {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    return ret;
  };
  schema.set("toJSON", { transform });
  schema.set("toObject", { transform });
};
