const express = require("express");
const router = express.Router({ mergeParams: true });
const { validateComment } = require("../utils/val-middleware.js");
const comments = require("../controllers/comments.js");
const Auth = require("../controllers/auth.js");

router.post(
  "/",
  Auth.Privileges.requireAuthentication({
    failureMsg: "You are not logged in!",
    failureRedirect: "/login",
  }),
  validateComment,
  comments.createComment
);

router.delete(
  "/:commentId",
  Auth.Privileges.requireAuthentication({
    failureMsg: "You are not logged in!",
    failureRedirect: "/login",
  }),
  Auth.Privileges.isAuthorized("comment", {
    failureMsg: "You are not allowed to delete this comment!",
  }),
  comments.deleteComment
);

module.exports = router;
