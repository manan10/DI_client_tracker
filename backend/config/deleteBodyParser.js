/**
 * Intercepts DELETE requests before express.json()
 * to safely handle zero-length and stringified "null" bodies.
 */
const deleteBodyParser = (req, res, next) => {
  if (req.method !== "DELETE") {
    return next();
  }

  const contentLength = req.headers["content-length"];
  if (contentLength === "0" || contentLength === undefined) {
    req.body = {};
    return next();
  }

  let data = "";
  req.on("data", (chunk) => {
    data += chunk;
  });

  req.on("end", () => {
    const trimmedData = data.trim();
    if (trimmedData === "null" || trimmedData === "") {
      req.body = {};
      req._body = true;
    } else {
      try {
        if (req.headers["content-type"] === "application/json") {
          req.body = JSON.parse(trimmedData);
          req._body = true;
        }
      } catch (e) {
        console.warn("⚠️ Manual JSON parse failed in DELETE middleware");
      }
    }
    next();
  });
};

module.exports = deleteBodyParser;