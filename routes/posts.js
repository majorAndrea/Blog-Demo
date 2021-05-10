const express = require("express");
const router = express.Router();
const { validatePost } = require("../utils/val-middleware.js");
const Auth = require("../controllers/auth.js");
const posts = require("../controllers/posts.js");
const multer = require("multer");
const { storage, fileFilter } = require("../cloudinary");
const upload = multer({
  storage,
  fileFilter,
});
const { geocode } = require("../mapbox/");

// ----- GET ROUTES ----------------->

router.get("/", posts.renderIndexPosts);

router.get(
  "/new",
  Auth.Privileges.requireAuthentication({
    failureMsg: "You are not logged in!",
    failureRedirect: "/users/login",
  }),
  posts.renderCreatePost
);

router.get("/:id", posts.readPost);

router.get(
  "/:id/edit",
  Auth.Privileges.requireAuthentication({
    failureMsg: "You are not logged in!",
    failureRedirect: "/users/login",
  }),
  Auth.Privileges.isAuthorized("posts", {
    failureMsg: "You are not allowed to edit this post!",
  }),
  posts.renderUpdatePost
);

router.get(
  "/:id/edit/image",
  Auth.Privileges.requireAuthentication({
    failureMsg: "You are not logged in!",
    failureRedirect: "/users/login",
  }),
  Auth.Privileges.isAuthorized("posts", {
    failureMsg: "You are not allowed to edit this post!",
  }),
  posts.renderUpdatePostImage
);

// ----- PATCH ROUTES ----------------->

router.patch(
  "/:id/image",
  Auth.Privileges.requireAuthentication({
    failureMsg: "You are not logged in!",
    failureRedirect: "/users/login",
  }),
  Auth.Privileges.isAuthorized("posts", {
    failureMsg: "You are not allowed to edit this post!",
  }),
  upload.single("post[image]"),
  posts.updatePostImage
);

// ----- PUT ROUTES ----------------->

router.put(
  "/:id",
  Auth.Privileges.requireAuthentication({
    failureMsg: "You are not logged in!",
    failureRedirect: "/users/login",
  }),
  Auth.Privileges.isAuthorized("posts", {
    failureMsg: "You are not allowed to edit this post!",
  }),
  validatePost,
  geocode,
  posts.updatePost
);

// ----- POST ROUTE ----------------->

router.post(
  "/",
  Auth.Privileges.requireAuthentication({
    failureMsg: "You are not logged in!",
    failureRedirect: "/users/login",
  }),
  upload.single("post[image]"),
  validatePost,
  geocode,
  posts.createPost
);

// ----- DELETE ROUTE ----------------->

router.delete(
  "/:id",
  Auth.Privileges.requireAuthentication({
    failureMsg: "You are not logged in!",
    failureRedirect: "/users/login",
  }),
  Auth.Privileges.isAuthorized("posts", {
    failureMsg: "You are not allowed to delete this post!",
    failureRedirect: "/posts",
  }),
  posts.deletePost
);

module.exports = router;
