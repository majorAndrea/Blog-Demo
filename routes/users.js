const express = require("express");
const router = express.Router();
const {
  validateUser,
  validateUserUpdate,
} = require("../utils/val-middleware.js");
const users = require("../controllers/users.js");
const Auth = require("../controllers/auth.js");
const multer = require("multer");
const { storage } = require("../cloudinary");
const upload = multer({ storage });

router.get("/login", users.renderLogin);

// --- USER DASHBOARD -------------------------
router.get(
  "/:username/dashboard",
  Auth.Privileges.requireAuthentication({
    failureMsg: "You are not logged in!",
    failureRedirect: "/users/login",
  }),
  Auth.Privileges.isAuthorized("user-actions", {
    failureMsg: "You are not allowed to see this page.",
  }),
  users.renderDashboard
);

router.get("/register", users.renderRegister);

// --- USER PUBLIC PROFILE --------------------
router.get(
  "/:username",
  Auth.Privileges.requireAuthentication({
    failureMsg: "You are not logged in!",
    failureRedirect: "/users/login",
  }),
  users.renderProfile
);

router.post("/login", users.loginUser);

router.post("/logout", users.logoutUser);

// --- USER UPDATE PROFILE ---------------------
router.patch(
  "/:username",
  Auth.Privileges.requireAuthentication({
    failureMsg: "You are not logged in!",
    failureRedirect: "/users/login",
  }),
  Auth.Privileges.isAuthorized("user-actions", {
    failureMsg: "You are not allowed to do that.",
  }),
  upload.single("user[image]"),
  validateUserUpdate,
  users.updateUser
);

router.post("/register", validateUser, users.registerUser);

module.exports = router;
