const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const geocodingClient = mbxGeocoding({
  accessToken: process.env.MAPBOX_PUBLIC_TOKEN,
});
const asyncHandler = require("../utils/async-handler.js");

const geocode = asyncHandler(async (req, res, next) => {
  if (req.body.post.location) {
    const response = await geocodingClient
      .forwardGeocode({
        query: req.body.post.location,
        limit: 1,
      })
      .send();

    if (response.body.features.length) {
      const data = {};
      data.geometry = response.body.features[0].geometry;
      data.placename = req.body.post.location;
      req.body.post.location = data;

      next();
    } else {
      const redirectInfo = {
        path: `${
          req.method === "POST" ? "posts/new" : `${req.params.id}/edit`
        }`,
        data: (() => {
          if (req.method === "POST") {
            // Return the post data only for POST requests.
            return req.body.post;
          }
          return null;
        })(),
      };
      next({
        status: 422,
        message:
          "The location you entered does not exists, please choose another one or do not use the location field!",
        redirectInfo,
      });
    }
  } else {
    return next();
  }
});

module.exports = { geocode };
