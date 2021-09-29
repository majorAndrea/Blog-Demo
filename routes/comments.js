const express = require("express");
const router = express.Router({ mergeParams: true });
const { validateComment } = require("../middlewares/validation-middlewares.js");
const comments = require("../controllers/comments.js");
const Auth = require("../services/auth.js");

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
