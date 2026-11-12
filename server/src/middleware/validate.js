const ApiError = require("../utils/ApiError");

// validate(schema, "body" | "query" | "params") — replaces the target with parsed (and stripped) data.
const validate =
  (schema, source = "body") =>
  (req, _res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const details = result.error.issues.map((i) => ({ path: i.path.join("."), message: i.message }));
      return next(new ApiError(400, "Validation failed", details));
    }
    if (source === "query") {
      // req.query is a getter in some setups; copy parsed values onto it.
      Object.keys(req.query).forEach((k) => delete req.query[k]);
      Object.assign(req.query, result.data);
    } else {
      req[source] = result.data;
    }
    next();
  };

module.exports = validate;
